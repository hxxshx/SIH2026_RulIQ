from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ComplianceAlertSchema(BaseModel):
    id: int
    applicationNumber: str
    institutionName: str
    severity: str
    alertType: str
    message: str
    suggestedAction: str
    createdAt: datetime
    isResolved: bool
    resolvedBy: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class AlertResolveSchema(BaseModel):
    remarks: Optional[str] = "Marked resolved by authorized AICTE official."
