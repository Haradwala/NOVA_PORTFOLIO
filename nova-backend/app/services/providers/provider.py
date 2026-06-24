from abc import ABC, abstractmethod
from typing import List, Dict, Any, Generator

class BaseAIProvider(ABC):
    @abstractmethod
    def chat(self, messages: List[Dict[str, str]], context: Dict[str, Any]) -> str:
        """Sends chat request and returns reply string."""
        raise NotImplementedError

    @abstractmethod
    def stream_chat(self, messages: List[Dict[str, str]], context: Dict[str, Any]) -> Generator[str, None, None]:
        """Sends chat request and streams output chunks."""
        raise NotImplementedError

    @abstractmethod
    def transcribe(self, audio_bytes: bytes) -> str:
        """Transcribes speech to text from audio bytes."""
        raise NotImplementedError

    @abstractmethod
    def speak(self, text: str) -> bytes:
        """Synthesizes speech audio from text, returning audio bytes."""
        raise NotImplementedError

    @abstractmethod
    def embed(self, text: str) -> List[float]:
        """Generates vector embeddings for a given text."""
        raise NotImplementedError

    @abstractmethod
    def health(self) -> bool:
        """Checks the availability of the provider API services."""
        raise NotImplementedError
