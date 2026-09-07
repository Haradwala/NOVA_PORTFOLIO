import {
  LLM_PROVIDER,
  GROQ_MODEL,
  OPENAI_MODEL,
  OLLAMA_MODEL,
  parseRequestBody,
  callGroqChat,
  callOpenAI,
  callOllamaChat,
  extractResponseText,
} from './_lib/llm.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { systemPrompt, messages = [], maxOutputTokens = 300 } = await parseRequestBody(req);

    const formattedMessages = [];
    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }
    for (const msg of messages) {
      const role = msg.role === 'nova' ? 'assistant' : msg.role;
      if (role && msg.content) {
        formattedMessages.push({ role, content: msg.content });
      }
    }

    let chatRes;
    if (LLM_PROVIDER === 'ollama') {
      chatRes = await callOllamaChat(formattedMessages, maxOutputTokens);
    } else if (LLM_PROVIDER === 'openai') {
      chatRes = await callOpenAI('/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: formattedMessages,
          max_tokens: maxOutputTokens,
        }),
      });
    } else {
      chatRes = await callGroqChat(formattedMessages, maxOutputTokens);
    }

    const data = await chatRes.json();
    const reply = extractResponseText(data);

    if (!reply) {
      let providerName = 'Groq';
      let modelName = GROQ_MODEL;
      if (LLM_PROVIDER === 'ollama') {
        providerName = 'Ollama';
        modelName = OLLAMA_MODEL;
      } else if (LLM_PROVIDER === 'openai') {
        providerName = 'OpenAI';
        modelName = OPENAI_MODEL;
      }
      throw new Error(`${providerName} (${modelName || 'default'}) returned an empty reply.`);
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[NOVA API] Error:', error.message);
    return res.status(500).json({
      error: error.message || 'Could not fetch NOVA response.',
    });
  }
}
