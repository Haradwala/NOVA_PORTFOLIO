import time
import uuid
import logging
import json
from typing import Dict, Any, Optional

from app.services.context.context_builder import build_context
from app.services.orchestrator.context_selector import select_context
from app.services.orchestrator.request_builder import build_ai_request
from app.services.orchestrator.response_normalizer import normalize_response
from app.services.orchestrator.provider_registry import get_registry

logger = logging.getLogger("orchestrator")

def coordinate_ai_call(
    session_id: str,
    query: str,
    provider_name: Optional[str] = None,
    strategy: str = "default",
    max_context_bytes: int = 4096,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Coordinates the AI query lifecycle:
    1. Loads Phase 3C context.
    2. Runs Context Selector.
    3. Wraps structured AIRequest.
    4. Retrieves provider from registry.
    5. Dispatches request and normalizes response.
    6. Performs structured logging.
    """
    t_start = time.time()
    request_id = str(uuid.uuid4())
    
    # 1. Load context
    raw_context = build_context(session_id, query)
    
    # 2. Select context within byte limit
    selected_ctx = select_context(raw_context, max_context_bytes)
    context_serialized = json.dumps(selected_ctx, ensure_ascii=False)
    context_bytes = len(context_serialized.encode("utf-8"))
    
    # 3. Build structured AI request payload
    ai_request = build_ai_request(query, selected_ctx, metadata)
    
    # 4. Choose provider
    registry = get_registry()
    if provider_name and registry.exists(provider_name):
        provider = registry.get(provider_name)
    else:
        provider = registry.default()
        
    p_name = provider.name()
    p_model = getattr(provider, "_model", "mock-model")
    
    # 5. Invoke provider
    messages = [{"role": "user", "content": query}]
    t_call_start = time.time()
    status = "success"
    try:
        reply = provider.chat(messages, selected_ctx)
    except Exception as e:
        logger.warning(f"Provider '{p_name}' call failed: {e}. Falling back to 'mock' provider.")
        try:
            fallback_provider = registry.get("mock")
            p_name = fallback_provider.name()
            p_model = getattr(fallback_provider, "_model", "mock-model")
            reply = fallback_provider.chat(messages, selected_ctx)
            status = "success"
        except Exception as fallback_err:
            status = "failed"
            reply = f"Provider call failed and fallback failed: {fallback_err}"
        
    t_end = time.time()
    processing_time = t_end - t_start
    timing = {
        "total_time": processing_time,
        "provider_call_time": t_end - t_call_start
    }
    
    # 6. Normalize response
    response_bytes = len(reply.encode("utf-8"))
    normalized = normalize_response(
        provider_name=p_name,
        model_name=p_model,
        content=reply,
        status=status,
        metadata={"strategy": strategy, "max_context_bytes": max_context_bytes},
        timing=timing,
        request_id=request_id
    )
    
    # 7. Structured Logging (No secrets included)
    log_data = {
        "request_id": request_id,
        "session_id": session_id,
        "provider": p_name,
        "strategy": strategy,
        "context_bytes": context_bytes,
        "processing_time": processing_time,
        "response_bytes": response_bytes,
        "status": status
    }
    logger.info(f"StructuredLog: {json.dumps(log_data)}")
    
    return normalized
