import httpx
import pytest

ROUTES = [
    "/",
    "/applications",
    "/rules",
    "/impact-analysis",
    "/alerts",
    "/evidence",
    "/audit-logs",
    "/settings"
]

@pytest.mark.parametrize("route", ROUTES)
def test_frontend_routes_render(route):
    try:
        response = httpx.get(f"http://localhost:3000{route}", timeout=10.0)
        assert response.status_code == 200, f"Route {route} failed with status {response.status_code}"
        assert len(response.text) > 0
    except httpx.ConnectError:
        pytest.skip("Next.js dev server not running locally")
