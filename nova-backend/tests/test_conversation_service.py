from fastapi.testclient import TestClient
from app.main import app
from app.services.conversation.entity_extractor import extract_entities
from app.services.conversation.context_resolver import resolve_context
from app.services.conversation.conversation_summary import update_summary
from app.services.conversation.conversation_service import (
    get_history,
    add_record,
    update_knowledge_graph
)
from app.models.schemas import ConversationRecord, VisitorMemory
import uuid
import pytest

client = TestClient(app)

def test_entity_extractor():
    # 1. Single matches
    assert "Three.js" in extract_entities("I like Three.js and webgl")
    assert "Python" in extract_entities("Writing Python scripts")
    
    # 2. Word boundary check for short words
    assert "Python" not in extract_entities("happy copy spy") # no py
    
    # 3. Multiple entities
    ents = extract_entities("Do you use React, Supabase, and FastAPI?")
    assert "React" in ents
    assert "Supabase" in ents
    assert "FastAPI" in ents

def test_context_resolver():
    # Construct fake history records
    history = [
        ConversationRecord(
            sessionId="test-session",
            timestamp="2026-06-25T00:00:00Z",
            userMessage="open project petal-npins",
            assistantReply="Opened Petal n Pins project.",
            intent="projects",
            entities=["Petal n Pins"],
            topics=["projects"],
            summary="Opened Petal n Pins.",
            payload="petal-npins"
        )
    ]
    
    # "show it again"
    assert resolve_context("show it again", history) == "open project petal-npins"
    # "tell me more"
    assert resolve_context("tell me more", history) == "tell me more about project petal-npins"
    # "that project"
    assert resolve_context("that project", history) == "open project petal-npins"

    # Multi-turn history with two projects
    history.append(
        ConversationRecord(
            sessionId="test-session",
            timestamp="2026-06-25T00:01:00Z",
            userMessage="open project portfolio-os",
            assistantReply="Opened Portfolio OS.",
            intent="projects",
            entities=["Portfolio"],
            topics=["projects"],
            summary="Opened Portfolio OS.",
            payload="portfolio-os"
        )
    )
    # "the previous one" should point to "petal-npins"
    assert resolve_context("the previous one", history) == "open project petal-npins"

def test_conversation_summary():
    s1 = update_summary("", "Who are you?", "I am NOVA.", "about")
    assert "Session started. Asked about Shadab's background." in s1
    
    s2 = update_summary(s1, "What are your skills?", "I know Python.", "skills")
    assert "Session started. Asked about Shadab's background. Then, asked about technical skills." in s2

def test_history_ordering_and_store():
    session_id = str(uuid.uuid4())
    
    r1 = ConversationRecord(
        sessionId=session_id,
        timestamp="2026-06-25T01:00:00Z",
        userMessage="First",
        assistantReply="Reply 1",
        intent="about",
        entities=[],
        topics=[],
        summary="Summary 1"
    )
    r2 = ConversationRecord(
        sessionId=session_id,
        timestamp="2026-06-25T01:02:00Z",
        userMessage="Second",
        assistantReply="Reply 2",
        intent="skills",
        entities=[],
        topics=[],
        summary="Summary 2"
    )
    
    add_record(session_id, r1)
    add_record(session_id, r2)
    
    history = get_history(session_id)
    assert len(history) == 2
    assert history[0].userMessage == "First"
    assert history[1].userMessage == "Second"

def test_knowledge_graph_updates():
    memory = VisitorMemory(
        visitCount=1,
        topics=[],
        questions=[],
        lastName=None,
        sessionId="graph-session",
        knowledgeGraph={}
    )
    
    # 1. Update with project info
    mem_updated = update_knowledge_graph(
        memory,
        "Tell me about Petal n Pins",
        {"intent": "projects", "payload": "petal-npins"},
        ["Petal n Pins"]
    )
    assert "Petal n Pins" in mem_updated.knowledgeGraph["projects"]
    
    # 2. Update with skill info
    mem_updated = update_knowledge_graph(
        mem_updated,
        "Do you know Python?",
        {"intent": "skills", "payload": None},
        ["Python"]
    )
    assert "Python" in mem_updated.knowledgeGraph["skills"]

def test_api_history_intents():
    # 1. Start session
    sess_resp = client.post("/api/v1/session")
    session_id = sess_resp.json()["sessionId"]
    
    # 2. Perform some queries to populate memory and history
    client.post("/api/v1/query", json={"text": "Tell me about yourself", "memory": {"sessionId": session_id}})
    client.post("/api/v1/query", json={"text": "I like React and Python", "memory": {"sessionId": session_id}})
    client.post("/api/v1/query", json={"text": "Open project petal-npins", "memory": {"sessionId": session_id}})

    # 3. Test "What were we talking about?"
    resp = client.post("/api/v1/query", json={"text": "What were we talking about?", "memory": {"sessionId": session_id}})
    assert resp.status_code == 200
    assert "projects" in resp.json()["reply"]
    assert "skills" in resp.json()["reply"]

    # 4. Test "Summarize this session."
    resp = client.post("/api/v1/query", json={"text": "Summarize this session.", "memory": {"sessionId": session_id}})
    assert resp.status_code == 200
    assert "Session started" in resp.json()["reply"]
    
    # 5. Test "What projects interested me?"
    resp = client.post("/api/v1/query", json={"text": "What projects interested me?", "memory": {"sessionId": session_id}})
    assert resp.status_code == 200
    assert "Petal n Pins" in resp.json()["reply"]

    # 6. Test "What skills did I ask about?"
    resp = client.post("/api/v1/query", json={"text": "What skills did I ask about?", "memory": {"sessionId": session_id}})
    assert resp.status_code == 200
    assert "React" in resp.json()["reply"]
    assert "Python" in resp.json()["reply"]
