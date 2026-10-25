import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
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
    ImpactAnalysisRun,
    ImpactAnalysisResult,
    RecoveryRecommendation,
    ReviewDecision,
    ComplianceAlert,
    AuditLog,
)

# Use isolated in-memory SQLite database for unit tests
@pytest.fixture(scope="function")
def db_session():
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    yield session
    session.close()

def test_create_institution_and_application(db_session):
    inst = Institution(
        aicte_id="1-AICTE-TEST-001",
        name="Test Institute of Technology",
        state="Delhi",
        district="New Delhi",
        category="Engineering",
        contact_email="test@inst.edu.in"
    )
    db_session.add(inst)
    db_session.commit()

    now = datetime.now(timezone.utc)
    app = Application(
        application_number="APP-TEST-2026-01",
        institution_id=inst.id,
        academic_year="2026-2027",
        application_type="extension_of_approval",
        status="under_scrutiny",
        submission_date=now,
        deadline=now + timedelta(days=30)
    )
    db_session.add(app)
    db_session.commit()

    # Verify query and relationship
    fetched_app = db_session.query(Application).filter_by(application_number="APP-TEST-2026-01").first()
    assert fetched_app is not None
    assert fetched_app.institution.name == "Test Institute of Technology"
    assert len(fetched_app.institution.applications) == 1

def test_regulatory_rule_and_requirements(db_session):
    now = datetime.now(timezone.utc)
    rule = RegulatoryRule(
        rule_code="AICTE-TEST-RULE",
        title="Test Land Norms",
        category="infrastructure",
        description="Minimum land requirements for engineering college.",
        is_active=True
    )
    db_session.add(rule)
    db_session.flush()

    version = RuleVersion(
        rule_id=rule.id,
        version_tag="v1.0",
        change_summary="Initial benchmark.",
        parameters={"min_acres": 2.5},
        effective_date=now,
        is_simulation=False
    )
    req = ComplianceRequirement(
        rule_id=rule.id,
        req_code="REQ_TEST_LAND_ACRES",
        title="Campus Land Area (Acres)",
        description="Minimum contiguous land area.",
        category="infrastructure",
        is_mandatory=True,
        parameter_key="min_acres",
        operator=">=",
        threshold_value="2.5",
        unit="acres"
    )
    db_session.add_all([version, req])
    db_session.commit()

    fetched_rule = db_session.query(RegulatoryRule).filter_by(rule_code="AICTE-TEST-RULE").first()
    assert len(fetched_rule.versions) == 1
    assert len(fetched_rule.requirements) == 1
    assert fetched_rule.requirements[0].req_code == "REQ_TEST_LAND_ACRES"

def test_impact_analysis_and_human_review(db_session):
    now = datetime.now(timezone.utc)
    inst = Institution(
        aicte_id="1-AICTE-TEST-002",
        name="Apex Technical College",
        state="UP",
        district="Noida",
        category="Engineering",
        contact_email="apex@test.org"
    )
    db_session.add(inst)
    db_session.flush()

    app = Application(
        application_number="APP-TEST-2026-02",
        institution_id=inst.id,
        academic_year="2026-2027",
        application_type="increase_intake",
        status="compliance_pending",
        submission_date=now,
        deadline=now + timedelta(days=20)
    )
    db_session.add(app)
    db_session.flush()

    # Simulation run
    run = ImpactAnalysisRun(
        simulated_parameters={"student_faculty_ratio_ug": 15},
        total_evaluated=1,
        total_impacted=1,
        total_unaffected=0
    )
    db_session.add(run)
    db_session.flush()

    result = ImpactAnalysisResult(
        run_id=run.id,
        application_id=app.id,
        impact_status="impacted_non_compliant",
        reason_explanation="Shortfall of 5 faculty members under 1:15 ratio.",
        unmet_requirements_summary=[{"req_code": "REQ_SFR_RATIO_UG", "deficit": 5}]
    )
    db_session.add(result)
    db_session.flush()

    rec = RecoveryRecommendation(
        result_id=result.id,
        action_title="Appoint Cadre Faculty",
        recommended_action="Recruit 5 assistant professors.",
        remediation_type="recruit_faculty",
        urgency="critical",
        is_actionable=True,
        status="suggested"
    )
    db_session.add(rec)
    db_session.flush()

    # Human Review Decision
    officer = User(
        email="officer@aicte.gov.in.sample",
        full_name="Dr. Evaluator",
        role="aicte_officer",
        hashed_password="mock",
        is_active=True
    )
    db_session.add(officer)
    db_session.flush()

    review = ReviewDecision(
        application_id=app.id,
        recommendation_id=rec.id,
        reviewer_id=officer.id,
        decision="accepted",
        official_remarks="Granted 45-day compliance window to execute recruitment."
    )
    db_session.add(review)

    # Compliance Alert
    alert = ComplianceAlert(
        application_id=app.id,
        severity="critical",
        alert_type="regulatory_breach",
        message="Faculty ratio breach detected in simulation.",
        suggested_action="Issue advisory notice.",
        is_resolved=False
    )
    db_session.add(alert)

    # Audit Log
    audit = AuditLog(
        entity_name="Application",
        entity_id=str(app.id),
        action="REVIEW_DECISION_ACCEPTED",
        performed_by_id=officer.id,
        new_values={"decision": "accepted"},
        ip_address="192.168.1.100"
    )
    db_session.add(audit)
    db_session.commit()

    # Verifications
    fetched_result = db_session.query(ImpactAnalysisResult).filter_by(run_id=run.id).first()
    assert fetched_result.impact_status == "impacted_non_compliant"
    assert len(fetched_result.recommendations) == 1

    fetched_review = db_session.query(ReviewDecision).filter_by(application_id=app.id).first()
    assert fetched_review.decision == "accepted"
    assert fetched_review.reviewer.full_name == "Dr. Evaluator"

    fetched_alerts = db_session.query(ComplianceAlert).filter_by(is_resolved=False, severity="critical").all()
    assert len(fetched_alerts) == 1

    fetched_audit = db_session.query(AuditLog).filter_by(action="REVIEW_DECISION_ACCEPTED").first()
    assert fetched_audit is not None
