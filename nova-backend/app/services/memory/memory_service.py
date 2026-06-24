from datetime import datetime
from typing import Optional, List
from app.models.schemas import VisitorMemory
from app.services.memory.memory_store import get_store

def get_memory(session_id: str) -> Optional[VisitorMemory]:
    return get_store().get(session_id)

def create_memory(session_id: str, memory_data: Optional[VisitorMemory] = None) -> VisitorMemory:
    now_iso = datetime.utcnow().isoformat() + "Z"
    if memory_data:
        mem = memory_data.model_copy()
        mem.sessionId = session_id
        # Ignore visitCount from client if creating a new record, set it to 1
        mem.visitCount = 1
        if not mem.firstVisit:
            mem.firstVisit = now_iso
        if not mem.lastVisit:
            mem.lastVisit = now_iso
    else:
        mem = VisitorMemory(
            sessionId=session_id,
            visitCount=1,
            topics=[],
            questions=[],
            lastName=None,
            firstVisit=now_iso,
            lastVisit=now_iso
        )
    return get_store().save(session_id, mem)

def update_memory(session_id: str, memory: VisitorMemory) -> VisitorMemory:
    now_iso = datetime.utcnow().isoformat() + "Z"
    mem = memory.model_copy()
    mem.sessionId = session_id
    mem.lastVisit = now_iso
    return get_store().save(session_id, mem)

def remember_name(session_id: str, name: str) -> VisitorMemory:
    mem = get_memory(session_id)
    if not mem:
        mem = create_memory(session_id)
    mem.lastName = name
    return update_memory(session_id, mem)

def remember_topic(session_id: str, topic: str) -> VisitorMemory:
    mem = get_memory(session_id)
    if not mem:
        mem = create_memory(session_id)
    if not mem.topics:
        mem.topics = []
    if topic not in mem.topics:
        mem.topics.append(topic)
    return update_memory(session_id, mem)

def remember_question(session_id: str, question: str) -> VisitorMemory:
    mem = get_memory(session_id)
    if not mem:
        mem = create_memory(session_id)
    if not mem.questions:
        mem.questions = []
    
    cleaned = question.strip()
    if cleaned:
        # Ignore consecutive duplicates
        if not mem.questions or mem.questions[-1] != cleaned:
            mem.questions.append(cleaned)
            # Limit to most recent 10 questions
            if len(mem.questions) > 10:
                mem.questions = mem.questions[-10:]
    return update_memory(session_id, mem)

def build_memory_summary(memory: VisitorMemory) -> str:
    parts = []
    if memory.lastName:
        parts.append(f"Your name is {memory.lastName}.")
    else:
        parts.append("I don't know your name yet.")

    if memory.visitCount > 1:
        parts.append(f"We have met before; you have visited {memory.visitCount} times.")
    else:
        parts.append("This is your first visit.")

    if memory.topics:
        topics_str = ", ".join(memory.topics)
        parts.append(f"You've shown interest in: {topics_str}.")
    else:
        parts.append("You haven't asked about any specific topics yet.")

    if memory.questions:
        questions_str = ", ".join([f"'{q}'" for q in memory.questions])
        parts.append(f"Recent questions you've asked: {questions_str}.")
    else:
        parts.append("You haven't asked any questions yet.")

    return " ".join(parts)
