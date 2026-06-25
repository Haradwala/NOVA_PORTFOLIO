import pytest
import json
from fastapi.testclient import TestClient
from app.main import app
from app.services.orchestrator.provider_registry import get_registry, ProviderRegistry
from app.services.orchestrator.context_selector import select_context
from app.services.orchestrator.request_builder import build_ai_request
from app.services.orchestrator.response_normalizer import normalize_response
from app.services.orchestrator.orchestrator import coordinate_ai_call
from app.services.providers.mock_provider import MockProvider

@pytest.fixture(autouse=True)
def setup_mock_provider():
    """Ensure MockProvider is registered in the global registry for all tests."""
    reg = get_registry()
    if not reg.exists("mock"):
        reg.register(MockProvider())

def test_registry_operations():
    """Verify registry registration, lookup, default selection, listing, and unregistration."""
    registry = ProviderRegistry()
    mock_prov = MockProvider()
    
    # Registration & Exists
    registry.register(mock_prov)
    assert registry.exists("mock")
    assert "mock" in registry.list()
    assert registry.default().name() == "mock"
    
    # Get & Set Default
    assert registry.get("mock") == mock_prov
    registry.set_default("mock")
    
    # Health checks
    h = registry.health()
    assert h["mock"] is True
    
    # Unregistration
    registry.unregister("mock")
    assert not registry.exists("mock")
    assert len(registry.list()) == 0

def test_startup_registration():
    """Verify that MockProvider is registered automatically in get_registry() during app bootstrap."""
    import os
    with TestClient(app) as client:
        registry = get_registry()
        assert registry.exists("mock")
        expected_default = "openai" if os.getenv("OPENAI_API_KEY") else "mock"
        assert registry.default().name() == expected_default

def test_context_limit():
    """Verify context selection is properly prioritized and constrained by max_bytes limits."""
    context_data = {
        "memory": [{"key": "name", "value": "Shadab", "score": 1.0}],
        "conversation": {"summary": "Session started.", "topics": ["about"]},
        "entities": ["React", "Python"],
        "knowledge": [{"id": "tech:react", "type": "tech", "name": "React", "metadata": {}}],
        "relationship_graph": {
            "nodes": [{"id": "visitor:123", "type": "visitor", "name": "Visitor"}],
            "edges": []
        }
    }
    
    # Large context fits completely
    selected = select_context(context_data, max_bytes=4096)
    assert "permanent_memory" in selected
    assert "conversation_summary" in selected
    assert "current_entities" in selected
    assert "recent_conversation" in selected
    assert "knowledge" in selected
    assert "relationship_graph" in selected
    
    # Constrained context drops low-priority segments to stay under max_bytes limit
    limit = 150
    selected_small = select_context(context_data, max_bytes=limit)
    serialized = json.dumps(selected_small, ensure_ascii=False)
    assert len(serialized.encode("utf-8")) <= limit

def test_request_builder():
    """Verify request builder construct formats correctly without raw prompt compilation."""
    req = build_ai_request("query text", {"mem": "data"}, {"meta": "val"})
    assert req["query"] == "query text"
    assert req["context"] == {"mem": "data"}
    assert req["metadata"] == {"meta": "val"}

def test_response_normalization():
    """Verify provider output normalizer structure and fields mapping."""
    norm = normalize_response(
        provider_name="mock",
        model_name="mock-model",
        content="reply text",
        timing={"time": 0.05}
    )
    assert norm["provider"] == "mock"
    assert norm["model"] == "mock-model"
    assert norm["content"] == "reply text"
    assert norm["status"] == "success"
    assert "request_id" in norm
    assert norm["timing"] == {"time": 0.05}

def test_strategy_routing_via_api():
    """Verify rule-engine bypass on high-confidence match and mock provider fallback on query fallbacks."""
    with TestClient(app) as client:
        # 1. Rule-engine bypass (intent is NOT fallback)
        response = client.post(
            "/api/v1/query",
            json={"text": "What are your skills?", "memory": {"visitCount": 1, "topics": []}, "history": []}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "skills"
        assert "My skillset is structured" in data["reply"]
        
        # 2. Mock fallback (intent IS fallback)
        response_fallback = client.post(
            "/api/v1/query",
            json={"text": "xyz abc random query", "memory": {"visitCount": 1, "topics": []}, "history": []}
        )
        assert response_fallback.status_code == 200
        data_fb = response_fallback.json()
        assert data_fb["intent"] == "fallback"
        assert "simulated AI response from the MockProvider" in data_fb["reply"]

def test_orchestrator_coordinate_call():
    """Verify coordinate_ai_call directly dispatches to provider and structures result."""
    normalized = coordinate_ai_call("test-session-id", "test query")
    assert normalized["provider"] == "mock"
    assert normalized["status"] == "success"
    assert "MockProvider" in normalized["content"]
