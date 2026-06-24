from abc import ABC, abstractmethod
from typing import Dict, Optional
from app.models.schemas import VisitorMemory
from app.config import SUPABASE_URL, SUPABASE_KEY

class BaseMemoryStore(ABC):
    @abstractmethod
    def get(self, session_id: str) -> Optional[VisitorMemory]:
        pass

    @abstractmethod
    def save(self, session_id: str, memory: VisitorMemory) -> VisitorMemory:
        pass

class InMemoryMemoryStore(BaseMemoryStore):
    def __init__(self):
        self.store: Dict[str, VisitorMemory] = {}

    def get(self, session_id: str) -> Optional[VisitorMemory]:
        return self.store.get(session_id)

    def save(self, session_id: str, memory: VisitorMemory) -> VisitorMemory:
        self.store[session_id] = memory
        return memory

# Lazy load store singleton
_global_store: Optional[BaseMemoryStore] = None

def get_store() -> BaseMemoryStore:
    global _global_store
    if _global_store is None:
        if SUPABASE_URL and SUPABASE_KEY:
            from app.services.memory.supabase_memory import SupabaseMemoryStore
            _global_store = SupabaseMemoryStore(SUPABASE_URL, SUPABASE_KEY)
        else:
            _global_store = InMemoryMemoryStore()
    return _global_store
