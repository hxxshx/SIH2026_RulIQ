from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.user import User

class ComplianceAlert(Base):
    __tablename__ = "compliance_alerts"
    __table_args__ = (
        Index("ix_alerts_resolved_severity", "is_resolved", "severity"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    requirement_id: Mapped[Optional[int]] = mapped_column(ForeignKey("compliance_requirements.id", ondelete="SET NULL"), nullable=True)
    severity: Mapped[str] = mapped_column(String(50), default="high", nullable=False) # critical, high, medium, info
    alert_type: Mapped[str] = mapped_column(String(100), nullable=False) # deadline_overdue, evidence_missing, regulatory_breach, rule_impact
    message: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_action: Mapped[str] = mapped_column(Text, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    resolved_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="alerts")
    resolved_by: Mapped[Optional["User"]] = relationship("User")
