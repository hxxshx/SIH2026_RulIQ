from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict

class SimulationRequestSchema(BaseModel):
    rule_id: int
    simulated_parameters: Dict[str, Any]

class RecommendationItemSchema(BaseModel):
    id: Optional[int] = None
    actionTitle: str
    recommendedAction: str
    remediationType: str
    urgency: str
    isActionable: bool
    status: str = "suggested"

class SimulationResultItemSchema(BaseModel):
    id: Optional[int] = None
    applicationId: int
    applicationNumber: str
    institutionName: str
    state: str
    impactStatus: str # impacted_non_compliant, conditionally_impacted, unaffected
    reasonExplanation: str
    unmetRequirementsSummary: List[Dict[str, Any]] = []
    recommendations: List[RecommendationItemSchema] = []

class GraphNodeSchema(BaseModel):
    id: str
    label: str
    type: str # rule, requirement, application, evidence
    category: Optional[str] = None
    status: Optional[str] = None

class GraphEdgeSchema(BaseModel):
    source: str
    target: str
    label: str

class DependencyGraphDataSchema(BaseModel):
    nodes: List[GraphNodeSchema]
    edges: List[GraphEdgeSchema]

class SimulationRunSummarySchema(BaseModel):
    id: int
    ruleVersionId: Optional[int] = None
    simulatedParameters: Dict[str, Any]
    totalEvaluated: int
    totalImpacted: int
    totalConditionallyImpacted: int
    totalUnaffected: int
    runTimestamp: datetime

class SimulationReportSchema(BaseModel):
    runId: int
    ruleCode: str
    ruleTitle: str
    simulatedParameters: Dict[str, Any]
    totalEvaluated: int
    totalImpacted: int
    totalConditionallyImpacted: int
    totalUnaffected: int
    results: List[SimulationResultItemSchema]
    graph: DependencyGraphDataSchema
