// Shared LLM and audio utilities for Vercel Serverless Functions
// and local development.

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
export const OPENAI_STT_MODEL = process.env.OPENAI_STT_MODEL || 'whisper-1';
export const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'tts-1';
export const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'nova';

export const GROQ_API_KEY = process.env.GROQ_API_KEY;
export const GROQ_BASE_URL = (process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
export const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export const LLM_PROVIDER = (process.env.LLM_PROVIDER || 'groq').toLowerCase().trim();
export const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1').replace(/\/+$/, '');
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || '';

/**
 * Safely parse incoming request body whether already parsed by Vercel Node runtime
 * or provided as a raw stream.
 */
export async function parseRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

/**
 * Extract assistant response content or reasoning from OpenAI/Groq/Ollama response.
 */
export function extractResponseText(data) {
  if (data && data.choices && data.choices[0] && data.choices[0].message) {
    const msg = data.choices[0].message;
    return (msg.content || msg.reasoning || '').trim();
  }

  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const block of content) {
      if (block.type === 'output_text' && typeof block.text === 'string' && block.text.trim()) {
        return block.text.trim();
      }
      if (block.type === 'text' && typeof block.text === 'string' && block.text.trim()) {
        return block.text.trim();
      }
    }
  }

  return '';
}

/**
 * Convert base64 data URL to Blob and filename for form submission.
 */
export function dataUrlToFile(dataUrl, fallbackName = 'recording.webm') {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new Error('Invalid audio payload.');
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid audio data URL.');
  }

  const mimeType = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');
  const ext = mimeType.split('/')[1] || 'webm';
  const filename = fallbackName.replace(/\.\w+$/, `.${ext}`);
  const blob = new Blob([buffer], { type: mimeType });

  return { blob, filename };
}

/**
 * Call OpenAI REST endpoints with authentication and quota error handling.
 */
export async function callOpenAI(path, options = {}) {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY. Add it to environment variables before using OpenAI.');
  }

  const response = await fetch(`https://api.openai.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    try {
      const parsed = JSON.parse(errorText);
      const apiError = parsed?.error;
      if (apiError?.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Add billing/credits to this API project, then restart NOVA.');
      }
      if (apiError?.message) {
        throw new Error(apiError.message);
      }
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new Error(errorText || `OpenAI request failed with status ${response.status}`);
      }
      throw parseError;
    }
  }

  return response;
}

/**
 * Call Groq chat completions endpoint with bearer authentication and custom error handling.
 */
export async function callGroqChat(formattedMessages, maxOutputTokens) {
  if (!GROQ_API_KEY) {
    throw new Error(
      'Could not reach Groq — check GROQ_API_KEY is set and valid, and that GROQ_MODEL is a currently available model.'
    );
  }

  let response;
  try {
    response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: formattedMessages,
        max_tokens: maxOutputTokens,
      }),
    });
  } catch (netErr) {
    throw new Error(
      `Could not reach Groq — check GROQ_API_KEY is set and valid, and that GROQ_MODEL is a currently available model. (${netErr.message})`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    let detail = errorText;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed?.error?.message) detail = parsed.error.message;
      else if (parsed?.error) detail = parsed.error;
    } catch (_) {}
    throw new Error(
      `Could not reach Groq — check GROQ_API_KEY is set and valid, and that GROQ_MODEL is a currently available model. (HTTP ${response.status}: ${detail})`
    );
  }

  return response;
}

/**
 * Call local Ollama chat completions endpoint.
 *
 * NOTE: This is intended for local offline development (via server.js / `npm run api`).
 * In a deployed Vercel Function container, `localhost:11434` cannot reach the host machine.
 */
export async function callOllamaChat(formattedMessages, maxOutputTokens) {
  if (!OLLAMA_MODEL) {
    throw new Error(
      `Could not reach Ollama at ${OLLAMA_BASE_URL} — is \`ollama serve\` running and is OLLAMA_MODEL set correctly in .env?`
    );
  }

  let response;
  try {
    response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: formattedMessages,
        max_tokens: maxOutputTokens,
        think: false,
      }),
    });
  } catch (netErr) {
    throw new Error(
      `Could not reach Ollama at ${OLLAMA_BASE_URL} — note: local Ollama only works in local development, not in deployed Vercel Functions. (${netErr.message})`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    let detail = errorText;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed?.error?.message) detail = parsed.error.message;
      else if (parsed?.error) detail = parsed.error;
    } catch (_) {}
    throw new Error(
      `Could not reach Ollama at ${OLLAMA_BASE_URL} — (HTTP ${response.status}: ${detail})`
    );
  }

  return response;
}
