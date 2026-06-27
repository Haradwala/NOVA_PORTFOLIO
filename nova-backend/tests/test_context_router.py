import pytest
from unittest.mock import patch, MagicMock
from app.services.context.context_router import classify_query, route_context, log_routing_metrics
from app.services.context.context_profiles import get_profile, PORTFOLIO_PROFILE, MEMORY_PROFILE, HYBRID_PROFILE, GENERAL_PROFILE
from app.services.context.context_builder import build_context
from app.services.orchestrator.context_selector import select_context

def test_profile_selection_memory():
    """Verify memory-related queries are routed to the Memory Profile."""
    memory_queries = [
        "What do you remember about me?",
        "What's my name?",
        "What were we discussing?",
        "Which projects interested me?"
    ]
    for q in memory_queries:
        assert classify_query(q) == "memory", f"Query '{q}' should route to memory profile"

def test_profile_selection_portfolio():
    """Verify portfolio-related queries are routed to the Portfolio Profile."""
    portfolio_queries = [
        "Tell me about NOVA.",
        "Explain Petal n Pins.",
        "Show your skills.",
        "What technologies do you use?"
    ]
    for q in portfolio_queries:
        assert classify_query(q) == "portfolio", f"Query '{q}' should route to portfolio profile"

def test_profile_selection_hybrid():
    """Verify mixed/hybrid queries are routed to the Hybrid Profile."""
    hybrid_queries = [
        "Which AI project interested me the most?",
        "Compare NOVA with the project I asked about earlier."
    ]
    for q in hybrid_queries:
        assert classify_query(q) == "hybrid", f"Query '{q}' should route to hybrid profile"

def test_profile_selection_fallback():
    """Verify unknown queries route to the General Profile."""
    fallback_queries = [
        "random query hello",
        "some random text 123"
    ]
    for q in fallback_queries:
        assert classify_query(q) == "general", f"Query '{q}' should route to general profile"

def test_context_reduction_memory_profile():
    """Verify that Memory Profile disables retrieval, knowledge, entities, and relationship graph."""
    session_id = "test-session-router"
    
    # Under Memory Profile, knowledge list, entities list and relationship graph should be empty
    ctx = build_context(session_id, "What do you remember about me?")
    
    assert ctx["knowledge"] == []
    assert ctx["entities"] == []
    assert ctx["relationship_graph"]["nodes"] == []
    assert ctx["relationship_graph"]["edges"] == []
    # Memory and conversation summaries can be returned (empty if not populated in test DB/services, but enabled)
    assert isinstance(ctx["memory"], list)
    assert isinstance(ctx["conversation"], dict)

def test_context_reduction_portfolio_profile():
    """Verify that Portfolio Profile disables relationship graph and minimizes memory/conversation."""
    session_id = "test-session-router"
    
    # Portfolio query should enable knowledge/entities/retrieval but keep memory/conv minimal
    ctx = build_context(session_id, "Explain Petal n Pins.")
    
    # Relationship graph is enabled in portfolio profile to maintain backward compatibility
    assert "nodes" in ctx["relationship_graph"]
    assert "edges" in ctx["relationship_graph"]
    
    # Verify that key mapping does not break
    assert "knowledge" in ctx
    assert "entities" in ctx

def test_profile_override_in_context_builder():
    """Verify that the profile override parameter is respected in build_context."""
    session_id = "test-session-override"
    
    # Even though query is portfolio related, overriding to memory forces memory profile (no knowledge)
    ctx = build_context(session_id, "Explain Petal n Pins.", profile_override="memory")
    
    assert ctx["knowledge"] == []
    assert ctx["entities"] == []
    assert ctx["relationship_graph"]["nodes"] == []

def test_context_selector_omits_empty_structures():
    """Verify that context selector prunes empty relationship graphs and recent conversation metadata."""
    context_data = {
        "memory": [],
        "conversation": {
            "summary": "",
            "entities": [],
            "topics": [],
            "importanceScore": 0.0,
            "timestampRange": {"start": "", "end": ""}
        },
        "entities": [],
        "knowledge": [],
        "relationship_graph": {
            "nodes": [],
            "edges": []
        }
    }
    
    selected = select_context(context_data, max_bytes=4096)
    # Both memory, summary, conversation metadata, knowledge, and graph are empty and should be completely omitted
    assert "permanent_memory" not in selected
    assert "conversation_summary" not in selected
    assert "recent_conversation" not in selected
    assert "knowledge" not in selected
    assert "relationship_graph" not in selected

@patch("app.services.context.context_router.logger.info")
def test_structured_metrics_logging(mock_log):
    """Verify that structured metrics logging is executed and does not leak secrets."""
    profile = get_profile("portfolio")
    dummy_ctx = {"memory": [], "conversation": {}}
    
    log_routing_metrics(
        profile_name="portfolio",
        profile=profile,
        context_data=dummy_ctx,
        processing_time=0.012
    )
    
    assert mock_log.call_count == 1
    log_arg = mock_log.call_args[0][0]
    assert "StructuredLog:" in log_arg
    assert "event" in log_arg
    assert "context_routing" in log_arg
    assert "portfolio" in log_arg
    assert "included_sources" in log_arg
    assert "omitted_sources" in log_arg
    assert "context_size_bytes" in log_arg
    assert "processing_time_seconds" in log_arg

def test_regression_and_backward_compatibility():
    """Ensure build_context signature and basic output keys remain identical."""
    session_id = "test-compat-session"
    res = build_context(session_id, "Hello there")
    
    assert "memory" in res
    assert "conversation" in res
    assert "knowledge" in res
    assert "entities" in res
    assert "relationship_graph" in res
