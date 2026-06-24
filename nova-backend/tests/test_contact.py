from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_contact_intent():
    queries = [
        "How can I contact you?",
        "What is your email?",
        "Are you available for hire?"
    ]
    for q in queries:
        response = client.post(
            "/api/v1/query",
            json={"text": q, "memory": {"visitCount": 1, "topics": []}, "history": []}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "contact"
        assert data["action"] == "scroll_contact"
        assert data["preview"] is not None
        assert data["preview"]["type"] == "contact"
        assert data["preview"]["data"]["email"] == "hello@shadab.design"
        assert "contact" in data["updated_memory"]["topics"]
