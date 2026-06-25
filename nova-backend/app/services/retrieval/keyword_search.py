import re
from typing import List, Dict, Any, Optional

class KeywordSearchIndex:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []

    def load_from_knowledge(self) -> None:
        """Loads and indexes knowledge data from providers."""
        self.documents.clear()
        
        from app.services.knowledge.provider import (
            get_about, get_contact, get_experience, get_portfolio, get_projects, get_skills
        )
        
        # 1. Projects
        for p in get_projects():
            content_parts = [
                p.get("title", ""),
                p.get("category", ""),
                p.get("summary", ""),
                p.get("description", ""),
                p.get("detailedDescription", ""),
                " ".join(p.get("technologies", [])),
                " ".join(p.get("tags", [])),
                " ".join(p.get("keywords", []))
            ]
            content = " ".join([part for part in content_parts if part])
            self.documents.append({
                "id": f"project:{p['id']}",
                "type": "project",
                "name": p.get("title", ""),
                "content": content,
                "metadata": p
            })
            
        # 2. Experience
        for exp in get_experience():
            content_parts = [
                exp.get("role", ""),
                exp.get("company", ""),
                exp.get("summary", ""),
                exp.get("detailedDescription", ""),
                " ".join(exp.get("tags", [])),
                " ".join(exp.get("keywords", []))
            ]
            content = " ".join([part for part in content_parts if part])
            self.documents.append({
                "id": f"experience:{exp['id']}",
                "type": "experience",
                "name": exp.get("company", ""),
                "content": content,
                "metadata": exp
            })
            
        # 3. About
        about = get_about()
        if about:
            content_parts = [
                about.get("name", ""),
                about.get("title", ""),
                about.get("bio", ""),
                about.get("philosophy", ""),
                about.get("summary", ""),
                about.get("detailedDescription", ""),
                " ".join(about.get("focus", [])),
                " ".join(about.get("tags", [])),
                " ".join(about.get("keywords", []))
            ]
            content = " ".join([part for part in content_parts if part])
            self.documents.append({
                "id": about.get("id", "shadab-about"),
                "type": "about",
                "name": about.get("name", "Shadab"),
                "content": content,
                "metadata": about
            })
            
        # 4. Skills
        skills = get_skills()
        if skills:
            content_parts = [
                skills.get("summary", ""),
                skills.get("detailedDescription", "")
            ]
            for cat in skills.get("categories", []):
                content_parts.extend([
                    cat.get("name", ""),
                    cat.get("summary", ""),
                    cat.get("detailedDescription", ""),
                    " ".join(cat.get("techs", [])),
                    " ".join(cat.get("tags", [])),
                    " ".join(cat.get("keywords", []))
                ])
            for raw in skills.get("rawList", []):
                content_parts.append(raw.get("name", ""))
            
            content = " ".join([part for part in content_parts if part])
            self.documents.append({
                "id": skills.get("id", "shadab-skills"),
                "type": "skills",
                "name": "Skills",
                "content": content,
                "metadata": skills
            })
            
        # 5. Portfolio
        portfolio = get_portfolio()
        if portfolio:
            content_parts = [
                portfolio.get("owner", ""),
                portfolio.get("title", ""),
                portfolio.get("tagline", ""),
                portfolio.get("summary", ""),
                portfolio.get("detailedDescription", ""),
                " ".join(portfolio.get("tags", [])),
                " ".join(portfolio.get("keywords", []))
            ]
            content = " ".join([part for part in content_parts if part])
            self.documents.append({
                "id": portfolio.get("id", "portfolio-identity"),
                "type": "portfolio",
                "name": portfolio.get("title", ""),
                "content": content,
                "metadata": portfolio
            })
            
        # 6. Contact
        contact = get_contact()
        if contact:
            content_parts = [
                contact.get("email", ""),
                contact.get("location", ""),
                contact.get("availability", ""),
                contact.get("summary", ""),
                contact.get("detailedDescription", ""),
                " ".join([soc.get("name", "") for soc in contact.get("socials", [])]),
                " ".join(contact.get("tags", [])),
                " ".join(contact.get("keywords", []))
            ]
            content = " ".join([part for part in content_parts if part])
            self.documents.append({
                "id": contact.get("id", "shadab-contact"),
                "type": "contact",
                "name": "Contact",
                "content": content,
                "metadata": contact
            })

    def search(self, query: str, limit: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Lightweight overlap search scoring."""
        query_words = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 1]
        if not query_words:
            query_words = [query.lower()]
            
        results = []
        for doc in self.documents:
            if filters:
                match = True
                for k, v in filters.items():
                    if doc["metadata"].get(k) != v:
                        match = False
                        break
                if not match:
                    continue
                    
            content_lower = doc["content"].lower()
            name_lower = doc["name"].lower()
            score = 0.0
            for word in query_words:
                count = content_lower.count(word)
                name_count = name_lower.count(word)
                if count > 0 or name_count > 0:
                    score += (count * 1.0) + (name_count * 2.5)
                    
            if score > 0:
                results.append({
                    "id": doc["id"],
                    "type": doc["type"],
                    "name": doc["name"],
                    "content": doc["content"],
                    "score": score,
                    "metadata": doc["metadata"]
                })
                
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]
