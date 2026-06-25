import math
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseVectorStore(ABC):
    @abstractmethod
    def add_document(self, doc_id: str, content: str, embedding: List[float], metadata: Dict[str, Any]) -> None:
        """Adds a single document with its embedding and metadata."""
        pass

    @abstractmethod
    def add_documents(self, documents: List[Dict[str, Any]]) -> None:
        """Adds multiple documents. Each document dict must have keys: id, content, embedding, metadata."""
        pass

    @abstractmethod
    def similarity_search(self, query_embedding: List[float], limit: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Returns documents sorted by similarity to query_embedding, applying optional metadata filters."""
        pass

    @abstractmethod
    def update_document(self, doc_id: str, content: str, embedding: List[float], metadata: Dict[str, Any]) -> None:
        """Updates a document's content, embedding, and metadata."""
        pass

    @abstractmethod
    def delete_document(self, doc_id: str) -> None:
        """Deletes a document from the store."""
        pass

    @abstractmethod
    def list_documents(self) -> List[Dict[str, Any]]:
        """Lists all documents stored."""
        pass

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two vector lists using pure Python."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_prod = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_prod / (norm_a * norm_b)

class InMemoryVectorStore(BaseVectorStore):
    def __init__(self):
        self.documents: Dict[str, Dict[str, Any]] = {}

    def add_document(self, doc_id: str, content: str, embedding: List[float], metadata: Dict[str, Any]) -> None:
        self.documents[doc_id] = {
            "id": doc_id,
            "content": content,
            "embedding": embedding,
            "metadata": metadata
        }

    def add_documents(self, documents: List[Dict[str, Any]]) -> None:
        for doc in documents:
            self.add_document(
                doc_id=doc["id"],
                content=doc["content"],
                embedding=doc["embedding"],
                metadata=doc.get("metadata", {})
            )

    def similarity_search(self, query_embedding: List[float], limit: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        results = []
        for doc_id, doc in self.documents.items():
            if filters:
                match = True
                for k, v in filters.items():
                    if doc["metadata"].get(k) != v:
                        match = False
                        break
                if not match:
                    continue
            
            score = cosine_similarity(query_embedding, doc["embedding"])
            results.append({
                "id": doc["id"],
                "content": doc["content"],
                "score": score,
                "metadata": doc["metadata"]
            })
        
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]

    def update_document(self, doc_id: str, content: str, embedding: List[float], metadata: Dict[str, Any]) -> None:
        self.add_document(doc_id, content, embedding, metadata)

    def delete_document(self, doc_id: str) -> None:
        if doc_id in self.documents:
            del self.documents[doc_id]

    def list_documents(self) -> List[Dict[str, Any]]:
        return list(self.documents.values())
