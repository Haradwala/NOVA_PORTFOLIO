import {
  OPENAI_STT_MODEL,
  parseRequestBody,
  dataUrlToFile,
  callOpenAI,
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
    const { audio, language = 'en', prompt = '' } = await parseRequestBody(req);
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

    return res.status(200).json({ text });
  } catch (error) {
    console.error('[STT] Error:', error.message);
    return res.status(500).json({
      error: error.message || 'Could not transcribe audio.',
    });
  }
}
