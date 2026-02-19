/**
 * functions/api/question.js
 * Cloudflare Pages Function — POST /api/question
 * Generates a Gothic riddle from Lady Black via Claude.
 */

import Anthropic from '@anthropic-ai/sdk';

const LADY_BLACK_PERSONA = `You are Lady Black — a Victorian ghost who haunts Black Manor. \
You speak in an elegant, gothic, Victorian prose style. You are cryptic, theatrical, and \
slightly menacing but never crude. You enjoy riddles and wordplay. Your manner is that of \
an aristocratic woman who has had centuries to refine her wit. \
Always stay in character. Never use modern language or slang.`;

export async function onRequestPost(context) {
  const { env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return jsonError('ANTHROPIC_API_KEY is not configured', 500);
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: `${LADY_BLACK_PERSONA}

Generate a single Gothic mystery riddle suitable for a text-based game. The riddle must:
- Be written as Lady Black speaking directly to the player ("Tell me, traveller...")
- Have a clear single-word or short-phrase answer (2-3 words max)
- Be solvable with reasoning — not too obscure
- Have a gothic, Victorian, or supernatural theme

Respond ONLY with valid JSON in exactly this structure:
{
  "question": "the full riddle text Lady Black speaks",
  "answer": "the answer",
  "theme": "one-word theme e.g. shadows / mirrors / time / fire",
  "category": "category e.g. nature / object / concept / creature"
}`,
      messages: [{ role: 'user', content: 'Generate a riddle for the player.' }],
    });

    const raw = msg.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Claude response');

    const data = JSON.parse(jsonMatch[0]);
    return json(data);
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
