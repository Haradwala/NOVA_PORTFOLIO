import os
import pytest
from unittest.mock import MagicMock, patch

from app.services.providers.openai_provider import OpenAIProvider
from app.services.orchestrator.provider_registry import get_registry
from app.services.orchestrator.orchestrator import coordinate_ai_call
from app.services.providers.mock_provider import MockProvider

def test_openai_provider_missing_key():
    """Verify that OpenAIProvider raises ValueError when API key is missing."""
    with patch.dict(os.environ, {}, clear=True):
        if "OPENAI_API_KEY" in os.environ:
            del os.environ["OPENAI_API_KEY"]
        with pytest.raises(ValueError, match="OPENAI_API_KEY environment variable is missing"):
            OpenAIProvider()

def test_openai_provider_initialization():
    """Verify initialization succeeds when key is present."""
    provider = OpenAIProvider(api_key="test-key", model="gpt-4", timeout=5.0)
    assert provider._api_key == "test-key"
    assert provider._model == "gpt-4"
    assert provider._timeout == 5.0

@patch("app.services.providers.openai_provider.OpenAI")
def test_openai_provider_chat_success(mock_openai_class):
    """Verify successful chat completion response and logging."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content="Hello there!"))
    ]
    mock_response.usage = MagicMock(prompt_tokens=10, completion_tokens=5, total_tokens=15)
    mock_client.chat.completions.create.return_value = mock_response
    
    provider = OpenAIProvider(api_key="test-key")
    
    messages = [{"role": "user", "content": "hi"}]
    context = {"permanent_memory": [], "conversation_summary": ""}
    
    response = provider.chat(messages, context)
    assert response == "Hello there!"
    mock_client.chat.completions.create.assert_called_once()

@patch("app.services.providers.openai_provider.OpenAI")
def test_openai_provider_chat_failure(mock_openai_class):
    """Verify that chat propagates exception on failure."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    mock_client.chat.completions.create.side_effect = Exception("API Error")
    
    provider = OpenAIProvider(api_key="test-key")
    messages = [{"role": "user", "content": "hi"}]
    
    with pytest.raises(Exception, match="API Error"):
        provider.chat(messages, {})

@patch("app.services.providers.openai_provider.OpenAI")
def test_openai_provider_stream_chat(mock_openai_class):
    """Verify stream_chat generator yielding chunks and usage processing."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    chunk1 = MagicMock()
    chunk1.choices = [MagicMock(delta=MagicMock(content="Hello "))]
    chunk1.usage = None
    
    chunk2 = MagicMock()
    chunk2.choices = [MagicMock(delta=MagicMock(content="world!"))]
    chunk2.usage = None
    
    chunk3 = MagicMock()
    chunk3.choices = []
    chunk3.usage = MagicMock(prompt_tokens=8, completion_tokens=4, total_tokens=12)
    
    mock_client.chat.completions.create.return_value = [chunk1, chunk2, chunk3]
    
    provider = OpenAIProvider(api_key="test-key")
    chunks = list(provider.stream_chat([{"role": "user", "content": "hi"}], {}))
    
    assert chunks == ["Hello ", "world!"]

@patch("app.services.providers.openai_provider.OpenAI")
def test_openai_provider_health_check(mock_openai_class):
    """Verify health returns True on successful API reachability and False otherwise."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    provider = OpenAIProvider(api_key="test-key")
    
    # Success case
    mock_client.models.list.return_value = []
    assert provider.health() is True
    
    # Failure case
    mock_client.models.list.side_effect = Exception("Auth failure")
    assert provider.health() is False

def test_openai_provider_unsupported_methods():
    """Verify unsupported methods raise NotImplementedError."""
    provider = OpenAIProvider(api_key="test-key")
    with pytest.raises(NotImplementedError):
        provider.transcribe(b"")
    with pytest.raises(NotImplementedError):
        provider.speak("")

@patch("app.services.providers.openai_provider.OpenAI")
def test_orchestrator_fallback_on_openai_error(mock_openai_class):
    """Verify that calling coordinate_ai_call falls back to mock provider if OpenAI fails."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    mock_client.chat.completions.create.side_effect = Exception("OpenAI down")
    
    registry = get_registry()
    openai_provider = OpenAIProvider(api_key="test-key")
    
    try:
        registry.register(openai_provider)
        if not registry.exists("mock"):
            registry.register(MockProvider())
            
        registry.set_default("openai")
        
        # Call orchestrator, which defaults to openai
        normalized = coordinate_ai_call("test-session", "hello world", provider_name="openai")
        
        # Should fall back to mock
        assert normalized["provider"] == "mock"
        assert normalized["status"] == "success"
        assert "simulated AI response" in normalized["content"]
    finally:
        if registry.exists("openai"):
            registry.unregister("openai")
        if registry.exists("mock"):
            registry.set_default("mock")
