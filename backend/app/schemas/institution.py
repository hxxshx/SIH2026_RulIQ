from datetime import datetime
from pydantic import BaseModel, ConfigDict

class InstitutionSchema(BaseModel):
    id: int
    aictePermanentId: str
    name: str
    state: str
    district: str
    category: str
    contactEmail: str

    model_config = ConfigDict(from_attributes=True)
