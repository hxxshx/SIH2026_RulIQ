import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.engine.graph_builder import RegulatoryGraphBuilder
from app.engine.impact_analyzer import ImpactAnalyzer

def test_graph_builder_structure(db_session: Session):
    builder = RegulatoryGraphBuilder(db_session)
    graph = builder.build_graph()

    # Assert node categories exist
    nodes = list(graph.nodes(data=True))
    node_types = {data.get("type") for _, data in nodes}
    assert "rule" in node_types
    assert "requirement" in node_types
    assert "application" in node_types
    assert "evidence" in node_types

    # Assert downstream traversal
    downstream_apps = builder.get_downstream_applications(1)
    assert len(downstream_apps) > 0

def test_deterministic_impact_analyzer_logic(db_session: Session):
    analyzer = ImpactAnalyzer(db_session)

    # Simulate SFR tightened from 1:20 to 1:15
    report = analyzer.simulate_rule_amendment(
        rule_id=1,
        simulated_parameters={"student_faculty_ratio_ug": 15}
    )

    assert report.totalEvaluated == 6
    assert report.totalImpacted >= 1
    assert report.totalConditionallyImpacted >= 1
    assert report.totalUnaffected >= 1

    # Check reason explanations
    impacted = [r for r in report.results if r.impactStatus == "impacted_non_compliant"]
    assert len(impacted) > 0
    for imp in impacted:
        assert "violates proposed threshold" in imp.reasonExplanation
        assert len(imp.recommendations) > 0

    # Check missing evidence classification
    conditional = [r for r in report.results if r.impactStatus == "conditionally_impacted"]
    assert len(conditional) > 0
    for cond in conditional:
        assert "Missing Evidence" in cond.reasonExplanation

def test_api_simulate_endpoint(client: TestClient):
    payload = {
        "rule_id": 1,
        "simulated_parameters": {"student_faculty_ratio_ug": 15}
    }
    response = client.post("/api/v1/impact-analysis/simulate", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["ruleCode"] == "AICTE-APH-CH2-FAC"
    assert "graph" in data
    assert len(data["graph"]["nodes"]) > 0
    assert len(data["graph"]["edges"]) > 0

def test_api_graph_subgraph_endpoint(client: TestClient):
    response = client.get("/api/v1/impact-analysis/graph/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "nodes" in data
    assert "edges" in data
    assert any(n["type"] == "rule" for n in data["nodes"])
    assert any(n["type"] == "requirement" for n in data["nodes"])
