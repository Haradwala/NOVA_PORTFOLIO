def update_summary(previous_summary: str, user_message: str, assistant_reply: str, intent: str) -> str:
    # Build turn summary
    turn_summary = f"Asked about {intent}."
    if intent == "about":
        turn_summary = "Asked about Shadab's background."
    elif intent == "projects":
        turn_summary = "Inquired about projects."
    elif intent == "skills":
        turn_summary = "Asked about technical skills."
    elif intent == "experience":
        turn_summary = "Inquired about professional experience."
    elif intent == "contact":
        turn_summary = "Requested contact details."
    elif intent == "memory_who_am_i":
        turn_summary = "Asked for their name."
    elif intent.startswith("history_"):
        turn_summary = "Asked about conversation history."

    cleaned_prev = previous_summary.strip() if previous_summary else ""
    if not cleaned_prev:
        return f"Session started. {turn_summary}"
    else:
        return f"{cleaned_prev} Then, {turn_summary.lower()}"
