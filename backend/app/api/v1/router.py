from fastapi import APIRouter
from app.api.v1.endpoints import (
    dashboard,
    applications,
    rules,
    alerts,
    audit,
    impact,
    reviews,
    evidence,
)

api_router = APIRouter()

@api_router.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "RULIQ Backend API",
        "version": "1.0.0",
        "mode": "deterministic_regulatory_engine"
    }

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(rules.router, prefix="/rules", tags=["Regulatory Rules"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Compliance Alerts"])
api_router.include_router(audit.router, prefix="/audit-logs", tags=["Audit Trail"])
api_router.include_router(impact.router, prefix="/impact-analysis", tags=["Impact Analysis"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Human Review"])
api_router.include_router(evidence.router, prefix="/evidence", tags=["Evidence Repository"])
