from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import RegulatoryRule, RuleVersion, ComplianceRequirement
from app.schemas.common import ResponseEnvelope
from app.schemas.rule import (
    RegulatoryRuleSchema,
    RuleVersionSchema,
    ComplianceRequirementSchema,
)

router = APIRouter()

def _map_rule_to_schema(rule: RegulatoryRule) -> RegulatoryRuleSchema:
    # Find active or latest version
    active_version = next((v for v in rule.versions if not v.is_simulation), None)
    if not active_version and rule.versions:
        active_version = rule.versions[0]

    version_str = active_version.version_tag if active_version else "v1.0"
    effective_date = active_version.effective_date if active_version else rule.created_at
    params = active_version.parameters if active_version else {}

    req_schemas = [
        ComplianceRequirementSchema(
            id=r.id,
            reqCode=r.req_code,
            title=r.title,
            description=r.description,
            category=r.category,
            isMandatory=r.is_mandatory,
            parameterKey=r.parameter_key,
            operator=r.operator,
            thresholdValue=r.threshold_value,
            unit=r.unit,
        )
        for r in rule.requirements
    ]

    ver_schemas = [
        RuleVersionSchema(
            id=v.id,
            versionTag=v.version_tag,
            changeSummary=v.change_summary,
            parameters=v.parameters,
            effectiveDate=v.effective_date,
            isSimulation=v.is_simulation,
        )
        for v in rule.versions
    ]

    return RegulatoryRuleSchema(
        id=rule.id,
        ruleCode=rule.rule_code,
        title=rule.title,
        category=rule.category,
        currentVersion=version_str,
        effectiveDate=effective_date,
        description=rule.description,
        parameters=params,
        applicableRequirementsCount=len(rule.requirements),
        requirements=req_schemas,
        versions=ver_schemas,
    )

@router.get("", response_model=ResponseEnvelope[List[RegulatoryRuleSchema]])
def list_regulatory_rules(db: Session = Depends(get_db)):
    """Lists all regulatory handbook rules with their active versions and requirements."""
    rules = db.query(RegulatoryRule).filter(RegulatoryRule.is_active == True).all()
    results = [_map_rule_to_schema(r) for r in rules]
    return ResponseEnvelope(success=True, data=results)

@router.get("/{rule_id}", response_model=ResponseEnvelope[RegulatoryRuleSchema])
def get_regulatory_rule(rule_id: int, db: Session = Depends(get_db)):
    """Fetches details of a specific regulatory rule with complete version history."""
    rule = db.query(RegulatoryRule).filter(RegulatoryRule.id == rule_id).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Regulatory rule with ID {rule_id} not found."
        )
    return ResponseEnvelope(success=True, data=_map_rule_to_schema(rule))
