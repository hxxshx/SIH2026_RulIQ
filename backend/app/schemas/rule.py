from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict

class ComplianceRequirementSchema(BaseModel):
    id: int
    reqCode: str
    title: str
    description: str
    category: str
    isMandatory: bool
    parameterKey: str
    operator: str
    thresholdValue: str
    unit: str

    model_config = ConfigDict(from_attributes=True)

class RuleVersionSchema(BaseModel):
    id: int
    versionTag: str
    changeSummary: str
    parameters: Dict[str, Any]
    effectiveDate: datetime
    isSimulation: bool

    model_config = ConfigDict(from_attributes=True)

class RegulatoryRuleSchema(BaseModel):
    id: int
    ruleCode: str
    title: str
    category: str
    currentVersion: str
    effectiveDate: datetime
    description: str
    parameters: Dict[str, Any]
    applicableRequirementsCount: int
    requirements: List[ComplianceRequirementSchema] = []
    versions: List[RuleVersionSchema] = []

    model_config = ConfigDict(from_attributes=True)
