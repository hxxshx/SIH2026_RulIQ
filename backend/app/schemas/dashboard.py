from typing import List
from pydantic import BaseModel

class DashboardStatsSchema(BaseModel):
    totalApplications: int
    pendingScrutiny: int
    compliancePending: int
    approved: int
    rejected: int
    overdueCount: int
    criticalAlertsCount: int
    activeRulesCount: int

class ApplicationStatusDistribution(BaseModel):
    name: str
    count: int
    fill: str

class MonthlyTrendPoint(BaseModel):
    month: str
    submitted: int
    approved: int
    complianceIssues: int
