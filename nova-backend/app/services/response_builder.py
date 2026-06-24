import re
from typing import Dict, Any, List, Optional
from app.services.knowledge import provider
from app.models.schemas import QueryResponse, VisitorMemory, PreviewData, DebugMetadata
from app.config import DEBUG

# Metadata mapping to match the original rich features of key projects
PROJECT_METADATA_FALLBACKS: Dict[str, Dict[str, Any]] = {
    "petal-npins": {
        "route": "/work",
        "features": ["Real-time inventory mapping", "Coupons & discount algorithms", "Stripe verification suite"]
    },
    "nova-assistant": {
        "route": "/chat",
        "features": ["Conversational navigation guide", "Context memory state machine", "60fps projected HTML/SVG orbits"]
    },
    "portfolio-os": {
        "route": "/work",
        "features": ["Scroll-driven coordinate warping", "Subtle grid plane depth sorting", "Glassmorphic parallax cards"]
    }
}

def build_response(intent_data: Dict[str, Any], query_text: str, current_memory: VisitorMemory) -> QueryResponse:
    intent = intent_data["intent"]
    confidence = intent_data["confidence"]
    action = intent_data["action"]
    payload = intent_data["payload"]

    reply = "I received your query. This is a secure response from the FastAPI engine."
    preview = None

    # Topics tracing update
    updated_topics = list(current_memory.topics) if current_memory.topics else []

    if intent == "portfolio":
        p_data = provider.get_portfolio()
        reply = (
            f"This portfolio, \"{p_data.get('title', '')}\" (version {p_data.get('version', '')}), "
            f"was designed and created by {p_data.get('owner', '')} based in {p_data.get('location', '')}. "
            f"It is {p_data.get('summary', '')} {p_data.get('copyright', '')}."
        )
        if "about" not in updated_topics:
            updated_topics.append("about")

    elif intent == "about":
        a_data = provider.get_about()
        focus_str = ", ".join(a_data.get("focus", []))
        reply = (
            f"{a_data.get('bio', '')} "
            f"My design philosophy is: {a_data.get('philosophy', '')} "
            f"I specialize in: {focus_str}."
        )
        if "about" not in updated_topics:
            updated_topics.append("about")

    elif intent == "projects":
        if not payload:
            reply = (
                "I have featured projects across Brand Identity, Wellness Mobile Apps, "
                "Modular Portfolio design templates, and Financial tracker dashboards. "
                "You can select a project grid item or say \"Open project\" to view the details."
            )
        else:
            p = provider.get_project_by_id(payload)
            if p:
                techs_str = ", ".join(p.get("technologies", []))
                reply = (
                    f"The project \"{p.get('title', '')}\" is a {p.get('category', '')} system. "
                    f"I designed and built this in {p.get('year', '')} (difficulty: {p.get('difficulty', '')}, "
                    f"status: {p.get('status', '')}). Technologies used include: {techs_str}. "
                    f"The key challenge was: {p.get('challenges', '')} and the result was: {p.get('results', '')}."
                )
                
                # Fetch metadata fallbacks
                meta_fallback = PROJECT_METADATA_FALLBACKS.get(payload, {})
                route = p.get("route") or meta_fallback.get("route", "/work")
                features = p.get("features") or meta_fallback.get("features", [])
                
                preview = PreviewData(
                    type="project",
                    data={
                        "id": p.get("id"),
                        "name": p.get("title"),
                        "category": p.get("category"),
                        "summary": p.get("summary"),
                        "description": p.get("description"),
                        "tech": p.get("technologies"),
                        "route": route,
                        "features": features,
                        "related": p.get("related", [])
                    }
                )
        if "projects" not in updated_topics:
            updated_topics.append("projects")

    elif intent == "skills":
        s_data = provider.get_skills()
        cats_formatted = []
        for cat in s_data.get("categories", []):
            techs = cat.get("techs", [])
            techs_str = ", ".join(techs[:3])
            cats_formatted.append(f"{cat.get('name')} ({techs_str}...)")
        cats_str = "; ".join(cats_formatted)
        raw_skills = ", ".join([r.get("name") for r in s_data.get("rawList", [])])
        
        reply = (
            f"{s_data.get('summary', '')} "
            f"My skillset is structured in categories: {cats_str}. "
            f"My top competencies are: {raw_skills}."
        )
        preview = PreviewData(
            type="skills",
            data={
                "categories": s_data.get("categories"),
                "rawList": s_data.get("rawList")
            }
        )
        if "skills" not in updated_topics:
            updated_topics.append("skills")

    elif intent == "experience":
        exp_data = provider.get_experience()
        exp_list = []
        for e in exp_data:
            exp_list.append(
                f"{e.get('role')} at {e.get('company')} ({e.get('year')} - "
                f"status: {e.get('status')}, difficulty level: {e.get('difficulty')})"
            )
        exp_str = " | ".join(exp_list)
        reply = f"My professional experience chronology consists of: {exp_str}."
        preview = PreviewData(
            type="experience",
            # Encapsulating list exactly matching useNovaKnowledge.js output format
            data={"experience": exp_data}
        )
        if "experience" not in updated_topics:
            updated_topics.append("experience")

    elif intent == "contact":
        c_data = provider.get_contact()
        reply = (
            f"{c_data.get('detailedDescription', '')} "
            f"I am based in {c_data.get('location', '')} and my current "
            f"status is: {c_data.get('availability', '')}."
        )
        preview = PreviewData(
            type="contact",
            data=c_data
        )
        if "contact" not in updated_topics:
            updated_topics.append("contact")

    # Name extraction logic (regex pattern)
    lastName = current_memory.lastName
    name_match = re.search(r"(?:i'm|i am|my name is)\s+([a-zA-Z]+)", query_text.lower())
    if name_match:
        lastName = name_match.group(1).capitalize()

    updated_mem = VisitorMemory(
        visitCount=current_memory.visitCount,
        topics=updated_topics,
        lastName=lastName,
        lastQuestion=query_text[:120]
    )

    debug_meta = None
    if DEBUG:
        debug_meta = DebugMetadata(
            matched_keywords=intent_data.get("keywords", []),
            matched_intent=intent,
            confidence=confidence
        )

    return QueryResponse(
        reply=reply,
        intent=intent,
        confidence=confidence,
        action=action,
        preview=preview,
        updated_memory=updated_mem,
        debug=debug_meta
    )
