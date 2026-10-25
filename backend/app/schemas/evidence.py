from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class EvidenceVerificationSchema(BaseModel):
    verified_status: str # verified, rejected
    rejection_reason: Optional[str] = None
    remarks: Optional[str] = None

class EvidenceItemSchema(BaseModel):
    id: int
    applicationId: int
    applicationNumber: str
    institutionName: str
    requirementId: Optional[int] = None
    requirementTitle: Optional[str] = None
    documentType: str
    fileName: str
    fileUri: str
    fileSizeBytes: int
    verifiedStatus: str
    rejectionReason: Optional[str] = None
    uploadedAt: datetime

    model_config = ConfigDict(from_attributes=True)
