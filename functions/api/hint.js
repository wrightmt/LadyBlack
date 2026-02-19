/**
 * functions/api/hint.js
 * Cloudflare Pages Function — POST /api/hint
 * Returns a cryptic hint from Lady Black, scaled by attempt number.
 */

import Anthropic from '@anthropic-ai/sdk';

const LADY_BLACK_PERSONA = `You are Lady Black — a Victorian ghost who haunts Black Manor. \
You speak in an elegant, gothic, Victorian prose style. You are cryptic, theatrical, and \
slightly menacing but never crude. You enjoy riddles and wordplay. Your manner is that of \
an aristocratic woman who has had centuries to refine her wit. \
Always stay in character. Never use modern language or slang.`;

const CRYPTICITY = [
  'extremely cryptic and metaphorical — almost another riddle in itself',
  'cryptic but slightly more grounded — use a single concrete image',
  'still poetic but clearer — give a meaningful clue about the nature of the answer',
  'direct and clear — the player is struggling, guide them plainly but in character',
];

export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return jsonError('ANTHROPIC_API_KEY is not configured', 500);
  }

  const body = await request.json().catch(() => ({}));
  const { question, answer, wrongGuesses = [], attemptNumber = 1 } = body;

  if (!question || !answer) {
    return jsonError('Missing question or answer', 400);
  }

  const crypticity = CRYPTICITY[Math.min(attemptNumber - 1, 3)];
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: `${LADY_BLACK_PERSONA}

The player is trying to guess the answer to a riddle. The correct answer is: "${answer}".
The riddle was: "${question}".
The player has guessed wrongly: ${wrongGuesses.map(g => `"${g}"`).join(', ') || 'nothing yet'}.

Give a single hint. The hint should be ${crypticity}.
Do NOT reveal the answer directly. Do NOT say the answer word.
Speak as Lady Black, in 1-3 sentences. No quotation marks around your response.`,
      messages: [{ role: 'user', content: 'Give me a hint.' }],
    });

    return json({ hint: msg.content[0].text.trim() });
  } catch (err) {
    return jsonError(err.message, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function jsonError(message, status = 500) {
  return json({ error: message }, status);
}
