from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict

class AuditLogSchema(BaseModel):
    id: int
    entityName: str
    entityId: str
    action: str
    performedBy: Optional[str] = "System Evaluator"
    details: Optional[str] = None
    ipAddress: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
