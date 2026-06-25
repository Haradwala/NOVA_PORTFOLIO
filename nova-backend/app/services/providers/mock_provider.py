from typing import List, Dict, Any, Generator
from app.services.providers.provider import BaseAIProvider

class MockProvider(BaseAIProvider):
    def chat(self, messages: List[Dict[str, str]], context: Dict[str, Any]) -> str:
        """Simulated AI text completion reply."""
        # Simple response reflecting query or context details
        query_text = messages[-1].get("content", "") if messages else ""
        return f"This is a simulated AI response from the MockProvider. Query received: '{query_text}'."

    def stream_chat(self, messages: List[Dict[str, str]], context: Dict[str, Any]) -> Generator[str, None, None]:
        """Streams simulated AI response chunks."""
        text = self.chat(messages, context)
        for word in text.split(" "):
            yield word + " "

    def transcribe(self, audio_bytes: bytes) -> str:
        """Simulated speech transcription."""
        return "Simulated transcription: hello from the user."

    def speak(self, text: str) -> bytes:
        """Simulated speech synthesis returning empty bytes."""
        return b"mock_audio_data"

    def embed(self, text: str) -> List[float]:
        """Simulated vector embeddings (1536 dims)."""
        return [0.0] * 1536

    def health(self) -> bool:
        """Returns provider health status."""
        return True

    def ready(self) -> bool:
        """Returns whether provider is initialized and active."""
        return True

    def name(self) -> str:
        """Canonical identifier name."""
        return "mock"

    def version(self) -> str:
        """Version identifier."""
        return "1.0.0"
