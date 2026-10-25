from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models import (
    Base,
    User,
    Institution,
    Application,
    RegulatoryRule,
    RuleVersion,
    ComplianceRequirement,
    ApplicationRequirement,
    EvidenceRecord,
    ComplianceAlert,
    AuditLog,
)

def seed_database(db: Session) -> None:
    """Populates the database with realistic, fictional AICTE demonstration records."""
    # Check if already seeded
    if db.query(Institution).first():
        return

    now = datetime.now(timezone.utc)

    # 1. Seed Users
    users = [
        User(
            email="admin@aicte.gov.in.sample",
            full_name="Dr. S. K. Murthy",
            role="admin",
            hashed_password="pbkdf2_sha256$mock_hash_for_prototype_only",
            is_active=True,
        ),
        User(
            email="r.sharma@aicte.gov.in.sample",
            full_name="Dr. R. Sharma",
            role="aicte_officer",
            hashed_password="pbkdf2_sha256$mock_hash_for_prototype_only",
            is_active=True,
        ),
        User(
            email="a.deshmukh@aicte.gov.in.sample",
            full_name="Prof. Anita Deshmukh",
            role="evaluator",
            hashed_password="pbkdf2_sha256$mock_hash_for_prototype_only",
            is_active=True,
        ),
    ]
    db.add_all(users)
    db.flush()

    officer_user = users[1]

    # 2. Seed Institutions (Fictional AICTE demonstration entities)
    institutions = [
        Institution(
            aicte_id="1-AICTE-UP-9021",
            name="Apex Institute of Technology [Fictional Sample]",
            state="Uttar Pradesh",
            district="Gautam Buddha Nagar",
            category="Engineering & Technology",
            contact_email="registrar@apex-sample-tech.edu.in",
        ),
        Institution(
            aicte_id="1-AICTE-MH-4412",
            name="Vidya Sagar College of Engineering [Fictional Sample]",
            state="Maharashtra",
            district="Pune",
            category="Engineering & Technology",
            contact_email="admin@vidyasagar-sample.org",
        ),
        Institution(
            aicte_id="1-AICTE-KA-5509",
            name="Cauvery Institute of Management [Fictional Sample]",
            state="Karnataka",
            district="Bengaluru Urban",
            category="Management",
            contact_email="director@cauvery-mgmt-sample.ac.in",
        ),
        Institution(
            aicte_id="1-AICTE-OD-7731",
            name="Kalinga Polytechnic Institute [Fictional Sample]",
            state="Odisha",
            district="Khordha",
            category="Polytechnic Diploma",
            contact_email="principal@kalinga-poly-sample.edu",
        ),
        Institution(
            aicte_id="1-AICTE-KL-3120",
            name="Malabar Academy of Engineering [Fictional Sample]",
            state="Kerala",
            district="Kozhikode",
            category="Engineering & Technology",
            contact_email="dean@malabar-sample-eng.in",
        ),
        Institution(
            aicte_id="1-AICTE-UK-8890",
            name="Himalayan Institute of Applied Sciences [Fictional Sample]",
            state="Uttarakhand",
            district="Dehradun",
            category="Applied Sciences & Tech",
            contact_email="info@himalayan-sample.edu.in",
        ),
    ]
    db.add_all(institutions)
    db.flush()

    # 3. Seed Regulatory Rules (APH Benchmarks)
    rules = [
        RegulatoryRule(
            rule_code="AICTE-APH-CH2-FAC",
            title="Faculty Cadre & Student-Teacher Ratio (SFR) Norms",
            category="faculty",
            description="Mandates statutory student-faculty ratios (1:20 UG Engineering, 1:15 PG) and minimum doctoral faculty cadres.",
            is_active=True,
        ),
        RegulatoryRule(
            rule_code="AICTE-APH-CH3-INF",
            title="Instructional & Administrative Area Norms",
            category="infrastructure",
            description="Specifies minimum carpet area in square meters for classrooms, computer laboratories, and barrier-free access.",
            is_active=True,
        ),
        RegulatoryRule(
            rule_code="AICTE-APH-CH4-SAF",
            title="Fire Safety & Structural Stability Certificate Requirements",
            category="safety",
            description="Mandates active No Objection Certificate (NOC) from State Fire Services and structural fitness certificate.",
            is_active=True,
        ),
        RegulatoryRule(
            rule_code="AICTE-APH-CH5-FIN",
            title="Security Deposit (FDR) and Corpus Fund Requirements",
            category="finance",
            description="Prescribes minimum joint fixed deposit receipts (FDR) pledged with AICTE for institutional sustainability.",
            is_active=True,
        ),
    ]
    db.add_all(rules)
    db.flush()

    # 4. Seed Rule Versions
    rule_versions = [
        RuleVersion(
            rule_id=rules[0].id,
            version_tag="v2024.2",
            change_summary="Baseline 2024 handbook revision maintaining 1:20 ratio.",
            parameters={"student_faculty_ratio_ug": 20, "phd_faculty_percent": 20},
            effective_date=now - timedelta(days=365),
            is_simulation=False,
        ),
        RuleVersion(
            rule_id=rules[1].id,
            version_tag="v2024.1",
            change_summary="Classroom carpet area minimum 66 sqm.",
            parameters={"classroom_carpet_area_sqm": 66, "barrier_free_access": True},
            effective_date=now - timedelta(days=400),
            is_simulation=False,
        ),
        RuleVersion(
            rule_id=rules[2].id,
            version_tag="v2025.1",
            change_summary="Annual fire safety audit requirement.",
            parameters={"fire_noc_validity_days_min": 180},
            effective_date=now - timedelta(days=200),
            is_simulation=False,
        ),
        RuleVersion(
            rule_id=rules[3].id,
            version_tag="v2024.1",
            change_summary="Corpus fund of 50 Lakhs for engineering programs.",
            parameters={"fdr_min_amount_lakhs": 50},
            effective_date=now - timedelta(days=500),
            is_simulation=False,
        ),
    ]
    db.add_all(rule_versions)
    db.flush()

    # 5. Seed Compliance Requirements
    requirements = [
        ComplianceRequirement(
            rule_id=rules[0].id,
            req_code="REQ_SFR_RATIO_UG",
            title="Student-to-Faculty Ratio (UG Engineering)",
            description="Student to approved faculty ratio must not exceed statutory limit.",
            category="faculty",
            is_mandatory=True,
            parameter_key="student_faculty_ratio_ug",
            operator="<=",
            threshold_value="20",
            unit="ratio",
        ),
        ComplianceRequirement(
            rule_id=rules[1].id,
            req_code="REQ_CLASSROOM_AREA",
            title="Classroom Carpet Area (sqm)",
            description="Minimum area per standard instructional classroom.",
            category="infrastructure",
            is_mandatory=True,
            parameter_key="classroom_carpet_area_sqm",
            operator=">=",
            threshold_value="66",
            unit="sqm",
        ),
        ComplianceRequirement(
            rule_id=rules[2].id,
            req_code="REQ_FIRE_NOC_VALIDITY",
            title="State Fire Safety NOC Validity",
            description="Validity period remaining on fire safety certificate.",
            category="safety",
            is_mandatory=True,
            parameter_key="fire_noc_validity_days_min",
            operator=">=",
            threshold_value="180",
            unit="days",
        ),
        ComplianceRequirement(
            rule_id=rules[3].id,
            req_code="REQ_CORPUS_FDR",
            title="Joint AICTE Corpus FDR Amount",
            description="Fixed deposit pledged jointly with AICTE.",
            category="finance",
            is_mandatory=True,
            parameter_key="fdr_min_amount_lakhs",
            operator=">=",
            threshold_value="50",
            unit="lakhs",
        ),
    ]
    db.add_all(requirements)
    db.flush()

    # 6. Seed Applications
    applications = [
        Application(
            application_number="APP-2026-UP-0012",
            institution_id=institutions[0].id,
            academic_year="2026-2027",
            application_type="extension_of_approval",
            status="compliance_pending",
            submission_date=now - timedelta(days=40),
            deadline=now + timedelta(days=25),
        ),
        Application(
            application_number="APP-2026-MH-0045",
            institution_id=institutions[1].id,
            academic_year="2026-2027",
            application_type="increase_intake",
            status="under_scrutiny",
            submission_date=now - timedelta(days=60),
            deadline=now - timedelta(days=13), # Overdue
        ),
        Application(
            application_number="APP-2026-KA-0089",
            institution_id=institutions[2].id,
            academic_year="2026-2027",
            application_type="new_course",
            status="approved",
            submission_date=now - timedelta(days=90),
            deadline=now - timedelta(days=30),
        ),
        Application(
            application_number="APP-2026-OD-0023",
            institution_id=institutions[3].id,
            academic_year="2026-2027",
            application_type="extension_of_approval",
            status="compliance_pending",
            submission_date=now - timedelta(days=30),
            deadline=now - timedelta(days=5), # Overdue
        ),
        Application(
            application_number="APP-2026-KL-0078",
            institution_id=institutions[4].id,
            academic_year="2026-2027",
            application_type="new_institute",
            status="under_scrutiny",
            submission_date=now - timedelta(days=20),
            deadline=now + timedelta(days=40),
        ),
        Application(
            application_number="APP-2026-UK-0061",
            institution_id=institutions[5].id,
            academic_year="2026-2027",
            application_type="extension_of_approval",
            status="rejected",
            submission_date=now - timedelta(days=120),
            deadline=now - timedelta(days=60),
        ),
    ]
    db.add_all(applications)
    db.flush()

    # 7. Seed Application Requirement Mappings
    app_reqs = [
        # UP-0012: SFR breach (current value 22.4 > 20)
        ApplicationRequirement(
            application_id=applications[0].id,
            requirement_id=requirements[0].id,
            status="non_compliant",
            current_value="22.4",
            notes="Student enrollment 672 with only 30 approved faculty members.",
        ),
        ApplicationRequirement(
            application_id=applications[0].id,
            requirement_id=requirements[1].id,
            status="compliant",
            current_value="72",
            notes="Classrooms meet 66 sqm requirement.",
        ),
        # MH-0045: Compliant SFR, Overdue Scrutiny
        ApplicationRequirement(
            application_id=applications[1].id,
            requirement_id=requirements[0].id,
            status="compliant",
            current_value="18.5",
            notes="Satisfies 1:20 ratio.",
        ),
        ApplicationRequirement(
            application_id=applications[1].id,
            requirement_id=requirements[2].id,
            status="compliant",
            current_value="240",
            notes="Fire NOC valid.",
        ),
        # OD-0023: Missing Fire NOC evidence
        ApplicationRequirement(
            application_id=applications[3].id,
            requirement_id=requirements[2].id,
            status="missing_evidence",
            current_value=None,
            notes="Expired certificate uploaded, current proof missing.",
        ),
        # KA-0089: Fully Compliant
        ApplicationRequirement(
            application_id=applications[2].id,
            requirement_id=requirements[0].id,
            status="compliant",
            current_value="12.0",
            notes="High faculty density.",
        ),
        ApplicationRequirement(
            application_id=applications[2].id,
            requirement_id=requirements[3].id,
            status="compliant",
            current_value="60",
            notes="FDR verified.",
        ),
    ]
    db.add_all(app_reqs)
    db.flush()

    # 8. Seed Evidence Records
    evidence_records = [
        EvidenceRecord(
            application_id=applications[0].id,
            requirement_id=requirements[0].id,
            document_type="faculty_roster",
            file_name="Faculty_Service_Register_2026.pdf",
            file_uri="/uploads/APP-2026-UP-0012/faculty_roster.pdf",
            file_size_bytes=3565158,
            verified_status="verified",
        ),
        EvidenceRecord(
            application_id=applications[1].id,
            requirement_id=requirements[1].id,
            document_type="land_deed",
            file_name="Land_Use_Certificate_Khasra_901.pdf",
            file_uri="/uploads/APP-2026-MH-0045/land_deed.pdf",
            file_size_bytes=5347737,
            verified_status="verified",
        ),
        EvidenceRecord(
            application_id=applications[3].id,
            requirement_id=requirements[2].id,
            document_type="fire_noc",
            file_name="State_Fire_Safety_NOC_Renewal.pdf",
            file_uri="/uploads/APP-2026-OD-0023/fire_noc.pdf",
            file_size_bytes=1258291,
            verified_status="rejected",
            rejection_reason="Validity expired on 2026-09-30.",
        ),
        EvidenceRecord(
            application_id=applications[4].id,
            requirement_id=requirements[3].id,
            document_type="fdr_receipt",
            file_name="Joint_FDR_Corpus_Fixed_Deposit.pdf",
            file_uri="/uploads/APP-2026-KL-0078/fdr_receipt.pdf",
            file_size_bytes=2936012,
            verified_status="pending",
        ),
    ]
    db.add_all(evidence_records)
    db.flush()

    # 9. Seed Compliance Alerts
    alerts = [
        ComplianceAlert(
            application_id=applications[1].id,
            severity="critical",
            alert_type="deadline_overdue",
            message="Scrutiny submission deadline exceeded by 13 days without required laboratory equipment list.",
            suggested_action="Issue immediate 7-day cure notice or refer to Regional Hearing Committee.",
            is_resolved=False,
        ),
        ComplianceAlert(
            application_id=applications[3].id,
            requirement_id=requirements[2].id,
            severity="critical",
            alert_type="evidence_missing",
            message="State Fire Department NOC expired on 2026-09-30; mandatory safety requirement unmet.",
            suggested_action="Flag application for urgent compliance submission of renewed Fire NOC.",
            is_resolved=False,
        ),
        ComplianceAlert(
            application_id=applications[0].id,
            requirement_id=requirements[0].id,
            severity="high",
            alert_type="regulatory_breach",
            message="Current student-faculty ratio computed at 1:22.4, exceeding statutory threshold of 1:20.",
            suggested_action="Require proof of 4 additional assistant professor appointments before final review.",
            is_resolved=False,
        ),
    ]
    db.add_all(alerts)
    db.flush()

    # 10. Seed Initial Audit Logs
    audit_logs = [
        AuditLog(
            entity_name="System",
            entity_id="AICTE-CORE-SEED",
            action="INITIALIZE_SEED_DATA",
            performed_by_id=officer_user.id,
            new_values={"institutions_count": len(institutions), "rules_count": len(rules)},
            ip_address="127.0.0.1",
        )
    ]
    db.add_all(audit_logs)
    db.commit()
