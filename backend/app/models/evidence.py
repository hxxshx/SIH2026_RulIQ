from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.rule import ComplianceRequirement

class ApplicationRequirement(Base):
    __tablename__ = "application_requirements"
    __table_args__ = (
        UniqueConstraint("application_id", "requirement_id", name="uq_app_requirement"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    requirement_id: Mapped[int] = mapped_column(ForeignKey("compliance_requirements.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="missing_evidence", nullable=False) # compliant, non_compliant, missing_evidence, waived
    current_value: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="application_requirements")
    requirement: Mapped["ComplianceRequirement"] = relationship("ComplianceRequirement", back_populates="app_mappings")

class EvidenceRecord(Base):
    __tablename__ = "evidence_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    requirement_id: Mapped[Optional[int]] = mapped_column(ForeignKey("compliance_requirements.id", ondelete="SET NULL"), nullable=True)
    document_type: Mapped[str] = mapped_column(String(100), nullable=False) # faculty_roster, land_deed, fire_noc, fdr_receipt
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_uri: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    verified_status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False) # pending, verified, rejected
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="evidence_records")
