/**
 * functions/api/validate.js
 * Cloudflare Pages Function — POST /api/validate
 * Fuzzy/synonym answer validation via Claude Haiku.
 */

import Anthropic from '@anthropic-ai/sdk';

export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return jsonError('ANTHROPIC_API_KEY is not configured', 500);
  }

  const body = await request.json().catch(() => ({}));
  const { answer, playerGuess } = body;

  if (!answer || !playerGuess) {
    return jsonError('Missing answer or playerGuess', 400);
  }

  // Fast path: exact match
  if (answer.trim().toLowerCase() === playerGuess.trim().toLowerCase()) {
    return json({ correct: true });
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 64,
      system: `You are a strict but fair judge for a riddle game.
The correct answer is: "${answer}".
The player guessed: "${playerGuess}".

Consider the guess correct if it is:
- The same word/phrase (case-insensitive)
- A common synonym that means essentially the same thing
- A reasonable spelling variation of the correct answer

Respond with ONLY the word "CORRECT" or "WRONG" — nothing else.`,
      messages: [{ role: 'user', content: 'Is the guess correct?' }],
    });

    const verdict = msg.content[0].text.trim().toUpperCase();
    return json({ correct: verdict === 'CORRECT' });
  } catch (err) {
    // Fallback to exact match on API error
    const exact = answer.trim().toLowerCase() === playerGuess.trim().toLowerCase();
    return json({ correct: exact });
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
