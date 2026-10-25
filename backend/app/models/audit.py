from datetime import datetime, timezone
from typing import Optional, Any
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_entity", "entity_name", "entity_id"),
        Index("ix_audit_timestamp", "timestamp"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    entity_name: Mapped[str] = mapped_column(String(100), nullable=False) # Application, RuleVersion, ReviewDecision
    entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False) # CREATE, UPDATE, SIMULATE, REVIEW_ACCEPTED, REVIEW_REJECTED
    performed_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    old_values: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    new_values: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
