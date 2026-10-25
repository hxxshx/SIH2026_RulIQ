from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models import (
    Application,
    Institution,
    ApplicationRequirement,
    EvidenceRecord,
    ComplianceRequirement,
    AuditLog,
)
from app.schemas.common import ResponseEnvelope
from app.schemas.institution import InstitutionSchema
from app.schemas.application import (
    ApplicationListItemSchema,
    ApplicationDetailSchema,
    ApplicationRequirementSchema,
    EvidenceRecordSchema,
    ApplicationStageUpdateSchema,
)

router = APIRouter()

def _map_application_to_list_item(app: Application, now: datetime) -> ApplicationListItemSchema:
    total_reqs = len(app.application_requirements)
    met_reqs = sum(1 for r in app.application_requirements if r.status == "compliant")
    missing_evidence = sum(1 for r in app.application_requirements if r.status == "missing_evidence")
    
    # Also add rejected evidence records
    rejected_evidence = sum(1 for e in app.evidence_records if e.verified_status == "rejected")
    total_missing_or_rejected = missing_evidence + rejected_evidence

    # Safe comparison across SQLite (offset-naive) and PostgreSQL (offset-aware)
    deadline = app.deadline
    if deadline.tzinfo is None and now.tzinfo is not None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    elif deadline.tzinfo is not None and now.tzinfo is None:
        deadline = deadline.replace(tzinfo=None)

    is_overdue = deadline < now and app.status not in ["approved", "rejected"]

    # Institution schema mapping
    inst_schema = InstitutionSchema(
        id=app.institution.id,
        aictePermanentId=app.institution.aicte_id,
        name=app.institution.name,
        state=app.institution.state,
        district=app.institution.district,
        category=app.institution.category,
        contactEmail=app.institution.contact_email,
    )

    return ApplicationListItemSchema(
        id=app.id,
        applicationNumber=app.application_number,
        institution=inst_schema,
        academicYear=app.academic_year,
        applicationType=app.application_type,
        status=app.status,
        submissionDate=app.submission_date,
        deadline=app.deadline,
        isOverdue=is_overdue,
        totalRequirements=max(total_reqs, 4), # Default statutory baseline
        metRequirements=met_reqs,
        missingEvidenceCount=total_missing_or_rejected,
    )

@router.get("", response_model=ResponseEnvelope[List[ApplicationListItemSchema]])
def list_applications(
    search: Optional[str] = Query(None, description="Search application number or institution name"),
    status: Optional[str] = Query(None, description="Filter by application status"),
    application_type: Optional[str] = Query(None, description="Filter by type"),
    is_overdue: Optional[bool] = Query(None, description="Filter only overdue applications"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Lists applications with relational filtering, requirement statistics, and deadline tracking."""
    now = datetime.now(timezone.utc)
    query = db.query(Application).join(Institution)

    if status and status != "all":
        query = query.filter(Application.status == status)

    if application_type and application_type != "all":
        query = query.filter(Application.application_type == application_type)

    if is_overdue is True:
        query = query.filter(
            Application.deadline < now,
            Application.status.notin_(["approved", "rejected"])
        )

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Application.application_number.ilike(term),
                Institution.name.ilike(term),
                Institution.aicte_id.ilike(term),
                Institution.state.ilike(term),
            )
        )

    apps = query.order_by(Application.created_at.desc()).offset(skip).limit(limit).all()
    results = [_map_application_to_list_item(app, now) for app in apps]

    return ResponseEnvelope(
        success=True,
        data=results,
        meta={"count": len(results), "skip": skip, "limit": limit}
    )

@router.get("/{application_id}", response_model=ResponseEnvelope[ApplicationDetailSchema])
def get_application_details(application_id: int, db: Session = Depends(get_db)):
    """Retrieves full application dossier with mapped statutory requirements and evidence."""
    now = datetime.now(timezone.utc)
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found."
        )

    base_item = _map_application_to_list_item(app, now)

    # Map requirements
    req_schemas = [
        ApplicationRequirementSchema(
            id=ar.id,
            reqCode=ar.requirement.req_code,
            title=ar.requirement.title,
            category=ar.requirement.category,
            isMandatory=ar.requirement.is_mandatory,
            status=ar.status,
            currentValue=ar.current_value,
            thresholdValue=ar.requirement.threshold_value,
            operator=ar.requirement.operator,
            unit=ar.requirement.unit,
            notes=ar.notes,
        )
        for ar in app.application_requirements
    ]

    # Map evidence records
    ev_schemas = [
        EvidenceRecordSchema(
            id=ev.id,
            documentType=ev.document_type,
            fileName=ev.file_name,
            fileUri=ev.file_uri,
            fileSizeBytes=ev.file_size_bytes,
            verifiedStatus=ev.verified_status,
            rejectionReason=ev.rejection_reason,
            uploadedAt=ev.uploaded_at,
        )
        for ev in app.evidence_records
    ]

    detail = ApplicationDetailSchema(
        **base_item.model_dump(),
        requirements=req_schemas,
        evidenceRecords=ev_schemas,
    )

    return ResponseEnvelope(success=True, data=detail)

@router.patch("/{application_id}/stage", response_model=ResponseEnvelope[ApplicationListItemSchema])
def update_application_stage(
    application_id: int,
    payload: ApplicationStageUpdateSchema,
    db: Session = Depends(get_db),
):
    """Updates application scrutiny stage and appends an immutable audit event."""
    now = datetime.now(timezone.utc)
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found."
        )

    old_status = app.status
    app.status = payload.status

    # Record Audit Log
    audit = AuditLog(
        entity_name="Application",
        entity_id=str(app.id),
        action="APPLICATION_STAGE_CHANGED",
        old_values={"status": old_status},
        new_values={"status": payload.status, "remarks": payload.remarks},
        ip_address="127.0.0.1",
    )
    db.add(audit)
    db.commit()
    db.refresh(app)

    return ResponseEnvelope(
        success=True,
        data=_map_application_to_list_item(app, now),
        message=f"Application status successfully transitioned to {payload.status}."
    )
