import re
from typing import List, Set

STOP_WORDS: Set[str] = {
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'to', 'for', 'in', 'on', 'at', 'by',
    'of', 'with', 'about', 'and', 'or', 'tell', 'me', 'show', 'what', 'who',
    'how', 'you', 'your', 'have', 'do', 'does', 'this', 'that', 'i'
}

def tokenize(text: str) -> List[str]:
    # Lowercase and strip whitespace
    clean_text = text.lower().strip()
    # Remove punctuation (replace non-alphanumeric, non-whitespace, and non-hyphen with spaces)
    clean_text = re.sub(r'[^\w\s-]', ' ', clean_text)
    # Split on spaces
    words = clean_text.split()
    # Filter out empty strings and stop words
    return [w for w in words if w and w not in STOP_WORDS]
