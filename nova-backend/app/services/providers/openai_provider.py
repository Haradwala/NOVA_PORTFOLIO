import os
import time
import logging
import json
from typing import List, Dict, Any, Generator, Optional
from openai import OpenAI

from app.services.providers.provider import BaseAIProvider
from app.services.providers.prompts import get_system_prompt

logger = logging.getLogger("openai_provider")

class OpenAIProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, timeout: Optional[float] = None):
        """
        Initializes the OpenAI provider.
        """
        self._api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self._api_key:
            raise ValueError("OPENAI_API_KEY environment variable is missing.")
        
        self._model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        
        timeout_val = timeout or os.getenv("OPENAI_TIMEOUT")
        self._timeout = float(timeout_val) if timeout_val else 10.0
        
        self.client = OpenAI(api_key=self._api_key, timeout=self._timeout)

    def chat(self, messages: List[Dict[str, str]], context: Dict[str, Any]) -> str:
        """
        Sends chat request to OpenAI and returns the reply.
        """
        import uuid
        request_id = str(uuid.uuid4())
        t_start = time.time()
        
        system_prompt = get_system_prompt(context)
        formatted_messages = [{"role": "system", "content": system_prompt}] + messages
        
        try:
            response = self.client.chat.completions.create(
                model=self._model,
                messages=formatted_messages
            )
            reply = response.choices[0].message.content or ""
            latency = time.time() - t_start
            usage = response.usage
            
            log_data = {
                "request_id": request_id,
                "provider": self.name(),
                "model": self._model,
                "latency": latency,
                "token_usage": {
                    "prompt_tokens": usage.prompt_tokens if usage else 0,
                    "completion_tokens": usage.completion_tokens if usage else 0,
                    "total_tokens": usage.total_tokens if usage else 0
                },
                "status": "success"
            }
            logger.info(f"OpenAIStructuredLog: {json.dumps(log_data)}")
            return reply
            
        except Exception as e:
            latency = time.time() - t_start
            log_data = {
                "request_id": request_id,
                "provider": self.name(),
                "model": self._model,
                "latency": latency,
                "token_usage": {
                    "prompt_tokens": 0,
                    "completion_tokens": 0,
                    "total_tokens": 0
                },
                "status": "failed"
            }
            logger.error(f"OpenAIStructuredLog: {json.dumps(log_data)}")
            raise e

    def stream_chat(self, messages: List[Dict[str, str]], context: Dict[str, Any]) -> Generator[str, None, None]:
        """
        Sends chat request and streams response chunks from OpenAI.
        """
        import uuid
        request_id = str(uuid.uuid4())
        t_start = time.time()
        
        system_prompt = get_system_prompt(context)
        formatted_messages = [{"role": "system", "content": system_prompt}] + messages
        
        try:
            response = self.client.chat.completions.create(
                model=self._model,
                messages=formatted_messages,
                stream=True,
                stream_options={"include_usage": True}
            )
            
            prompt_tokens = 0
            completion_tokens = 0
            total_tokens = 0
            
            for chunk in response:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if delta.content:
                        yield delta.content
                if hasattr(chunk, "usage") and chunk.usage is not None:
                    prompt_tokens = chunk.usage.prompt_tokens
                    completion_tokens = chunk.usage.completion_tokens
                    total_tokens = chunk.usage.total_tokens
                    
            latency = time.time() - t_start
            log_data = {
                "request_id": request_id,
                "provider": self.name(),
                "model": self._model,
                "latency": latency,
                "token_usage": {
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": total_tokens
                },
                "status": "success"
            }
            logger.info(f"OpenAIStructuredLog: {json.dumps(log_data)}")
            
        except Exception as e:
            latency = time.time() - t_start
            log_data = {
                "request_id": request_id,
                "provider": self.name(),
                "model": self._model,
                "latency": latency,
                "token_usage": {
                    "prompt_tokens": 0,
                    "completion_tokens": 0,
                    "total_tokens": 0
                },
                "status": "failed"
            }
            logger.error(f"OpenAIStructuredLog: {json.dumps(log_data)}")
            raise e

    def transcribe(self, audio_bytes: bytes) -> str:
        """Speech to text is not implemented."""
        raise NotImplementedError("Transcription is not supported by OpenAIProvider.")

    def speak(self, text: str) -> bytes:
        """Speech synthesis is not implemented."""
        raise NotImplementedError("Text-to-speech is not supported by OpenAIProvider.")

    def embed(self, text: str) -> List[float]:
        """
        Generates vector embeddings for a given text using OpenAI API.
        """
        import os
        embedding_model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
        try:
            response = self.client.embeddings.create(
                input=[text],
                model=embedding_model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"OpenAI embedding generation failed: {e}")
            raise e

    def health(self) -> bool:
        """
        Verifies API credentials and status by listing available models.
        """
        try:
            self.client.models.list()
            return True
        except Exception as e:
            logger.warning(f"OpenAI health check failed: {e}")
            return False

    def ready(self) -> bool:
        """Returns True if provider is initialized and active."""
        return True

    def name(self) -> str:
        """Canonical provider name."""
        return "openai"

    def version(self) -> str:
        """Version identifier."""
        return "1.0.0"
