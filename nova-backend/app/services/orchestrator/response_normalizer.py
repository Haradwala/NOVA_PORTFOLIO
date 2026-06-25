import uuid
from typing import Dict, Any

def normalize_response(
    provider_name: str,
    model_name: str,
    content: str,
    status: str = "success",
    metadata: Dict[str, Any] = None,
    timing: Dict[str, float] = None,
    request_id: str = None
) -> Dict[str, Any]:
    """
    Normalizes provider-specific responses into a unified structural envelope.
    """
    return {
        "request_id": request_id or str(uuid.uuid4()),
        "provider": provider_name,
        "model": model_name,
        "status": status,
        "content": content,
        "metadata": metadata or {},
        "timing": timing or {}
    }
