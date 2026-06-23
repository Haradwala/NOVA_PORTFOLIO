import { blobToDataUrl } from './audio';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function parseJson(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

export async function fetchNovaReply({ systemPrompt, messages, maxOutputTokens = 300 }) {
  const response = await fetch(`${API_BASE_URL}/api/nova`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemPrompt,
      messages,
      maxOutputTokens,
    }),
  });

  const data = await parseJson(response);
  return data.reply;
}

export async function transcribeAudio(blob, options = {}) {
  const audio = await blobToDataUrl(blob);

  const response = await fetch(`${API_BASE_URL}/api/stt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio,
      language: options.language || 'en',
      prompt: options.prompt || '',
    }),
  });

  const data = await parseJson(response);
  return data.text;
}

export async function synthesizeSpeech(text, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      voice: options.voice,
      instructions: options.instructions,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Could not synthesize speech.');
  }

  return response.blob();
}
