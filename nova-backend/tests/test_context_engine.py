import pytest
from app.core.constants import (
    NODE_TYPE_VISITOR, NODE_TYPE_PROJECT, NODE_TYPE_SKILL, NODE_TYPE_TECHNOLOGY, NODE_TYPE_EXPERIENCE,
    REL_USES, REL_INTERESTED_IN, REL_RELATED_TO, REL_HAS_SKILL, REL_WORKED_ON, REL_DISCUSSED, REL_VIEWED,
    IMPORTANCE_PERMANENT, IMPORTANCE_MEDIUM, IMPORTANCE_LOW
)
from app.services.providers.provider import BaseAIProvider
from app.services.context.entity_loader import initialize_entities, get_entity_index, reload_entities
from app.services.context.relationship_graph import get_graph, InMemoryRelationshipGraph
from app.services.context.memory_ranker import rank_memory
from app.services.context.context_compressor import compress_context
from app.services.context.context_builder import build_context
from app.models.schemas import VisitorMemory, ConversationRecord

def test_ai_provider_interface():
    """Verify that BaseAIProvider abstract methods raise NotImplementedError."""
    class DummyProvider(BaseAIProvider):
        def chat(self, messages, context):
            return super().chat(messages, context)
        def stream_chat(self, messages, context):
            return super().stream_chat(messages, context)
        def transcribe(self, audio_bytes):
            return super().transcribe(audio_bytes)
        def speak(self, text):
            return super().speak(text)
        def embed(self, text):
            return super().embed(text)
        def health(self):
            return super().health()
            
    p = DummyProvider()
    with pytest.raises(NotImplementedError):
        p.chat([], {})
    with pytest.raises(NotImplementedError):
        p.stream_chat([], {})
    with pytest.raises(NotImplementedError):
        p.transcribe(b"")
    with pytest.raises(NotImplementedError):
        p.speak("")
    with pytest.raises(NotImplementedError):
        p.embed("")
    with pytest.raises(NotImplementedError):
        p.health()

def test_dynamic_entity_caching():
    """Verify dynamic entity initialization, manual reload, and keyword mappings."""
    initialize_entities()
    idx = get_entity_index()
    assert len(idx) > 0
    
    # Check that canonical entities are present in index
    proj_nodes = [k for k, v in idx.items() if v["type"] == NODE_TYPE_PROJECT]
    assert len(proj_nodes) > 0
    
    # Verify manual reload works
    reload_entities()
    idx_reloaded = get_entity_index()
    assert len(idx_reloaded) == len(idx)

def test_node_metadata_schemas():
    """Verify predictable node metadata structures for project, skill, and visitor."""
    from app.models.schemas import ProjectNodeMetadata, SkillNodeMetadata, VisitorNodeMetadata
    
    # Project node metadata validation
    proj_meta = ProjectNodeMetadata(
        technologies=["React", "FastAPI"],
        category="Web App",
        github="https://github.com/shadab",
        demo="https://demo.com",
        aliases=["app", "react app"]
    )
    assert proj_meta.technologies == ["React", "FastAPI"]
    
    # Skill node metadata validation
    skill_meta = SkillNodeMetadata(
        category="Backend",
        level="Advanced",
        years="3+"
    )
    assert skill_meta.level == "Advanced"
    
    # Visitor node metadata validation
    vis_meta = VisitorNodeMetadata(
        session_id="test-session-123",
        first_seen="2026-06-25T00:00:00Z",
        last_seen="2026-06-25T01:00:00Z"
    )
    assert vis_meta.sessionId == "test-session-123"

def test_relationship_graph_weights():
    """Verify relationship graph edge weight increments on duplicate edge additions."""
    g = InMemoryRelationshipGraph()
    
    # Add nodes
    g.add_node("project:petal-npins", NODE_TYPE_PROJECT, "Petal n Pins", {"category": "E-Commerce"})
    g.add_node("technology:react", NODE_TYPE_TECHNOLOGY, "React", {})
    
    # First edge addition
    edge = g.add_relationship("project:petal-npins", "technology:react", REL_USES, 1.0)
    assert edge["weight"] == 1.0
    
    # Duplicate edge addition
    edge = g.add_relationship("project:petal-npins", "technology:react", REL_USES, 2.5)
    assert edge["weight"] == 3.5
    
    # Verify weights returned
    rels = g.get_relationships(source="project:petal-npins")
    assert len(rels) == 1
    assert rels[0]["weight"] == 3.5

def test_context_compression():
    """Verify compression of turn history into summary, entities, topics, score, and timestamps."""
    history = [
        ConversationRecord(
            sessionId="session-comp-test",
            timestamp="2026-06-25T00:00:00Z",
            userMessage="Tell me about Petal n Pins",
            assistantReply="Petal n Pins is an e-commerce app.",
            intent="projects",
            entities=["Petal n Pins"],
            topics=["projects"],
            summary="Session started. Inquired about projects."
        ),
        ConversationRecord(
            sessionId="session-comp-test",
            timestamp="2026-06-25T00:02:00Z",
            userMessage="Tell me about Python",
            assistantReply="Python is a core technology.",
            intent="skills",
            entities=["Python"],
            topics=["skills"],
            summary="Asked about technical skills."
        )
    ]
    
    compressed = compress_context(history, max_records=2)
    assert compressed["summary"] != ""
    assert "Petal n Pins" in compressed["entities"]
    assert "Python" in compressed["entities"]
    assert "projects" in compressed["topics"]
    assert "skills" in compressed["topics"]
    assert compressed["importanceScore"] > 0.0
    assert compressed["timestampRange"]["start"] == "2026-06-25T00:00:00Z"
    assert compressed["timestampRange"]["end"] == "2026-06-25T00:02:00Z"

def test_context_builder():
    """Verify build_context returns the 5 expected structured sections."""
    initialize_entities()
    session_id = "test-builder-session"
    
    # Populate memory
    from app.services.memory.memory_service import create_memory, remember_name
    create_memory(session_id)
    remember_name(session_id, "Shadab")
    
    # Run context builder
    context = build_context(session_id, "Tell me about React, Supabase, and Petal n Pins")
    
    assert "memory" in context
    assert "conversation" in context
    assert "knowledge" in context
    assert "entities" in context
    assert "relationship_graph" in context
    
    # Assert entity name matching works
    assert "React" in context["entities"]
    assert "Supabase" in context["entities"]
    assert "Petal n Pins" in context["entities"]
    
    # Check graph context structure
    rg = context["relationship_graph"]
    assert "nodes" in rg
    assert "edges" in rg
    
    # Visitor node should be registered
    visitor_nodes = [n for n in rg["nodes"] if n["id"] == f"visitor:{session_id}"]
    assert len(visitor_nodes) > 0

def test_constants():
    """Verify core constants contain correct strings and weights."""
    assert NODE_TYPE_VISITOR == "visitor"
    assert NODE_TYPE_PROJECT == "project"
    assert NODE_TYPE_SKILL == "skill"
    assert NODE_TYPE_TECHNOLOGY == "technology"
    assert NODE_TYPE_EXPERIENCE == "experience"
    
    assert REL_USES == "USES"
    assert REL_INTERESTED_IN == "INTERESTED_IN"
    assert REL_RELATED_TO == "RELATED_TO"
    
    assert IMPORTANCE_PERMANENT == 1.0
    assert IMPORTANCE_MEDIUM == 0.6
    assert IMPORTANCE_LOW == 0.2
