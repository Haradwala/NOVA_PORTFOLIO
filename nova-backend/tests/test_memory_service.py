from fastapi.testclient import TestClient
from app.main import app
from app.services.memory.memory_service import (
    get_memory,
    create_memory,
    update_memory,
    remember_name,
    remember_topic,
    remember_question,
    build_memory_summary
)
from app.models.schemas import VisitorMemory
from datetime import datetime, timedelta
import uuid

client = TestClient(app)

def test_session_creation():
    # 1. Create session via POST /api/v1/session
    response = client.post("/api/v1/session")
    assert response.status_code == 200
    data = response.json()
    assert "sessionId" in data
    assert uuid.UUID(data["sessionId"]) # Verify it's a valid UUID4
    
    # Verify memory record exists in store
    mem = get_memory(data["sessionId"])
    assert mem is not None
    assert mem.visitCount == 1
    assert mem.topics == []
    assert mem.questions == []
    assert mem.lastName is None

def test_store_and_recall_name():
    # 1. Create session
    sess_resp = client.post("/api/v1/session")
    session_id = sess_resp.json()["sessionId"]

    # 2. Store name by querying "I'm Shadab"
    response = client.post(
        "/api/v1/query",
        json={"text": "I'm Shadab", "memory": {"session_id": session_id}}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["updated_memory"]["lastName"] == "Shadab"

    # 3. Query "What is my name?" to recall name
    response = client.post(
        "/api/v1/query",
        json={"text": "What is my name?", "memory": {"session_id": session_id}}
    )
    assert response.status_code == 200
    data = response.json()
    assert "Shadab" in data["reply"]

    # 4. Query "What's my name" to recall name
    response = client.post(
        "/api/v1/query",
        json={"text": "what's my name", "memory": {"session_id": session_id}}
    )
    assert response.status_code == 200
    data = response.json()
    assert "Shadab" in data["reply"]

def test_visit_tracking_backend_owned():
    # 1. Create session
    sess_resp = client.post("/api/v1/session")
    session_id = sess_resp.json()["sessionId"]

    # 2. Verify visitCount starts at 1
    mem = get_memory(session_id)
    assert mem.visitCount == 1

    # 3. Attempt query sending visitCount=99 from client
    response = client.post(
        "/api/v1/query",
        json={"text": "Hello", "memory": {"session_id": session_id, "visitCount": 99}}
    )
    assert response.status_code == 200
    data = response.json()
    # Should still be 1 (frontend is ignored)
    assert data["updated_memory"]["visitCount"] == 1

    # 4. Modify lastVisit in DB to be 40 minutes ago to simulate a new visit
    mem = get_memory(session_id)
    past_time = (datetime.utcnow() - timedelta(minutes=40)).isoformat() + "Z"
    mem.lastVisit = past_time
    from app.services.memory.memory_store import get_store
    get_store().save(session_id, mem)


    # 5. Query again (triggers backend-owned increment)
    response = client.post(
        "/api/v1/query",
        json={"text": "Hello again", "memory": {"session_id": session_id}}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["updated_memory"]["visitCount"] == 2

def test_topic_tracking_and_no_duplicates():
    session_id = str(uuid.uuid4())
    create_memory(session_id)

    # 1. Remember topic once
    mem = remember_topic(session_id, "skills")
    assert "skills" in mem.topics
    assert len(mem.topics) == 1

    # 2. Try adding same topic again
    mem = remember_topic(session_id, "skills")
    assert len(mem.topics) == 1 # Duplicate ignored

    # 3. Add a different topic
    mem = remember_topic(session_id, "projects")
    assert "projects" in mem.topics
    assert len(mem.topics) == 2

def test_question_tracking_limit_and_duplicates():
    session_id = str(uuid.uuid4())
    create_memory(session_id)

    # 1. Add questions
    mem = remember_question(session_id, "Hello")
    assert mem.questions == ["Hello"]

    # 2. Add consecutive duplicate question (ignored)
    mem = remember_question(session_id, "Hello")
    assert mem.questions == ["Hello"]

    # 3. Add a non-consecutive duplicate (allowed)
    mem = remember_question(session_id, "World")
    mem = remember_question(session_id, "Hello")
    assert mem.questions == ["Hello", "World", "Hello"]

    # 4. Fill up past limit of 10
    for i in range(15):
        mem = remember_question(session_id, f"Query {i}")

    # Verify length is capped at 10 and stores latest 10
    assert len(mem.questions) == 10
    assert mem.questions[0] == "Query 5"
    assert mem.questions[-1] == "Query 14"

def test_recall_memory_summary():
    # 1. Create session
    sess_resp = client.post("/api/v1/session")
    session_id = sess_resp.json()["sessionId"]

    # 2. Query to populate topics, name, and questions
    client.post("/api/v1/query", json={"text": "I'm Shadab", "memory": {"session_id": session_id}})
    client.post("/api/v1/query", json={"text": "Tell me about your projects", "memory": {"session_id": session_id}})
    
    # 3. Query "What do you remember about me?"
    response = client.post(
        "/api/v1/query",
        json={"text": "What do you remember about me?", "memory": {"session_id": session_id}}
    )
    assert response.status_code == 200
    data = response.json()
    reply = data["reply"]
    
    # Assert summary details are in the reply
    assert "Shadab" in reply
    assert "projects" in reply
    assert "I'm Shadab" in reply or "projects" in reply
