from typing import List, Dict, Any, Optional
from app.services.intent.parser import tokenize
from app.services.knowledge import provider

def get_match_ratio(query_tokens: List[str], db_keywords: List[str], db_tags: List[str]) -> float:
    if not query_tokens:
        return 0.0
    
    db_set = {k.lower() for k in db_keywords} | {t.lower() for t in db_tags}
    hits = 0.0
    
    for t in query_tokens:
        if t in db_set:
            hits += 1.0
        else:
            for dw in db_set:
                if t in dw or dw in t:
                    hits += 0.5
                    break
    return hits / len(query_tokens)

def get_matched_keywords(query_tokens: List[str], db_keywords: List[str], db_tags: List[str]) -> List[str]:
    db_set = {k.lower() for k in db_keywords} | {t.lower() for t in db_tags}
    matched = []
    for t in query_tokens:
        if t in db_set:
            matched.append(t)
        else:
            for dw in db_set:
                if t in dw or dw in t:
                    matched.append(dw)
                    break
    return list(set(matched))

def match_intent(text: str) -> Dict[str, Any]:
    raw_query = text.lower().strip()
    query_tokens = tokenize(raw_query)
    
    best_intent = "fallback"
    best_confidence = 0.0
    best_action = None
    best_payload = None
    best_keywords = []
    
    def update_best(intent_name: str, confidence: float, action_name: Optional[str] = None, payload: Optional[str] = None, matched_kws: List[str] = None):
        nonlocal best_intent, best_confidence, best_action, best_payload, best_keywords
        if confidence > best_confidence:
            best_intent = intent_name
            best_confidence = confidence
            best_action = action_name
            best_payload = payload
            best_keywords = matched_kws or []

    # 1. about match (Prioritized first to prevent portfolio overlap on bio requests)
    about_data = provider.get_about()
    about_kws = get_matched_keywords(query_tokens, about_data.get("keywords", []), about_data.get("tags", []))
    phrase_list = ['who are you', 'who is shadab', 'about yourself', 'your background', 'whats your background', 'what\'s your background', 'about you', 'about yourself']
    if any(phrase in raw_query for phrase in phrase_list):
        about_score = 1.0
        for phrase in phrase_list:
            if phrase in raw_query and phrase not in about_kws:
                about_kws.append(phrase)
    else:
        about_score = get_match_ratio(query_tokens, about_data.get("keywords", []), about_data.get("tags", []))
    update_best("about", about_score, matched_kws=about_kws)

    # 2. projects match (General vs Specific)
    projects_data = provider.get_projects()
    general_keywords = ['project', 'projects', 'work', 'works', 'portfolio', 'case studies', 'case study']
    has_general_kw = any(kw in raw_query for kw in general_keywords)
    has_specific_match = False
    
    for p in projects_data:
        p_id = p.get("id", "").lower()
        p_title = p.get("title", "").lower()
        if p_id in raw_query or p_title in raw_query or p_id.replace('-', '') in raw_query:
            has_specific_match = True
            break
            
    is_general_query = has_general_kw and not has_specific_match
    
    if is_general_query:
        general_kws = [kw for kw in general_keywords if kw in raw_query]
        update_best("projects", 0.85, "scroll_projects", matched_kws=general_kws)
    else:
        for p in projects_data:
            p_id = p.get("id", "").lower()
            p_title = p.get("title", "").lower()
            proj_kws = get_matched_keywords(query_tokens, p.get("keywords", []), p.get("tags", []))
            
            if p_id in raw_query or p_title in raw_query or p_id.replace('-', '') in raw_query:
                proj_score = 1.0
                if p_id in raw_query and p_id not in proj_kws:
                    proj_kws.append(p_id)
                if p_title in raw_query and p_title not in proj_kws:
                    proj_kws.append(p_title)
            else:
                proj_score = get_match_ratio(query_tokens, p.get("keywords", []), p.get("tags", []))
            
            update_best("projects", proj_score, p.get("action", "open_project"), p.get("id"), matched_kws=proj_kws)

    # 3. skills match
    skills_data = provider.get_skills()
    skills_keywords = ['skills', 'toolkit', 'stack', 'three.js', 'react', 'supabase', 'figma', 'webgl', 'python', 'fastapi']
    skills_kws = get_matched_keywords(query_tokens, skills_data.get("keywords", []), skills_data.get("tags", []))
    has_skill_kw = any(kw in raw_query for kw in skills_keywords)
    
    if has_skill_kw:
        skills_score = 0.95
        for kw in skills_keywords:
            if kw in raw_query and kw not in skills_kws:
                skills_kws.append(kw)
    else:
        skills_score = get_match_ratio(query_tokens, skills_data.get("keywords", []), skills_data.get("tags", []))
    update_best("skills", skills_score, "highlight_skills", matched_kws=skills_kws)

    # 4. experience match
    experience_data = provider.get_experience()
    exp_keywords = []
    exp_tags = []
    for e in experience_data:
        exp_keywords.extend(e.get("keywords", []))
        exp_tags.extend(e.get("tags", []))
    exp_score = get_match_ratio(query_tokens, exp_keywords, exp_tags)
    exp_kws = get_matched_keywords(query_tokens, exp_keywords, exp_tags)
    update_best("experience", exp_score, matched_kws=exp_kws)

    # 5. contact match
    contact_data = provider.get_contact()
    contact_score = get_match_ratio(query_tokens, contact_data.get("keywords", []), contact_data.get("tags", []))
    contact_kws = get_matched_keywords(query_tokens, contact_data.get("keywords", []), contact_data.get("tags", []))
    update_best("contact", contact_score, "scroll_contact", matched_kws=contact_kws)

    # 6. portfolio identity match
    portfolio_data = provider.get_portfolio()
    port_kws = get_matched_keywords(query_tokens, portfolio_data.get("keywords", []), portfolio_data.get("tags", []))
    if any(phrase in raw_query for phrase in ['who created', 'who designed', 'who built', 'creator']):
        portfolio_score = 1.0
        for phrase in ['who created', 'who designed', 'who built', 'creator']:
            if phrase in raw_query and phrase not in port_kws:
                port_kws.append(phrase)
    else:
        portfolio_score = get_match_ratio(query_tokens, portfolio_data.get("keywords", []), portfolio_data.get("tags", []))
    update_best("portfolio", portfolio_score, matched_kws=port_kws)

    # 7. memory intents
    if any(p in raw_query for p in ["who am i", "what is my name", "what's my name"]):
        update_best("memory_who_am_i", 1.0, matched_kws=["name"])
    elif any(p in raw_query for p in ["what do you remember about me", "what do you remember"]):
        update_best("memory_what_do_you_remember", 1.0, matched_kws=["remember", "memory"])
    elif any(p in raw_query for p in ["what have i asked about", "what have i asked"]):
        update_best("memory_what_have_i_asked", 1.0, matched_kws=["asked"])
    elif any(p in raw_query for p in ["have we met before", "have we met"]):
        update_best("memory_have_we_met", 1.0, matched_kws=["met", "visit"])
    elif any(p in raw_query for p in ["what were we talking about", "what did we talk about"]):
        update_best("history_what_talking_about", 1.0, matched_kws=["history", "talking"])
    elif any(p in raw_query for p in ["continue our conversation", "continue conversation"]):
        update_best("history_continue_conversation", 1.0, matched_kws=["continue"])
    elif any(p in raw_query for p in ["summarize this session", "summarize our session"]):
        update_best("history_summarize_session", 1.0, matched_kws=["summarize", "session"])
    elif any(p in raw_query for p in ["what projects interested me", "what projects did i ask about", "which projects did i look at"]):
        update_best("history_projects_interested", 1.0, matched_kws=["projects", "interested"])
    elif any(p in raw_query for p in ["what skills did i ask about", "what skills did i ask", "which skills did i ask", "what skills interested me", "which skills interested me"]):
        update_best("history_skills_asked", 1.0, matched_kws=["skills", "asked"])

    # Fallback threshold checks


    if best_confidence < 0.25:
        return {
            "intent": "fallback",
            "confidence": 0.0,
            "action": None,
            "payload": None,
            "keywords": []
        }
        
    return {
        "intent": best_intent,
        "confidence": best_confidence,
        "action": best_action,
        "payload": best_payload,
        "keywords": best_keywords
    }
