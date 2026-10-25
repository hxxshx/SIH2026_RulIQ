from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import AuditLog
from app.schemas.common import ResponseEnvelope
from app.schemas.audit import AuditLogSchema

router = APIRouter()

@router.get("", response_model=ResponseEnvelope[List[AuditLogSchema]])
def list_audit_logs(
    entity_name: Optional[str] = Query(None, description="Filter by entity type"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieves immutable audit history records with actor and IP details."""
    query = db.query(AuditLog)
    if entity_name and entity_name != "all":
        query = query.filter(AuditLog.entity_name == entity_name)

    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

    results = [
        AuditLogSchema(
            id=log.id,
            entityName=log.entity_name,
            entityId=log.entity_id,
            action=log.action,
            performedBy=f"Officer ID #{log.performed_by_id}" if log.performed_by_id else "System Engine",
            details=str(log.new_values) if log.new_values else None,
            ipAddress=log.ip_address,
            timestamp=log.timestamp,
        )
        for log in logs
    ]

    return ResponseEnvelope(success=True, data=results)
