from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models import (
    Application,
    ApplicationRequirement,
    ComplianceAlert,
    AuditLog,
)

class AlertService:
    """Automated compliance monitoring scanner identifying overdue deadlines and missing evidence."""

    @staticmethod
    def run_compliance_scan(db: Session) -> dict:
        """Scans all applications and requirements to detect active compliance deficits."""
        now = datetime.now(timezone.utc)
        created_count = 0

        # 1. Scan Application Deadlines
        pending_apps = (
            db.query(Application)
            .filter(Application.status.notin_(["approved", "rejected"]))
            .all()
        )

        for app in pending_apps:
            deadline = app.deadline
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)

            days_remaining = (deadline - now).total_seconds() / 86400

            # Overdue Alert
            if days_remaining < 0:
                existing = (
                    db.query(ComplianceAlert)
                    .filter(
                        ComplianceAlert.application_id == app.id,
                        ComplianceAlert.alert_type == "deadline_overdue",
                        ComplianceAlert.is_resolved == False,
                    )
                    .first()
                )
                if not existing:
                    overdue_days = int(abs(days_remaining))
                    alert = ComplianceAlert(
                        application_id=app.id,
                        severity="critical",
                        alert_type="deadline_overdue",
                        message=f"Scrutiny deadline exceeded by {overdue_days} days without final compliance clearance.",
                        suggested_action="Issue statutory show-cause notice or refer to Regional Hearing Committee.",
                        is_resolved=False,
                    )
                    db.add(alert)
                    created_count += 1

            # Approaching Deadline Alert (within 14 days)
            elif 0 <= days_remaining <= 14:
                existing = (
                    db.query(ComplianceAlert)
                    .filter(
                        ComplianceAlert.application_id == app.id,
                        ComplianceAlert.alert_type == "deadline_approaching",
                        ComplianceAlert.is_resolved == False,
                    )
                    .first()
                )
                if not existing:
                    alert = ComplianceAlert(
                        application_id=app.id,
                        severity="high",
                        alert_type="deadline_approaching",
                        message=f"Mandatory scrutiny deadline approaching in {int(days_remaining)} days.",
                        suggested_action="Expedite pending requirement verifications and schedule committee review.",
                        is_resolved=False,
                    )
                    db.add(alert)
                    created_count += 1

        # 2. Scan Missing Mandatory Evidence
        missing_reqs = (
            db.query(ApplicationRequirement)
            .join(Application)
            .filter(
                ApplicationRequirement.status == "missing_evidence",
                Application.status.notin_(["approved", "rejected"]),
            )
            .all()
        )

        for ar in missing_reqs:
            if ar.requirement.is_mandatory:
                existing = (
                    db.query(ComplianceAlert)
                    .filter(
                        ComplianceAlert.application_id == ar.application_id,
                        ComplianceAlert.requirement_id == ar.requirement_id,
                        ComplianceAlert.alert_type == "evidence_missing",
                        ComplianceAlert.is_resolved == False,
                    )
                    .first()
                )
                if not existing:
                    alert = ComplianceAlert(
                        application_id=ar.application_id,
                        requirement_id=ar.requirement_id,
                        severity="critical",
                        alert_type="evidence_missing",
                        message=f"Mandatory document proof missing for statutory requirement: {ar.requirement.title}",
                        suggested_action="Request urgent proof upload from institution prior to scrutiny cutoff.",
                        is_resolved=False,
                    )
                    db.add(alert)
                    created_count += 1

        if created_count > 0:
            audit = AuditLog(
                entity_name="ComplianceScanner",
                entity_id="AUTO-SCAN",
                action="COMPLIANCE_ALERTS_GENERATED",
                new_values={"alerts_generated": created_count},
                ip_address="127.0.0.1",
            )
            db.add(audit)
            db.commit()

        return {"alerts_generated": created_count, "timestamp": now.isoformat()}
