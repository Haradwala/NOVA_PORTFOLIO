from typing import Dict, Any, List
from app.services.orchestrator.orchestrator import coordinate_ai_call
from app.models.schemas import QueryResponse, VisitorMemory

def route_query(
    resolved_text: str,
    intent_data: Dict[str, Any],
    current_mem: VisitorMemory,
    history_records: List[Any],
    session_id: str
) -> QueryResponse:
    """
    Query routing strategy:
    - If the matched intent is NOT 'fallback', the rule engine bypasses the providers.
    - If the matched intent is 'fallback', it routes to the default AI Provider.
    """
    from app.services.response_builder import build_response
    
    intent = intent_data.get("intent", "fallback")
    
    # 1. Rule-engine bypass
    if intent != "fallback":
        return build_response(intent_data, resolved_text, current_mem, history=history_records)
        
    # 2. Invoke default provider (MockProvider)
    ai_res = coordinate_ai_call(
        session_id=session_id,
        query=resolved_text,
        strategy="provider"
    )
    
    # Get standard base fallback payload structure
    base_response = build_response(intent_data, resolved_text, current_mem, history=history_records)
    
    # Override reply content with provider response
    base_response.reply = ai_res["content"]
    
    # Enforce debugging markers if active
    if base_response.debug:
        base_response.debug.matched_intent = f"provider:{ai_res['provider']}"
        
    return base_response
