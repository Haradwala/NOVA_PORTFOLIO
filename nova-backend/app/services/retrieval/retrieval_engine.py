import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.services.retrieval.vector_store import BaseVectorStore, InMemoryVectorStore
from app.services.retrieval.keyword_search import KeywordSearchIndex
from app.services.retrieval.hybrid_ranker import HybridRanker
from app.services.retrieval.metadata_filter import BaseMetadataFilter, MetadataFilter
from app.services.retrieval.embedding_service import EmbeddingService
from app.services.context.relationship_graph import get_graph

logger = logging.getLogger("retrieval_engine")

class RetrievalResult(BaseModel):
    id: str
    type: str
    name: str
    content: str
    score: float
    metadata: Dict[str, Any]

class RetrievalEngine:
    def __init__(
        self,
        vector_store: Optional[BaseVectorStore] = None,
        embedding_service: Optional[EmbeddingService] = None,
        metadata_filter: Optional[BaseMetadataFilter] = None,
        keyword_index: Optional[KeywordSearchIndex] = None,
        ranker: Optional[HybridRanker] = None
    ):
        self.vector_store = vector_store or InMemoryVectorStore()
        self.embedding_service = embedding_service or EmbeddingService()
        self.metadata_filter = metadata_filter or MetadataFilter()
        self.keyword_index = keyword_index or KeywordSearchIndex()
        self.ranker = ranker or HybridRanker()
        self.initialized = False

    def initialize_knowledge(self) -> None:
        """Pre-populates vector and keyword search indices from portfolio knowledge JSON files."""
        if self.initialized:
            return
            
        logger.info("Initializing knowledge retrieval indices...")
        self.keyword_index.load_from_knowledge()
        
        for doc in self.keyword_index.documents:
            content = doc["content"]
            embedding = self.embedding_service.get_embedding(content)
            
            # Save to vector store if embedding generation succeeded
            if embedding is not None:
                self.vector_store.add_document(
                    doc_id=doc["id"],
                    content=content,
                    embedding=embedding,
                    metadata={
                        **doc["metadata"],
                        "type": doc["type"],
                        "name": doc["name"]
                    }
                )
        self.initialized = True

    def retrieve(
        self,
        query: str,
        session_id: str,
        limit: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[RetrievalResult]:
        """
        Runs the full hybrid RAG retrieval pipeline:
        1. Generates query embedding.
        2. Performs similarity search (Vector search) if embeddings are available.
        3. Performs keyword search.
        4. Retrieves graph relationships for the session.
        5. Combines and ranks results using HybridRanker.
        6. Applies metadata filtering to return final structured results.
        """
        if not self.initialized:
            self.initialize_knowledge()

        # 1. Vector Search
        vector_results = []
        query_embedding = self.embedding_service.get_embedding(query)
        if query_embedding is not None:
            vector_results = self.vector_store.similarity_search(
                query_embedding=query_embedding,
                limit=limit * 2,
                filters=filters
            )

        # 2. Keyword Search
        keyword_results = self.keyword_index.search(
            query=query,
            limit=limit * 2,
            filters=filters
        )

        # 3. Fetch Graph Context
        visitor_id = f"visitor:{session_id}"
        g = get_graph()
        graph_relationships = g.get_relationships(source=visitor_id)

        # 4. Hybrid Ranker
        ranked_raw = self.ranker.rank(
            vector_results=vector_results,
            keyword_results=keyword_results,
            graph_relationships=graph_relationships,
            visitor_id=visitor_id,
            limit=limit
        )

        # 5. Metadata Filter
        if filters:
            ranked_raw = self.metadata_filter.apply(ranked_raw, filters)

        # 6. Map to structured schemas
        results = []
        for r in ranked_raw:
            results.append(RetrievalResult(
                id=r["id"],
                type=r["type"],
                name=r["name"],
                content=r["content"],
                score=r["score"],
                metadata=r["metadata"]
            ))
            
        return results

# Lazy global initialization
_retrieval_engine = None

def get_retrieval_engine() -> RetrievalEngine:
    global _retrieval_engine
    if _retrieval_engine is None:
        _retrieval_engine = RetrievalEngine()
    return _retrieval_engine
