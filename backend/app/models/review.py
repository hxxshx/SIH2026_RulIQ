from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.impact import RecoveryRecommendation
    from app.models.user import User

class ReviewDecision(Base):
    __tablename__ = "review_decisions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    recommendation_id: Mapped[Optional[int]] = mapped_column(ForeignKey("recovery_recommendations.id", ondelete="SET NULL"), nullable=True)
    reviewer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    decision: Mapped[str] = mapped_column(String(50), nullable=False) # accepted, rejected, modified
    official_remarks: Mapped[str] = mapped_column(Text, nullable=False)
    decided_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="review_decisions")
    recommendation: Mapped[Optional["RecoveryRecommendation"]] = relationship("RecoveryRecommendation", back_populates="review_decisions")
    reviewer: Mapped[Optional["User"]] = relationship("User")
