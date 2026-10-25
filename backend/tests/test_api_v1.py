import pytest
from fastapi.testclient import TestClient

def test_api_dashboard_stats(client: TestClient):
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["totalApplications"] == 6
    assert data["activeRulesCount"] == 4
    assert data["criticalAlertsCount"] >= 2
    assert data["overdueCount"] >= 1

def test_api_dashboard_pipeline(client: TestClient):
    response = client.get("/api/v1/dashboard/pipeline")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert len(data) >= 3

def test_api_list_applications(client: TestClient):
    response = client.get("/api/v1/applications")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    apps = res["data"]
    assert len(apps) == 6
    
    first = apps[0]
    assert "applicationNumber" in first
    assert "institution" in first
    assert "totalRequirements" in first
    assert "metRequirements" in first

def test_api_filter_applications(client: TestClient):
    response = client.get("/api/v1/applications?status=compliance_pending")
    assert response.status_code == 200
    apps = response.json()["data"]
    assert len(apps) == 2
    for a in apps:
        assert a["status"] == "compliance_pending"

def test_api_application_detail(client: TestClient):
    response = client.get("/api/v1/applications/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["applicationNumber"] == "APP-2026-UP-0012"
    assert len(data["requirements"]) > 0

def test_api_list_rules(client: TestClient):
    response = client.get("/api/v1/rules")
    assert response.status_code == 200
    res = response.json()
    rules = res["data"]
    assert len(rules) == 4
    codes = [r["ruleCode"] for r in rules]
    assert "AICTE-APH-CH2-FAC" in codes

def test_api_list_and_resolve_alert(client: TestClient):
    response = client.get("/api/v1/alerts?is_resolved=false&severity=critical")
    assert response.status_code == 200
    alerts = response.json()["data"]
    assert len(alerts) >= 2
    alert_id = alerts[0]["id"]

    patch_res = client.patch(f"/api/v1/alerts/{alert_id}/resolve", json={"remarks": "Checked during scrutiny"})
    assert patch_res.status_code == 200
    resolved = patch_res.json()["data"]
    assert resolved["isResolved"] is True

def test_api_update_stage(client: TestClient):
    response = client.patch("/api/v1/applications/1/stage", json={"status": "under_scrutiny", "remarks": "Documents submitted"})
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["status"] == "under_scrutiny"
