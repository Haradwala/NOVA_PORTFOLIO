from typing import Dict, Any

def build_ai_request(query: str, context: Dict[str, Any], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Constructs a structured AIRequest without building raw prompt text.
    Prompt translation belongs to specific provider client adapters.
    """
    return {
        "query": query,
        "context": context,
        "metadata": metadata or {}
    }
