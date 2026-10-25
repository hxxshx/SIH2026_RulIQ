from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import ImpactAnalysisRun, ImpactAnalysisResult, RecoveryRecommendation
from app.engine.impact_analyzer import ImpactAnalyzer
from app.engine.graph_builder import RegulatoryGraphBuilder
from app.schemas.common import ResponseEnvelope
from app.schemas.impact import (
    SimulationRequestSchema,
    SimulationReportSchema,
    SimulationRunSummarySchema,
    DependencyGraphDataSchema,
    GraphNodeSchema,
    GraphEdgeSchema,
    SimulationResultItemSchema,
    RecommendationItemSchema,
)

router = APIRouter()

@router.post("/simulate", response_model=ResponseEnvelope[SimulationReportSchema])
def run_simulation(
    payload: SimulationRequestSchema,
    db: Session = Depends(get_db),
):
    """Executes a NetworkX-based deterministic impact simulation for a proposed regulatory rule amendment."""
    try:
        analyzer = ImpactAnalyzer(db)
        report = analyzer.simulate_rule_amendment(
            rule_id=payload.rule_id,
            simulated_parameters=payload.simulated_parameters,
        )
        return ResponseEnvelope(
            success=True,
            data=report,
            message="Deterministic impact simulation completed successfully."
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation engine error: {str(e)}"
        )

@router.get("/graph/{rule_id}", response_model=ResponseEnvelope[DependencyGraphDataSchema])
def get_rule_dependency_graph(rule_id: int, db: Session = Depends(get_db)):
    """Retrieves NetworkX dependency graph data (nodes & edges) for a specific rule."""
    builder = RegulatoryGraphBuilder(db)
    builder.build_graph()
    raw = builder.get_subgraph_data(rule_id)

    graph_data = DependencyGraphDataSchema(
        nodes=[GraphNodeSchema(**n) for n in raw["nodes"]],
        edges=[GraphEdgeSchema(**e) for e in raw["edges"]],
    )
    return ResponseEnvelope(success=True, data=graph_data)

@router.get("/runs", response_model=ResponseEnvelope[List[SimulationRunSummarySchema]])
def list_simulation_runs(db: Session = Depends(get_db)):
    """Lists historical impact simulation runs."""
    runs = db.query(ImpactAnalysisRun).order_by(ImpactAnalysisRun.run_timestamp.desc()).all()
    summaries = []
    for r in runs:
        # Calculate breakdown
        conditional = sum(1 for res in r.results if res.impact_status == "conditionally_impacted")
        summaries.append(
            SimulationRunSummarySchema(
                id=r.id,
                ruleVersionId=r.rule_version_id,
                simulatedParameters=r.simulated_parameters,
                totalEvaluated=r.total_evaluated,
                totalImpacted=r.total_impacted,
                totalConditionallyImpacted=conditional,
                totalUnaffected=max(r.total_unaffected - conditional, 0),
                runTimestamp=r.run_timestamp,
            )
        )
    return ResponseEnvelope(success=True, data=summaries)
