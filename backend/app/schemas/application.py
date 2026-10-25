from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.institution import InstitutionSchema

class ApplicationRequirementSchema(BaseModel):
    id: int
    reqCode: str
    title: str
    category: str
    isMandatory: bool
    status: str
    currentValue: Optional[str] = None
    thresholdValue: str
    operator: str
    unit: str
    notes: Optional[str] = None

class EvidenceRecordSchema(BaseModel):
    id: int
    documentType: str
    fileName: str
    fileUri: str
    fileSizeBytes: int
    verifiedStatus: str
    rejectionReason: Optional[str] = None
    uploadedAt: datetime

class ApplicationListItemSchema(BaseModel):
    id: int
    applicationNumber: str
    institution: InstitutionSchema
    academicYear: str
    applicationType: str
    status: str
    submissionDate: datetime
    deadline: datetime
    isOverdue: bool
    totalRequirements: int
    metRequirements: int
    missingEvidenceCount: int

class ApplicationDetailSchema(ApplicationListItemSchema):
    requirements: List[ApplicationRequirementSchema] = []
    evidenceRecords: List[EvidenceRecordSchema] = []

class ApplicationStageUpdateSchema(BaseModel):
    status: str
    remarks: Optional[str] = None
