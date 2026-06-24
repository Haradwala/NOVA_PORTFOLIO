from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_name_extraction():
    # 1. Create session
    sess_resp = client.post("/api/v1/session")
    assert sess_resp.status_code == 200
    session_id = sess_resp.json()["sessionId"]

    # 2. Query
    response = client.post(
        "/api/v1/query",
        json={"text": "Hello, my name is Alex", "memory": {"session_id": session_id, "topics": ["skills"]}, "history": []}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["updated_memory"]["lastName"] == "Alex"
    # Verify existing topics are preserved
    assert "skills" in data["updated_memory"]["topics"]
    assert data["updated_memory"]["visitCount"] == 1

def test_topics_preservation():
    # 1. Create session
    sess_resp = client.post("/api/v1/session")
    assert sess_resp.status_code == 200
    session_id = sess_resp.json()["sessionId"]

    # 2. Query
    response = client.post(
        "/api/v1/query",
        json={"text": "Show me your projects", "memory": {"session_id": session_id, "topics": ["skills", "about"]}, "history": []}
    )
    assert response.status_code == 200
    data = response.json()
    topics = data["updated_memory"]["topics"]
    assert "skills" in topics
    assert "about" in topics
    assert "projects" in topics

