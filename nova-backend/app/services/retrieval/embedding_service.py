import hashlib
import logging
from abc import ABC, abstractmethod
from typing import List, Optional, Dict
from app.services.orchestrator.provider_registry import get_registry

logger = logging.getLogger("embedding_service")

class BaseEmbeddingCache(ABC):
    @abstractmethod
    def get(self, text_hash: str) -> Optional[List[float]]:
        """Retrieves embedding from cache by content hash."""
        pass

    @abstractmethod
    def set(self, text_hash: str, embedding: List[float]) -> None:
        """Saves embedding to cache by content hash."""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Clears the cache contents."""
        pass

class InMemoryEmbeddingCache(BaseEmbeddingCache):
    def __init__(self):
        self._cache: Dict[str, List[float]] = {}

    def get(self, text_hash: str) -> Optional[List[float]]:
        return self._cache.get(text_hash)

    def set(self, text_hash: str, embedding: List[float]) -> None:
        self._cache[text_hash] = embedding

    def clear(self) -> None:
        self._cache.clear()

class EmbeddingService:
    def __init__(self, cache: Optional[BaseEmbeddingCache] = None):
        self.cache = cache or InMemoryEmbeddingCache()

    def get_content_hash(self, text: str) -> str:
        """Generates SHA-256 hash for a given text segment."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def get_embedding(self, text: str) -> Optional[List[float]]:
        """
        Retrieves embedding for text.
        Checks cache first, then calls the active OpenAIProvider in the registry.
        """
        text_hash = self.get_content_hash(text)
        cached = self.cache.get(text_hash)
        if cached is not None:
            return cached

        # Look up openai provider from global registry
        registry = get_registry()
        if not registry.exists("openai"):
            logger.warning("Embedding skipped: 'openai' provider is not registered.")
            return None

        try:
            openai_provider = registry.get("openai")
            embedding = openai_provider.embed(text)
            self.cache.set(text_hash, embedding)
            return embedding
        except NotImplementedError:
            logger.warning("Embedding skipped: OpenAIProvider.embed raised NotImplementedError.")
            return None
        except Exception as e:
            logger.error(f"Embedding failed via OpenAIProvider: {e}")
            return None
