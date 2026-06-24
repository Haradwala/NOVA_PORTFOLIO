from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_about_intents():
    queries = [
        "Tell me about yourself",
        "Who are you",
        "Tell me about Shadab",
        "What's your background",
        "Tell me about yourself?"
    ]
    for q in queries:
        response = client.post(
            "/api/v1/query",
            json={"text": q, "memory": {"visitCount": 1, "topics": []}, "history": []}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "about"
        assert len(data["reply"]) > 0
        assert data["confidence"] > 0.8
        # Validate debug metadata is present in dev/debug mode
        assert "debug" in data
        assert data["debug"] is not None
        assert data["debug"]["matched_intent"] == "about"
