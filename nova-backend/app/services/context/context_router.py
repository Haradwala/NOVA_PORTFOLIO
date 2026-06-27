import re
import logging
import json
from typing import Dict, Any, List, Optional

from app.services.context.context_profiles import ContextProfile, get_profile

logger = logging.getLogger("context_router")

def _match_entities(query: str) -> List[Dict[str, Any]]:
    """Matches entities from the in-memory cache against the query text."""
    from app.services.context.entity_loader import get_entity_index, initialize_entities
    index = get_entity_index()
    if not index:
        initialize_entities()
        index = get_entity_index()
        
    query_lower = query.lower()
    matched = []
    for node_id, data in index.items():
        aliases = data.get("aliases", [])
        name = data.get("name", "")
        all_aliases = {a.lower() for a in aliases if a}
        all_aliases.add(name.lower())
        
        matched_node = False
        for alias in all_aliases:
            if not alias:
                continue
            if len(alias) <= 3:
                pattern = rf"\b{re.escape(alias)}\b"
                if re.search(pattern, query_lower):
                    matched_node = True
                    break
            else:
                if alias in query_lower:
                    matched_node = True
                    break
        if matched_node:
            matched.append(data)
    return matched

def classify_query(query: str) -> str:
    """
    Classifies a query into one of the context profiles:
    - memory
    - portfolio
    - hybrid
    - general
    Uses the existing intent classifier (match_intent) as the primary input.
    Refines / upgrades to hybrid when both memory and portfolio contexts are required.
    Uses keyword/entity heuristics as fallback.
    """
    query_lower = query.lower().strip()
    
    # Check for memory indicator words in the query text
    memory_keywords = [
        "remember", "memory", "my name", "who am i", "discussing", "talking",
        "conversation", "session", "interested me", "i asked", "i ask", "i look",
        "we met", "met before", "about me", "my profile", "earlier", "previously"
    ]
    has_memory_keywords = any(kw in query_lower for kw in memory_keywords)
    
    # Check for specific portfolio references (project/technology names)
    specific_keywords = [
        "nova", "petal", "pins", "react", "python", "supabase", 
        "webgl", "three.js", "figma", "fastapi", "ai"
    ]
    has_specific_ref = any(kw in query_lower for kw in specific_keywords)
    
    # Check for general portfolio keywords
    portfolio_keywords = [
        "skill", "technology", "technologies", "toolkit", "stack", 
        "experience", "project", "shadab", "about yourself", "background", 
        "work", "portfolio", "contact"
    ]
    has_portfolio_keywords = any(kw in query_lower for kw in portfolio_keywords)
    
    # 1. Primary input: Intent classification
    from app.services.intent.matcher import match_intent
    intent_res = match_intent(query)
    intent = intent_res.get("intent", "fallback")
    confidence = intent_res.get("confidence", 0.0)
    
    # If the query contains memory keywords (like 'discussing', 'interested me'),
    # check if it specifically references a project or skill (hybrid) or if it's general memory (memory).
    if has_memory_keywords:
        if has_specific_ref:
            return "hybrid"
        else:
            return "memory"
            
    # Check high confidence classification
    if confidence >= 0.25 and intent != "fallback":
        is_memory_intent = intent.startswith("memory_") or intent.startswith("history_")
        if is_memory_intent:
            if has_specific_ref:
                return "hybrid"
            return "memory"
        else:
            if has_memory_keywords:
                return "hybrid"
            return "portfolio"
            
    # Heuristic Fallbacks
    if has_specific_ref or has_portfolio_keywords:
        return "portfolio"
        
    return "general"

def route_context(query: str, profile_override: Optional[str] = None) -> ContextProfile:
    """
    Decides which context profile should be used for the query, handling optional overrides.
    """
    if profile_override:
        return get_profile(profile_override)
    
    profile_name = classify_query(query)
    return get_profile(profile_name)

def log_routing_metrics(
    profile_name: str,
    profile: ContextProfile,
    context_data: Dict[str, Any],
    processing_time: float
):
    """
    Logs structured information about the routing decision and context size.
    Never logs secrets.
    """
    included = []
    omitted = []
    
    # We inspect the profile configuration to determine what was enabled/disabled
    sources = {
        "memory": profile.memory,
        "conversation": profile.conversation,
        "knowledge": profile.knowledge,
        "entities": profile.entities,
        "relationship_graph": profile.relationship_graph,
        "retrieval": profile.retrieval
    }
    
    for name, config in sources.items():
        if config.enabled:
            included.append(name)
        else:
            omitted.append(name)
            
    # Compute size of final context dictionary
    try:
        context_serialized = json.dumps(context_data, ensure_ascii=False)
        context_size = len(context_serialized.encode("utf-8"))
    except Exception:
        context_size = 0
        
    log_data = {
        "event": "context_routing",
        "selected_profile": profile_name,
        "included_sources": included,
        "omitted_sources": omitted,
        "context_size_bytes": context_size,
        "processing_time_seconds": processing_time
    }
    
    logger.info(f"StructuredLog: {json.dumps(log_data)}")
