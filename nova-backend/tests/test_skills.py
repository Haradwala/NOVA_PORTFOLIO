from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_skills_intents():
    queries = [
        "What are your skills?",
        "Show me your tech stack",
        "What technologies do you use?"
    ]
    for q in queries:
        response = client.post(
            "/api/v1/query",
            json={"text": q, "memory": {"visitCount": 1, "topics": []}, "history": []}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "skills"
        assert data["action"] == "highlight_skills"
        assert data["preview"] is not None
        assert data["preview"]["type"] == "skills"
        assert "categories" in data["preview"]["data"]
        assert "rawList" in data["preview"]["data"]
        assert "skills" in data["updated_memory"]["topics"]
