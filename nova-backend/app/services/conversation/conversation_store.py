from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import httpx
import logging
from app.models.schemas import ConversationRecord
from app.config import SUPABASE_URL, SUPABASE_KEY

logger = logging.getLogger(__name__)

class BaseConversationStore(ABC):
    @abstractmethod
    def get_history(self, session_id: str) -> List[ConversationRecord]:
        pass

    @abstractmethod
    def add_record(self, session_id: str, record: ConversationRecord) -> ConversationRecord:
        pass

class InMemoryConversationStore(BaseConversationStore):
    def __init__(self):
        self.store: Dict[str, List[ConversationRecord]] = {}

    def get_history(self, session_id: str) -> List[ConversationRecord]:
        return self.store.get(session_id, [])

    def add_record(self, session_id: str, record: ConversationRecord) -> ConversationRecord:
        if session_id not in self.store:
            self.store[session_id] = []
        # Ensure timestamp is set
        rec = record.model_copy()
        self.store[session_id].append(rec)
        return rec

class SupabaseConversationStore(BaseConversationStore):
    def __init__(self, url: str, key: str):
        self.url = url.rstrip('/')
        self.key = key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def get_history(self, session_id: str) -> List[ConversationRecord]:
        try:
            with httpx.Client() as client:
                res = client.get(
                    f"{self.url}/rest/v1/conversation_history?session_id=eq.{session_id}&order=timestamp.asc",
                    headers=self.headers,
                    timeout=5.0
                )
                if res.status_code == 200:
                    data = res.json()
                    records = []
                    for row in data:
                        records.append(ConversationRecord(
                            id=row.get("id"),
                            sessionId=row.get("session_id"),
                            timestamp=row.get("timestamp"),
                            userMessage=row.get("user_message"),
                            assistantReply=row.get("assistant_reply"),
                            intent=row.get("intent"),
                            entities=row.get("entities", []),
                            topics=row.get("topics", []),
                            summary=row.get("summary", "")
                        ))
                    return records
                else:
                    logger.error(f"Supabase GET history failed: {res.status_code} {res.text}")
        except Exception as e:
            logger.error(f"Supabase GET history error: {e}")
        return []

    def add_record(self, session_id: str, record: ConversationRecord) -> ConversationRecord:
        try:
            payload = {
                "session_id": session_id,
                "user_message": record.userMessage,
                "assistant_reply": record.assistantReply,
                "intent": record.intent,
                "entities": record.entities,
                "topics": record.topics,
                "summary": record.summary
            }
            with httpx.Client() as client:
                res = client.post(
                    f"{self.url}/rest/v1/conversation_history",
                    json=payload,
                    headers=self.headers,
                    timeout=5.0
                )
                if res.status_code in (200, 201):
                    data = res.json()
                    if data and len(data) > 0:
                        row = data[0]
                        return ConversationRecord(
                            id=row.get("id"),
                            sessionId=row.get("session_id"),
                            timestamp=row.get("timestamp"),
                            userMessage=row.get("user_message"),
                            assistantReply=row.get("assistant_reply"),
                            intent=row.get("intent"),
                            entities=row.get("entities", []),
                            topics=row.get("topics", []),
                            summary=row.get("summary", "")
                        )
                else:
                    logger.error(f"Supabase POST history failed: {res.status_code} {res.text}")
        except Exception as e:
            logger.error(f"Supabase POST history error: {e}")
        return record

_global_conv_store: Optional[BaseConversationStore] = None

def get_conversation_store() -> BaseConversationStore:
    global _global_conv_store
    if _global_conv_store is None:
        if SUPABASE_URL and SUPABASE_KEY:
            _global_conv_store = SupabaseConversationStore(SUPABASE_URL, SUPABASE_KEY)
        else:
            _global_conv_store = InMemoryConversationStore()
    return _global_conv_store
