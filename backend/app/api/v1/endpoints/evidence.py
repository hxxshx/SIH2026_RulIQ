import os
import shutil
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models import (
    EvidenceRecord,
    Application,
    ComplianceRequirement,
    ApplicationRequirement,
    ComplianceAlert,
    AuditLog,
)
from app.schemas.common import ResponseEnvelope
from app.schemas.evidence import EvidenceItemSchema, EvidenceVerificationSchema

router = APIRouter()

def _map_evidence(ev: EvidenceRecord) -> EvidenceItemSchema:
    app_no = ev.application.application_number if ev.application else "N/A"
    inst_name = ev.application.institution.name if ev.application and ev.application.institution else "N/A"
    req_title = ev.requirement.title if hasattr(ev, "requirement") and ev.requirement else None

    return EvidenceItemSchema(
        id=ev.id,
        applicationId=ev.application_id,
        applicationNumber=app_no,
        institutionName=inst_name,
        requirementId=ev.requirement_id,
        requirementTitle=req_title,
        documentType=ev.document_type,
        fileName=ev.file_name,
        fileUri=ev.file_uri,
        fileSizeBytes=ev.file_size_bytes,
        verifiedStatus=ev.verified_status,
        rejectionReason=ev.rejection_reason,
        uploadedAt=ev.uploaded_at,
    )

@router.get("", response_model=ResponseEnvelope[List[EvidenceItemSchema]])
def list_evidence_records(
    application_id: Optional[int] = Query(None, description="Filter by application ID"),
    verified_status: Optional[str] = Query(None, description="Filter by status (pending, verified, rejected)"),
    db: Session = Depends(get_db),
):
    """Lists evidence documents with application and verification status filters."""
    query = db.query(EvidenceRecord).join(Application)

    if application_id:
        query = query.filter(EvidenceRecord.application_id == application_id)

    if verified_status and verified_status != "all":
        query = query.filter(EvidenceRecord.verified_status == verified_status)

    records = query.order_by(EvidenceRecord.uploaded_at.desc()).all()
    results = [_map_evidence(ev) for ev in records]

    return ResponseEnvelope(success=True, data=results)

@router.post("/upload", response_model=ResponseEnvelope[EvidenceItemSchema])
async def upload_evidence_document(
    application_id: int = Form(...),
    document_type: str = Form(...),
    requirement_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Uploads an institutional verification document and maps it to a requirement."""
    now = datetime.now(timezone.utc)

    # 1. Validate application exists
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found."
        )

    # 2. Save file to local directory
    target_dir = os.path.join(settings.UPLOAD_DIR, app.application_number)
    os.makedirs(target_dir, exist_ok=True)
    file_path = os.path.join(target_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    # 3. Create EvidenceRecord
    ev = EvidenceRecord(
        application_id=application_id,
        requirement_id=requirement_id,
        document_type=document_type,
        file_name=file.filename,
        file_uri=f"/uploads/{app.application_number}/{file.filename}",
        file_size_bytes=file_size,
        verified_status="pending",
        uploaded_at=now,
    )
    db.add(ev)

    # 4. If linked to requirement, update requirement status to pending
    if requirement_id:
        app_req = db.query(ApplicationRequirement).filter(
            ApplicationRequirement.application_id == application_id,
            ApplicationRequirement.requirement_id == requirement_id,
        ).first()
        if app_req and app_req.status == "missing_evidence":
            app_req.status = "pending_review"

    # 5. Record Audit Log
    audit = AuditLog(
        entity_name="EvidenceRecord",
        entity_id=file.filename,
        action="EVIDENCE_DOCUMENT_UPLOADED",
        new_values={
            "application_id": application_id,
            "document_type": document_type,
            "file_size": file_size,
        },
        ip_address="127.0.0.1",
    )
    db.add(audit)
    db.commit()
    db.refresh(ev)

    return ResponseEnvelope(
        success=True,
        data=_map_evidence(ev),
        message="Document uploaded successfully and queued for official scrutiny."
    )

@router.patch("/{evidence_id}/verify", response_model=ResponseEnvelope[EvidenceItemSchema])
def verify_evidence_document(
    evidence_id: int,
    payload: EvidenceVerificationSchema,
    db: Session = Depends(get_db),
):
    """Marks an uploaded document verified or rejected by an authorized evaluator."""
    ev = db.query(EvidenceRecord).filter(EvidenceRecord.id == evidence_id).first()
    if not ev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence record with ID {evidence_id} not found."
        )

    old_status = ev.verified_status
    ev.verified_status = payload.verified_status

    if payload.verified_status == "rejected":
        if not payload.rejection_reason:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A detailed rejection reason is mandatory when rejecting evidence."
            )
        ev.rejection_reason = payload.rejection_reason

        # Create alert for the institution
        alert = ComplianceAlert(
            application_id=ev.application_id,
            requirement_id=ev.requirement_id,
            severity="critical",
            alert_type="evidence_missing",
            message=f"Document '{ev.file_name}' rejected during scrutiny: {payload.rejection_reason}",
            suggested_action="Upload revised and verified document immediately.",
            is_resolved=False,
        )
        db.add(alert)

    # Update linked requirement status
    if ev.requirement_id:
        app_req = db.query(ApplicationRequirement).filter(
            ApplicationRequirement.application_id == ev.application_id,
            ApplicationRequirement.requirement_id == ev.requirement_id,
        ).first()
        if app_req:
            app_req.status = "compliant" if payload.verified_status == "verified" else "non_compliant"

    # Append Audit Log
    audit = AuditLog(
        entity_name="EvidenceRecord",
        entity_id=str(ev.id),
        action=f"EVIDENCE_{payload.verified_status.upper()}",
        old_values={"status": old_status},
        new_values={
            "status": payload.verified_status,
            "rejection_reason": payload.rejection_reason,
            "remarks": payload.remarks,
        },
        ip_address="127.0.0.1",
    )
    db.add(audit)
    db.commit()
    db.refresh(ev)

    return ResponseEnvelope(
        success=True,
        data=_map_evidence(ev),
        message=f"Document verification status updated to '{payload.verified_status}'."
    )
