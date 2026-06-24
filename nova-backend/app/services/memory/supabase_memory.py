import logging
import httpx
from typing import Optional
from app.models.schemas import VisitorMemory
from app.services.memory.memory_store import BaseMemoryStore

logger = logging.getLogger(__name__)

class SupabaseMemoryStore(BaseMemoryStore):
    def __init__(self, url: str, key: str):
        self.url = url.rstrip('/')
        self.key = key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json"
        }

    def get(self, session_id: str) -> Optional[VisitorMemory]:
        try:
            with httpx.Client() as client:
                res = client.get(
                    f"{self.url}/rest/v1/visitor_memory?session_id=eq.{session_id}",
                    headers=self.headers,
                    timeout=5.0
                )
                if res.status_code == 200:
                    data = res.json()
                    if data and len(data) > 0:
                        row = data[0]
                        return VisitorMemory(
                            sessionId=row.get("session_id"),
                            visitCount=row.get("visit_count", 1),
                            topics=row.get("topics", []),
                            lastName=row.get("last_name"),
                            questions=row.get("questions", []),
                            firstVisit=row.get("first_visit"),
                            lastVisit=row.get("last_visit")
                        )
                else:
                    logger.error(f"Supabase GET memory failed: {res.status_code} {res.text}")
        except Exception as e:
            logger.error(f"Supabase GET memory error: {e}")
        return None

    def save(self, session_id: str, memory: VisitorMemory) -> VisitorMemory:
        try:
            payload = {
                "session_id": session_id,
                "visit_count": memory.visitCount,
                "topics": memory.topics,
                "questions": memory.questions,
                "last_name": memory.lastName,
                "first_visit": memory.firstVisit,
                "last_visit": memory.lastVisit
            }
            headers = self.headers.copy()
            headers["Prefer"] = "resolution=merge-duplicates,return=representation"
            with httpx.Client() as client:
                res = client.post(
                    f"{self.url}/rest/v1/visitor_memory?on_conflict=session_id",
                    json=payload,
                    headers=headers,
                    timeout=5.0
                )
                if res.status_code in (200, 201):
                    data = res.json()
                    if data and len(data) > 0:
                        row = data[0]
                        return VisitorMemory(
                            sessionId=row.get("session_id"),
                            visitCount=row.get("visit_count", 1),
                            topics=row.get("topics", []),
                            lastName=row.get("last_name"),
                            questions=row.get("questions", []),
                            firstVisit=row.get("first_visit"),
                            lastVisit=row.get("last_visit")
                        )
                else:
                    logger.error(f"Supabase SAVE memory failed: {res.status_code} {res.text}")
        except Exception as e:
            logger.error(f"Supabase SAVE memory error: {e}")
        return memory
