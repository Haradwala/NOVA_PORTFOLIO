from fastapi import APIRouter, HTTPException
from app.models.schemas import QueryRequest, QueryResponse, VisitorMemory, ConversationRecord
from app.services.intent.matcher import match_intent
from app.services.response_builder import build_response
from app.services.memory.memory_service import get_memory, create_memory, update_memory
from app.services.conversation.conversation_service import get_history, add_record, update_knowledge_graph
from app.services.conversation.context_resolver import resolve_context
from app.services.conversation.entity_extractor import extract_entities
from app.services.conversation.conversation_summary import update_summary
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/query", tags=["Query"])

@router.post("", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")
    
    # 1. Load memory
    session_id = request.memory.sessionId if (request.memory and request.memory.sessionId) else None
    
    if not session_id:
        session_id = str(uuid.uuid4())
        current_mem = create_memory(session_id)
    else:
        current_mem = get_memory(session_id)
        if not current_mem:
            current_mem = create_memory(session_id, request.memory)
        else:
            # Backend logic only for incrementing visit count
            is_new_visit = False
            if current_mem.lastVisit:
                try:
                    last_visit_str = current_mem.lastVisit
                    if last_visit_str.endswith("Z"):
                        last_visit_str = last_visit_str[:-1] + "+00:00"
                    last_visit_dt = datetime.fromisoformat(last_visit_str)
                    now_dt = datetime.now(last_visit_dt.tzinfo)
                    if now_dt - last_visit_dt > timedelta(minutes=30):
                        is_new_visit = True
                except Exception:
                    pass
            if is_new_visit:
                current_mem.visitCount += 1

            # Sync fields from client request memory only if missing in DB
            if request.memory:
                if request.memory.lastName and not current_mem.lastName:
                    current_mem.lastName = request.memory.lastName
                if request.memory.topics:
                    for topic in request.memory.topics:
                        if topic not in current_mem.topics:
                            current_mem.topics.append(topic)

    # 2. Load conversation history
    history_records = get_history(session_id)

    # 3. Resolve context
    resolved_text = resolve_context(text, history_records)

    # 4. Match intent using resolved text
    intent_data = match_intent(resolved_text)
    
    # 5. Build QueryResponse payload
    response_payload = build_response(intent_data, resolved_text, current_mem, history=history_records)
    
    # 6. Update memory (including Knowledge Graph and regular updates)
    entities = extract_entities(resolved_text)
    updated_mem_graph = update_knowledge_graph(response_payload.updated_memory, resolved_text, intent_data, entities)
    saved_mem = update_memory(session_id, updated_mem_graph)
    response_payload.updated_memory = saved_mem
    
    # Update relationship graph (nodes and weighted edges)
    from app.services.context.relationship_graph import update_graph_for_query
    update_graph_for_query(session_id, resolved_text, intent_data, entities)

    # Build context representation
    from app.services.context.context_builder import build_context
    context = build_context(session_id, resolved_text)

    # 7. Update conversation history
    prev_summary = history_records[-1].summary if history_records else ""
    new_summary = update_summary(prev_summary, resolved_text, response_payload.reply, response_payload.intent)
    
    new_record = ConversationRecord(
        sessionId=session_id,
        timestamp=datetime.utcnow().isoformat() + "Z",
        userMessage=resolved_text,
        assistantReply=response_payload.reply,
        intent=response_payload.intent,
        entities=entities,
        topics=saved_mem.topics,
        summary=new_summary,
        payload=intent_data.get("payload")
    )
    add_record(session_id, new_record)
    
    return response_payload


