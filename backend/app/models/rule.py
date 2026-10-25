from datetime import datetime, timezone
from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Integer, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.evidence import ApplicationRequirement
    from app.models.impact import ImpactAnalysisRun

class RegulatoryRule(Base, TimestampMixin):
    __tablename__ = "regulatory_rules"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    rule_code: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # faculty, infrastructure, safety, finance
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    versions: Mapped[List["RuleVersion"]] = relationship(
        "RuleVersion",
        back_populates="rule",
        cascade="all, delete-orphan"
    )
    requirements: Mapped[List["ComplianceRequirement"]] = relationship(
        "ComplianceRequirement",
        back_populates="rule",
        cascade="all, delete-orphan"
    )

class RuleVersion(Base):
    __tablename__ = "rule_versions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    rule_id: Mapped[int] = mapped_column(ForeignKey("regulatory_rules.id", ondelete="CASCADE"), nullable=False)
    version_tag: Mapped[str] = mapped_column(String(50), nullable=False)
    change_summary: Mapped[str] = mapped_column(Text, nullable=False)
    parameters: Mapped[Any] = mapped_column(JSON, default=dict, nullable=False)
    effective_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_simulation: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    rule: Mapped["RegulatoryRule"] = relationship("RegulatoryRule", back_populates="versions")
    simulation_runs: Mapped[List["ImpactAnalysisRun"]] = relationship(
        "ImpactAnalysisRun",
        back_populates="rule_version"
    )

class ComplianceRequirement(Base, TimestampMixin):
    __tablename__ = "compliance_requirements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    rule_id: Mapped[int] = mapped_column(ForeignKey("regulatory_rules.id", ondelete="CASCADE"), nullable=False)
    req_code: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    parameter_key: Mapped[str] = mapped_column(String(100), nullable=False)
    operator: Mapped[str] = mapped_column(String(10), default="<=", nullable=False) # <=, >=, ==
    threshold_value: Mapped[str] = mapped_column(String(100), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relationships
    rule: Mapped["RegulatoryRule"] = relationship("RegulatoryRule", back_populates="requirements")
    app_mappings: Mapped[List["ApplicationRequirement"]] = relationship(
        "ApplicationRequirement",
        back_populates="requirement",
        cascade="all, delete-orphan"
    )
