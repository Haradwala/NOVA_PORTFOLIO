from typing import List, Dict, Any
from app.models.schemas import ConversationRecord, VisitorMemory
from app.services.conversation.conversation_store import get_conversation_store
from app.services.conversation.entity_extractor import extract_entities

def get_history(session_id: str) -> List[ConversationRecord]:
    return get_conversation_store().get_history(session_id)

def add_record(session_id: str, record: ConversationRecord) -> ConversationRecord:
    return get_conversation_store().add_record(session_id, record)

def update_knowledge_graph(
    memory: VisitorMemory,
    text: str,
    intent_data: Dict[str, Any],
    entities: List[str]
) -> VisitorMemory:
    mem = memory.model_copy()
    if not mem.knowledgeGraph:
        mem.knowledgeGraph = {}

    if "projects" not in mem.knowledgeGraph:
        mem.knowledgeGraph["projects"] = []
    if "skills" not in mem.knowledgeGraph:
        mem.knowledgeGraph["skills"] = []

    # Map entities to relationship types
    # 1. Projects
    for ent in entities:
        if ent in ["Petal n Pins", "Portfolio", "Projects"]:
            if ent not in mem.knowledgeGraph["projects"]:
                mem.knowledgeGraph["projects"].append(ent)

    if intent_data.get("intent") == "projects" and intent_data.get("payload"):
        payload = intent_data["payload"]
        proj_map = {
            "petal-npins": "Petal n Pins",
            "nova-assistant": "NOVA",
            "portfolio-os": "Portfolio"
        }
        name = proj_map.get(payload, payload.replace('-', ' ').title())
        if name not in mem.knowledgeGraph["projects"]:
            mem.knowledgeGraph["projects"].append(name)

    # 2. Skills
    for ent in entities:
        if ent in ["Python", "React", "FastAPI", "Three.js", "Supabase", "Skills"]:
            if ent != "Skills":
                if ent not in mem.knowledgeGraph["skills"]:
                    mem.knowledgeGraph["skills"].append(ent)

    return mem
