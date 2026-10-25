from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.institution import Institution
    from app.models.evidence import ApplicationRequirement, EvidenceRecord
    from app.models.alert import ComplianceAlert
    from app.models.review import ReviewDecision
    from app.models.impact import ImpactAnalysisResult

class Application(Base, TimestampMixin):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    application_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    institution_id: Mapped[int] = mapped_column(ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    academic_year: Mapped[str] = mapped_column(String(20), default="2026-2027", nullable=False)
    application_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="submitted", index=True, nullable=False)
    submission_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)

    # Relationships
    institution: Mapped["Institution"] = relationship("Institution", back_populates="applications")
    application_requirements: Mapped[List["ApplicationRequirement"]] = relationship(
        "ApplicationRequirement",
        back_populates="application",
        cascade="all, delete-orphan"
    )
    evidence_records: Mapped[List["EvidenceRecord"]] = relationship(
        "EvidenceRecord",
        back_populates="application",
        cascade="all, delete-orphan"
    )
    alerts: Mapped[List["ComplianceAlert"]] = relationship(
        "ComplianceAlert",
        back_populates="application",
        cascade="all, delete-orphan"
    )
    review_decisions: Mapped[List["ReviewDecision"]] = relationship(
        "ReviewDecision",
        back_populates="application",
        cascade="all, delete-orphan"
    )
    impact_results: Mapped[List["ImpactAnalysisResult"]] = relationship(
        "ImpactAnalysisResult",
        back_populates="application",
        cascade="all, delete-orphan"
    )
