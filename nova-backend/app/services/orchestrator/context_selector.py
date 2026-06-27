import json
from typing import Dict, Any

def select_context(context_data: Dict[str, Any], max_bytes: int = 4096) -> Dict[str, Any]:
    """
    Selects and prioritizes context data segments up to a strict max_bytes budget.
    Prioritization order:
    1. permanent_memory
    2. conversation_summary
    3. current_entities
    4. recent_conversation (conversation info excluding summary)
    5. knowledge
    6. relationship_graph
    """
    selected: Dict[str, Any] = {}
    
    # Priority segments mapping
    segments = [
        ("permanent_memory", context_data.get("memory", [])),
        ("conversation_summary", context_data.get("conversation", {}).get("summary", "")),
        ("current_entities", context_data.get("entities", [])),
        ("recent_conversation", {
            k: v for k, v in context_data.get("conversation", {}).items() if k != "summary"
        }),
        ("knowledge", context_data.get("knowledge", [])),
        ("relationship_graph", context_data.get("relationship_graph", {"nodes": [], "edges": []}))
    ]
    
    for key, val in segments:
        if not val:
            continue
            
        # Omit empty relationship graphs
        if key == "relationship_graph" and isinstance(val, dict):
            if not val.get("nodes") and not val.get("edges"):
                continue
                
        # Omit empty recent_conversation metadata
        if key == "recent_conversation" and isinstance(val, dict):
            # Check if all metadata lists/strings are empty and score is 0
            is_empty = (
                not val.get("entities") and 
                not val.get("topics") and 
                val.get("importanceScore", 0.0) == 0.0
            )
            if is_empty:
                continue
            
        # Tentatively add segment and calculate total byte size
        test_dict = {**selected, key: val}
        serialized = json.dumps(test_dict, ensure_ascii=False)
        bytes_count = len(serialized.encode("utf-8"))
        
        if bytes_count <= max_bytes:
            selected[key] = val
        else:
            # If a list segment (e.g. knowledge) exceeds limits, we could try to add empty structure
            # but strictly skipping to respect byte limits is cleaner and safer.
            pass
            
    return selected
