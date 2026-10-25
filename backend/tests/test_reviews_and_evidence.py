import pytest
import io
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models import AuditLog, ComplianceAlert, EvidenceRecord, ApplicationRequirement
from app.services.alert_service import AlertService

def test_record_human_review_decision(client: TestClient, db_session: Session):
    payload = {
        "application_id": 1,
        "decision": "accepted",
        "remarks": "Official scrutiny panel accepted compliance remediation schedule.",
    }
    response = client.post("/api/v1/reviews/decisions", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["decision"] == "accepted"
    assert res["data"]["officialRemarks"] == payload["remarks"]

    # Verify audit log was recorded
    audit = db_session.query(AuditLog).filter(AuditLog.action == "HUMAN_REVIEW_ACCEPTED").first()
    assert audit is not None
    assert audit.entity_name == "Application"

def test_list_and_upload_evidence(client: TestClient):
    # 1. List evidence records
    list_res = client.get("/api/v1/evidence")
    assert list_res.status_code == 200
    data = list_res.json()["data"]
    assert len(data) >= 3

    # 2. Upload dummy evidence file
    file_content = b"Sample AICTE Institutional Approval Evidence Content PDF"
    files = {
        "file": ("Test_Evidence_Certificate.pdf", io.BytesIO(file_content), "application/pdf")
    }
    form_data = {
        "application_id": 1,
        "document_type": "fire_safety_noc",
        "requirement_id": 3,
    }

    upload_res = client.post("/api/v1/evidence/upload", data=form_data, files=files)
    assert upload_res.status_code == 200
    uploaded_data = upload_res.json()["data"]
    assert uploaded_data["documentType"] == "fire_safety_noc"
    assert uploaded_data["verifiedStatus"] == "pending"

def test_verify_and_reject_evidence(client: TestClient, db_session: Session):
    # Verify an evidence record
    verify_payload = {
        "verified_status": "verified",
        "remarks": "Document checked and authenticated against state registry.",
    }
    verify_res = client.patch("/api/v1/evidence/1/verify", json=verify_payload)
    assert verify_res.status_code == 200
    assert verify_res.json()["data"]["verifiedStatus"] == "verified"

    # Reject evidence with reason (should trigger alert)
    reject_payload = {
        "verified_status": "rejected",
        "rejection_reason": "Expired validity seal on municipal certificate.",
    }
    reject_res = client.patch("/api/v1/evidence/2/verify", json=reject_payload)
    assert reject_res.status_code == 200
    assert reject_res.json()["data"]["verifiedStatus"] == "rejected"

    # Verify alert was generated for the rejection
    alert = db_session.query(ComplianceAlert).filter(
        ComplianceAlert.message.contains("Expired validity seal")
    ).first()
    assert alert is not None
    assert alert.severity == "critical"

def test_compliance_alert_scanner(client: TestClient, db_session: Session):
    scan_res = client.post("/api/v1/alerts/run-scan")
    assert scan_res.status_code == 200
    summary = scan_res.json()["data"]
    assert "alerts_generated" in summary
    assert "timestamp" in summary
