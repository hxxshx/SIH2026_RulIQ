from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import (
    ReviewDecision,
    Application,
    RecoveryRecommendation,
    AuditLog,
    User,
)
from app.schemas.common import ResponseEnvelope
from app.schemas.review import ReviewDecisionCreateSchema, ReviewDecisionSchema

router = APIRouter()

@router.post("/decisions", response_model=ResponseEnvelope[ReviewDecisionSchema])
def record_review_decision(
    payload: ReviewDecisionCreateSchema,
    db: Session = Depends(get_db),
):
    """Records an official human review decision on an application recommendation. Never automated."""
    now = datetime.now(timezone.utc)

    # 1. Validate application exists
    app = db.query(Application).filter(Application.id == payload.application_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {payload.application_id} not found."
        )

    # 2. Update recommendation if specified
    rec = None
    if payload.recommendation_id:
        rec = db.query(RecoveryRecommendation).filter(
            RecoveryRecommendation.id == payload.recommendation_id
        ).first()
        if rec:
            rec.status = payload.decision # accepted, rejected, modified

    # 3. Create ReviewDecision
    review = ReviewDecision(
        application_id=payload.application_id,
        recommendation_id=payload.recommendation_id,
        reviewer_id=payload.reviewer_id,
        decision=payload.decision,
        official_remarks=payload.remarks,
        decided_at=now,
    )
    db.add(review)
    db.flush()

    # 4. Append Immutable Audit Log
    audit = AuditLog(
        entity_name="Application",
        entity_id=str(app.id),
        action=f"HUMAN_REVIEW_{payload.decision.upper()}",
        performed_by_id=payload.reviewer_id,
        new_values={
            "decision": payload.decision,
            "remarks": payload.remarks,
            "recommendation_id": payload.recommendation_id,
        },
        ip_address="127.0.0.1",
    )
    db.add(audit)
    db.commit()
    db.refresh(review)

    reviewer_name = review.reviewer.full_name if review.reviewer else "AICTE Scrutiny Officer"

    res_data = ReviewDecisionSchema(
        id=review.id,
        applicationId=review.application_id,
        recommendationId=review.recommendation_id,
        reviewerId=review.reviewer_id,
        reviewerName=reviewer_name,
        decision=review.decision,
        officialRemarks=review.official_remarks,
        decidedAt=review.decided_at,
    )

    return ResponseEnvelope(
        success=True,
        data=res_data,
        message=f"Human review decision '{payload.decision}' successfully registered with official remarks."
    )

@router.get("/by-application/{application_id}", response_model=ResponseEnvelope[List[ReviewDecisionSchema]])
def list_application_reviews(application_id: int, db: Session = Depends(get_db)):
    """Retrieves all official review decisions recorded for a specific application."""
    reviews = (
        db.query(ReviewDecision)
        .filter(ReviewDecision.application_id == application_id)
        .order_by(ReviewDecision.decided_at.desc())
        .all()
    )

    results = [
        ReviewDecisionSchema(
            id=r.id,
            applicationId=r.application_id,
            recommendationId=r.recommendation_id,
            reviewerId=r.reviewer_id,
            reviewerName=r.reviewer.full_name if r.reviewer else "AICTE Scrutiny Officer",
            decision=r.decision,
            officialRemarks=r.official_remarks,
            decidedAt=r.decided_at,
        )
        for r in reviews
    ]
    return ResponseEnvelope(success=True, data=results)
