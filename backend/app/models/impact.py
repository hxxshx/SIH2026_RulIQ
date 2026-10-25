from datetime import datetime, timezone
from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Integer, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.rule import RuleVersion
    from app.models.review import ReviewDecision

class ImpactAnalysisRun(Base):
    __tablename__ = "impact_analysis_runs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    rule_version_id: Mapped[Optional[int]] = mapped_column(ForeignKey("rule_versions.id", ondelete="SET NULL"), nullable=True)
    triggered_by_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    simulated_parameters: Mapped[Any] = mapped_column(JSON, default=dict, nullable=False)
    total_evaluated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_impacted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_unaffected: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    run_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    rule_version: Mapped[Optional["RuleVersion"]] = relationship("RuleVersion", back_populates="simulation_runs")
    results: Mapped[List["ImpactAnalysisResult"]] = relationship(
        "ImpactAnalysisResult",
        back_populates="run",
        cascade="all, delete-orphan"
    )

class ImpactAnalysisResult(Base):
    __tablename__ = "impact_analysis_results"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("impact_analysis_runs.id", ondelete="CASCADE"), nullable=False)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    impact_status: Mapped[str] = mapped_column(String(50), nullable=False) # impacted_non_compliant, conditionally_impacted, unaffected
    reason_explanation: Mapped[str] = mapped_column(Text, nullable=False)
    unmet_requirements_summary: Mapped[Any] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    run: Mapped["ImpactAnalysisRun"] = relationship("ImpactAnalysisRun", back_populates="results")
    application: Mapped["Application"] = relationship("Application", back_populates="impact_results")
    recommendations: Mapped[List["RecoveryRecommendation"]] = relationship(
        "RecoveryRecommendation",
        back_populates="result",
        cascade="all, delete-orphan"
    )

class RecoveryRecommendation(Base):
    __tablename__ = "recovery_recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    result_id: Mapped[int] = mapped_column(ForeignKey("impact_analysis_results.id", ondelete="CASCADE"), nullable=False)
    requirement_id: Mapped[Optional[int]] = mapped_column(ForeignKey("compliance_requirements.id", ondelete="SET NULL"), nullable=True)
    action_title: Mapped[str] = mapped_column(String(255), nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    remediation_type: Mapped[str] = mapped_column(String(100), nullable=False) # recruit_faculty, expand_carpet_area, upload_fire_noc
    urgency: Mapped[str] = mapped_column(String(50), default="high", nullable=False) # critical, high, medium
    is_actionable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="suggested", nullable=False) # suggested, accepted, rejected, changes_requested
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    result: Mapped["ImpactAnalysisResult"] = relationship("ImpactAnalysisResult", back_populates="recommendations")
    review_decisions: Mapped[List["ReviewDecision"]] = relationship(
        "ReviewDecision",
        back_populates="recommendation"
    )
