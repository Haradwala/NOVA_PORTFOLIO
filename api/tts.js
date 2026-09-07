import {
  OPENAI_TTS_MODEL,
  OPENAI_TTS_VOICE,
  parseRequestBody,
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
    const { text, voice = OPENAI_TTS_VOICE, instructions = '' } = await parseRequestBody(req);

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for speech synthesis.' });
    }

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

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (error) {
    console.error('[TTS] Error:', error.message);
    return res.status(500).json({
      error: error.message || 'Could not generate speech.',
    });
  }
}
