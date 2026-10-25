from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    AICTE_OFFICER = "aicte_officer"
    EVALUATOR = "evaluator"
    INSTITUTION_VIEWER = "institution_viewer"

class ApplicationType(str, Enum):
    NEW_INSTITUTE = "new_institute"
    EXTENSION_OF_APPROVAL = "extension_of_approval"
    INCREASE_INTAKE = "increase_intake"
    NEW_COURSE = "new_course"

class ApplicationStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_SCRUTINY = "under_scrutiny"
    COMPLIANCE_PENDING = "compliance_pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ComplianceStatus(str, Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    MISSING_EVIDENCE = "missing_evidence"
    WAIVED = "waived"

class ImpactStatus(str, Enum):
    IMPACTED_NON_COMPLIANT = "impacted_non_compliant"
    CONDITIONALLY_IMPACTED = "conditionally_impacted"
    UNAFFECTED = "unaffected"

class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    INFO = "info"

class ReviewDecisionType(str, Enum):
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    MODIFIED = "modified"
