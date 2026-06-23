import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env');

if (existsSync(envPath)) {
  const envLines = readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of envLines) {
    if (!line || line.trim().startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const PORT = Number(process.env.PORT || 8787);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const OPENAI_STT_MODEL = process.env.OPENAI_STT_MODEL || 'gpt-4o-mini-transcribe';
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'nova';

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

function sendAudio(res, status, buffer, contentType = 'audio/mpeg') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(buffer);
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function extractResponseText(data) {
  if (data && data.choices && data.choices[0] && data.choices[0].message) {
    return (data.choices[0].message.content || '').trim();
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

function dataUrlToFile(dataUrl, fallbackName = 'recording.webm') {
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

async function callOpenAI(path, options = {}) {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY. Add it to your .env before starting the API server.');
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

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/nova') {
    try {
      const { systemPrompt, messages = [], maxOutputTokens = 300 } = await readJsonBody(req);

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

      const openAiRes = await callOpenAI('/chat/completions', {
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

      const data = await openAiRes.json();
      const reply = extractResponseText(data);

      if (!reply) {
        throw new Error('OpenAI returned an empty reply.');
      }

      sendJson(res, 200, { reply });
    } catch (error) {
      console.error('[NOVA API] Error:', error.message);
      sendJson(res, 500, {
        error: error.message || 'Could not fetch NOVA response.',
      });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/stt') {
    try {
      const { audio, language = 'en', prompt = '' } = await readJsonBody(req);
      const file = dataUrlToFile(audio);
      const form = new FormData();

      form.append('file', file.blob, file.filename);
      form.append('model', OPENAI_STT_MODEL);
      form.append('language', language);

      if (prompt) {
        form.append('prompt', prompt);
      }

      const openAiRes = await callOpenAI('/audio/transcriptions', {
        method: 'POST',
        body: form,
      });

      const data = await openAiRes.json();
      const text = typeof data.text === 'string' ? data.text.trim() : '';

      if (!text) {
        throw new Error('No transcription text was returned.');
      }

      sendJson(res, 200, { text });
    } catch (error) {
      sendJson(res, 500, {
        error: error.message || 'Could not transcribe audio.',
      });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/tts') {
    try {
      const { text, voice = OPENAI_TTS_VOICE, instructions = '' } = await readJsonBody(req);

      if (!text || !text.trim()) {
        sendJson(res, 400, { error: 'Text is required for speech synthesis.' });
        return;
      }

      // `instructions` is only supported by gpt-4o-mini-tts / gpt-4o-tts.
      // tts-1 and tts-1-hd will reject the field with a 400/500 error.
      const supportsInstructions = OPENAI_TTS_MODEL.startsWith('gpt-4o');

      const requestBody = {
        model: OPENAI_TTS_MODEL,
        voice,
        input: text.trim(),
        response_format: 'mp3',
        ...(supportsInstructions && instructions ? { instructions } : {}),
      };

      const openAiRes = await callOpenAI('/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const audioBuffer = Buffer.from(await openAiRes.arrayBuffer());
      sendAudio(res, 200, audioBuffer);
    } catch (error) {
      console.error('[TTS] Error:', error.message);
      sendJson(res, 500, {
        error: error.message || 'Could not generate speech.',
      });
    }
    return;
  }


  sendJson(res, 404, { error: 'Not found.' });
});

server.listen(PORT, () => {
  console.log(`NOVA API listening on http://localhost:${PORT}`);
});
