from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel

T = TypeVar("T")

class ResponseEnvelope(BaseModel, Generic[T]):
    success: bool = True
    data: T
    message: Optional[str] = None
    meta: Optional[dict[str, Any]] = None

class PaginatedMeta(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
