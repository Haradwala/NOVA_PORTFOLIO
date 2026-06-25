import pytest
from unittest.mock import MagicMock, patch

from app.services.retrieval.vector_store import InMemoryVectorStore, cosine_similarity
from app.services.retrieval.keyword_search import KeywordSearchIndex
from app.services.retrieval.metadata_filter import MetadataFilter
from app.services.retrieval.embedding_service import InMemoryEmbeddingCache, EmbeddingService
from app.services.retrieval.hybrid_ranker import HybridRankingConfig, HybridRanker
from app.services.retrieval.retrieval_engine import RetrievalEngine, RetrievalResult
from app.services.context.context_builder import build_context

def test_cosine_similarity():
    """Verify vector cosine similarity calculation logic."""
    assert cosine_similarity([1.0, 0.0], [1.0, 0.0]) == 1.0
    assert cosine_similarity([1.0, 0.0], [0.0, 1.0]) == 0.0
    assert cosine_similarity([1.0, 1.0], [1.0, 1.0]) == pytest.approx(1.0)
    assert cosine_similarity([], []) == 0.0
    assert cosine_similarity([1.0], [1.0, 2.0]) == 0.0

def test_vector_store_operations():
    """Verify basic vector store CRUD operations."""
    store = InMemoryVectorStore()
    doc_id = "test-doc"
    content = "Hello testing world."
    embedding = [0.1, 0.2, 0.3]
    metadata = {"type": "project", "difficulty": "Expert"}
    
    # 1. Ingestion
    store.add_document(doc_id, content, embedding, metadata)
    docs = store.list_documents()
    assert len(docs) == 1
    assert docs[0]["id"] == doc_id
    
    # 2. Similarity Search
    results = store.similarity_search([0.1, 0.2, 0.3], limit=1)
    assert len(results) == 1
    assert results[0]["id"] == doc_id
    assert results[0]["score"] == pytest.approx(1.0)
    
    # 3. Update
    store.update_document(doc_id, "New content", [0.4, 0.5, 0.6], {"type": "project", "difficulty": "Advanced"})
    updated = store.list_documents()[0]
    assert updated["content"] == "New content"
    assert updated["embedding"] == [0.4, 0.5, 0.6]
    
    # 4. Deletion
    store.delete_document(doc_id)
    assert len(store.list_documents()) == 0

def test_keyword_search_index():
    """Verify keyword indexing and term matching calculations."""
    idx = KeywordSearchIndex()
    idx.documents = [
        {
            "id": "proj:1",
            "type": "project",
            "name": "Super Project",
            "content": "Python React developer portfolio system",
            "metadata": {"year": 2025}
        },
        {
            "id": "exp:1",
            "type": "experience",
            "name": "Stripe Company",
            "content": "Node payment gateway engineer role",
            "metadata": {"year": 2024}
        }
    ]
    
    res = idx.search("Python", limit=5)
    assert len(res) == 1
    assert res[0]["id"] == "proj:1"
    
    res_weighted = idx.search("Super Project", limit=5)
    assert len(res_weighted) == 1
    assert res_weighted[0]["score"] > 2.0

def test_cache_abstraction():
    """Verify cache gets, sets, hashes, and clears."""
    cache = InMemoryEmbeddingCache()
    assert cache.get("hash-1") is None
    
    cache.set("hash-1", [0.1, 0.2])
    assert cache.get("hash-1") == [0.1, 0.2]
    
    cache.clear()
    assert cache.get("hash-1") is None

@patch("app.services.retrieval.embedding_service.get_registry")
def test_embedding_service(mock_get_registry):
    """Verify EmbeddingService utilizes cache and calls OpenAIProvider correctly."""
    mock_provider = MagicMock()
    mock_provider.embed.return_value = [0.9, 0.8]
    
    mock_registry = MagicMock()
    mock_registry.exists.return_value = True
    mock_registry.get.return_value = mock_provider
    mock_get_registry.return_value = mock_registry
    
    cache = InMemoryEmbeddingCache()
    svc = EmbeddingService(cache=cache)
    
    emb = svc.get_embedding("hello")
    assert emb == [0.9, 0.8]
    mock_provider.embed.assert_called_once_with("hello")
    
    emb2 = svc.get_embedding("hello")
    assert emb2 == [0.9, 0.8]
    assert mock_provider.embed.call_count == 1

def test_metadata_filter():
    """Verify metadata filtering logic."""
    filter_svc = MetadataFilter()
    docs = [
        {"id": "d1", "type": "project", "metadata": {"status": "Active", "year": "2024"}},
        {"id": "d2", "type": "experience", "metadata": {"status": "Completed", "year": "2023"}}
    ]
    
    res_type = filter_svc.apply(docs, {"type": "project"})
    assert len(res_type) == 1
    assert res_type[0]["id"] == "d1"
    
    res_attr = filter_svc.apply(docs, {"status": "Completed"})
    assert len(res_attr) == 1
    assert res_attr[0]["id"] == "d2"

def test_hybrid_ranking():
    """Verify hybrid ranking score combinations, graph weights, and recency boosts."""
    config = HybridRankingConfig(w_vector=0.4, w_keyword=0.3, w_graph=0.2, w_recency=0.1)
    ranker = HybridRanker(config=config)
    
    vector_results = [
        {"id": "doc1", "score": 0.8, "content": "Vector Match", "metadata": {"year": 2025}}
    ]
    keyword_results = [
        {"id": "doc1", "score": 10.0, "type": "project", "name": "Doc 1", "content": "Keyword Match", "metadata": {"year": 2025}}
    ]
    graph_rels = [
        {"source": "visitor:123", "target": "doc1", "weight": 2.5}
    ]
    
    results = ranker.rank(
        vector_results=vector_results,
        keyword_results=keyword_results,
        graph_relationships=graph_rels,
        visitor_id="visitor:123"
    )
    
    assert len(results) == 1
    assert results[0]["id"] == "doc1"
    assert results[0]["score"] == pytest.approx(0.8057, abs=1e-3)

@patch("app.services.retrieval.embedding_service.get_registry")
def test_retrieval_engine_retrieve(mock_get_registry):
    """Verify retrieval engine runs successfully and gracefully handles missing embeddings."""
    mock_registry = MagicMock()
    mock_registry.exists.return_value = False
    mock_get_registry.return_value = mock_registry
    
    engine = RetrievalEngine()
    engine.initialize_knowledge()
    
    res = engine.retrieve("Razorpay", session_id="test-session")
    assert len(res) > 0
    assert isinstance(res[0], RetrievalResult)
    assert any("razorpay" in r.id.lower() or "razorpay" in r.content.lower() for r in res)

def test_context_builder_integration():
    """Verify build_context merges retrieved RAG documents into knowledge context."""
    from app.services.context.entity_loader import initialize_entities
    initialize_entities()
    
    context = build_context(session_id="session-xyz", query="Razorpay project checkout")
    
    assert "knowledge" in context
    knowledge_ids = [k["id"] for k in context["knowledge"]]
    assert len(knowledge_ids) > 0
