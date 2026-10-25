from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ReviewDecisionCreateSchema(BaseModel):
    application_id: int
    recommendation_id: Optional[int] = None
    decision: str # accepted, rejected, modified
    remarks: str
    reviewer_id: Optional[int] = None

class ReviewDecisionSchema(BaseModel):
    id: int
    applicationId: int
    recommendationId: Optional[int] = None
    reviewerId: Optional[int] = None
    reviewerName: Optional[str] = "AICTE Scrutiny Officer"
    decision: str
    officialRemarks: str
    decidedAt: datetime

    model_config = ConfigDict(from_attributes=True)
