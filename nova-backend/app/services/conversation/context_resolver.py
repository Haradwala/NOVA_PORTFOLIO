from typing import List, Any

def resolve_context(query_text: str, history: List[Any]) -> str:
    raw = query_text.lower().strip()
    if not history:
        return query_text

    # Helper to find the last project ID/payload from history
    def get_last_project_payload():
        for r in reversed(history):
            # Check if record has payload attribute and intent is projects
            payload = getattr(r, "payload", None)
            intent = getattr(r, "intent", None)
            if intent == "projects" and payload:
                return payload
        return None

    def get_last_entity():
        for r in reversed(history):
            entities = getattr(r, "entities", [])
            for ent in entities:
                if ent in ["Python", "React", "FastAPI", "Three.js", "Supabase", "NOVA"]:
                    return ent
        return None

    last_project = get_last_project_payload()
    last_entity = get_last_entity()

    if "show it again" in raw or "show that again" in raw:
        if last_project:
            return f"open project {last_project}"
            
    if "tell me more" in raw or "more info" in raw or "more details" in raw:
        if last_project:
            return f"tell me more about project {last_project}"
        if last_entity:
            return f"tell me more about {last_entity}"
        # Fallback to other intents
        for r in reversed(history):
            intent = getattr(r, "intent", None)
            if intent in ["about", "skills", "experience", "contact"]:
                return f"tell me more about {intent}"

    if "that project" in raw or "the project" in raw:
        if last_project:
            return f"open project {last_project}"

    if "the previous one" in raw or "previous project" in raw or "the last one" in raw:
        # Find second-to-last or last project discussed
        projects = []
        for r in reversed(history):
            payload = getattr(r, "payload", None)
            intent = getattr(r, "intent", None)
            if intent == "projects" and payload:
                projects.append(payload)
                if len(projects) >= 2:
                    break
        if len(projects) >= 2:
            return f"open project {projects[1]}"
        elif len(projects) == 1:
            return f"open project {projects[0]}"

    return query_text
