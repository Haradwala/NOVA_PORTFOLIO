import re
from typing import List

ENTITY_KEYWORDS = {
    "NOVA": ["nova", "assistant"],
    "Petal n Pins": ["petal n pins", "npins", "petal-npins"],
    "Portfolio": ["portfolio", "shadab-portfolio"],
    "Projects": ["projects", "project", "work", "works"],
    "Skills": ["skills", "skill", "tech stack", "toolkit"],
    "Experience": ["experience", "career", "timeline", "job", "jobs"],
    "Python": ["python", "py"],
    "React": ["react", "react.js", "reactjs"],
    "FastAPI": ["fastapi", "fast api"],
    "Three.js": ["three.js", "threejs", "webgl"],
    "Supabase": ["supabase", "db", "database"]
}

def extract_entities(text: str) -> List[str]:
    extracted = []
    text_lower = text.lower()
    for entity, keywords in ENTITY_KEYWORDS.items():
        for kw in keywords:
            # For short words (e.g. 3 chars or less like "py" or "db"), enforce word boundaries.
            # Otherwise use simple substring match.
            if len(kw) <= 3:
                pattern = rf"\b{re.escape(kw)}\b"
                if re.search(pattern, text_lower):
                    extracted.append(entity)
                    break
            else:
                if kw in text_lower:
                    extracted.append(entity)
                    break
    return extracted
