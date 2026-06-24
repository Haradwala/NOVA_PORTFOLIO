from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_general_projects():
    response = client.post(
        "/api/v1/query",
        json={"text": "Show me your projects", "memory": {"visitCount": 1, "topics": []}, "history": []}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "projects"
    assert data["action"] == "scroll_projects"
    assert data["preview"] is None
    assert "projects" in data["updated_memory"]["topics"]

def test_specific_project():
    response = client.post(
        "/api/v1/query",
        json={"text": "Tell me about Petal n Pins", "memory": {"visitCount": 1, "topics": []}, "history": []}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "projects"
    assert data["action"] == "open_project"
    assert data["preview"] is not None
    assert data["preview"]["type"] == "project"
    
    proj_data = data["preview"]["data"]
    assert proj_data["id"] == "petal-npins"
    assert proj_data["route"] == "/work"
    assert "Stripe verification suite" in proj_data["features"]
    assert "React" in proj_data["tech"]
