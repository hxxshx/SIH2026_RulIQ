from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import ComplianceAlert, Application, Institution, AuditLog
from app.schemas.common import ResponseEnvelope
from app.schemas.alert import ComplianceAlertSchema, AlertResolveSchema

router = APIRouter()

def _map_alert(alert: ComplianceAlert) -> ComplianceAlertSchema:
    app_no = alert.application.application_number if alert.application else "N/A"
    inst_name = alert.application.institution.name if alert.application and alert.application.institution else "N/A"
    resolved_by_name = alert.resolved_by.full_name if alert.resolved_by else None

    return ComplianceAlertSchema(
        id=alert.id,
        applicationNumber=app_no,
        institutionName=inst_name,
        severity=alert.severity,
        alertType=alert.alert_type,
        message=alert.message,
        suggestedAction=alert.suggested_action,
        createdAt=alert.created_at,
        isResolved=alert.is_resolved,
        resolvedBy=resolved_by_name,
    )

@router.get("", response_model=ResponseEnvelope[List[ComplianceAlertSchema]])
def list_compliance_alerts(
    is_resolved: Optional[bool] = Query(None, description="Filter by resolution state"),
    severity: Optional[str] = Query(None, description="Filter by alert severity"),
    db: Session = Depends(get_db),
):
    """Lists compliance alerts with filtering by severity and resolution status."""
    query = db.query(ComplianceAlert).join(Application).join(Institution)

    if is_resolved is not None:
        query = query.filter(ComplianceAlert.is_resolved == is_resolved)

    if severity and severity != "all":
        query = query.filter(ComplianceAlert.severity == severity)

    alerts = query.order_by(ComplianceAlert.created_at.desc()).all()
    results = [_map_alert(a) for a in alerts]

    return ResponseEnvelope(success=True, data=results)

@router.patch("/{alert_id}/resolve", response_model=ResponseEnvelope[ComplianceAlertSchema])
def resolve_compliance_alert(
    alert_id: int,
    payload: AlertResolveSchema,
    db: Session = Depends(get_db),
):
    """Marks a compliance alert as resolved and logs the official action."""
    alert = db.query(ComplianceAlert).filter(ComplianceAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compliance alert with ID {alert_id} not found."
        )

    alert.is_resolved = True

    # Audit log
    audit = AuditLog(
        entity_name="ComplianceAlert",
        entity_id=str(alert.id),
        action="ALERT_RESOLVED",
        new_values={"remarks": payload.remarks},
        ip_address="127.0.0.1",
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)

    return ResponseEnvelope(
        success=True,
        data=_map_alert(alert),
        message="Alert marked as resolved."
    )

@router.post("/run-scan", response_model=ResponseEnvelope[dict])
def trigger_compliance_scan(db: Session = Depends(get_db)):
    """Triggers an on-demand compliance scan for overdue deadlines and missing evidence."""
    from app.services.alert_service import AlertService
    summary = AlertService.run_compliance_scan(db)
    return ResponseEnvelope(
        success=True,
        data=summary,
        message=f"Compliance scan completed. {summary['alerts_generated']} new alerts identified."
    )

