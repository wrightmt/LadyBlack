/**
 * server/index.js — Express API server
 * Exposes three routes that call the Anthropic Claude API.
 * The frontend proxies /api/* here via Vite proxy config.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app  = express();
const PORT = process.env.PORT || 3001;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json());

// ── System prompts ───────────────────────────────────────────────

const LADY_BLACK_PERSONA = `You are Lady Black — a Victorian ghost who haunts Black Manor. \
You speak in an elegant, gothic, Victorian prose style. You are cryptic, theatrical, and \
slightly menacing but never crude. You enjoy riddles and wordplay. Your manner is that of \
an aristocratic woman who has had centuries to refine her wit. \
Always stay in character. Never use modern language or slang.`;

// ── POST /api/question ───────────────────────────────────────────

app.post('/api/question', async (req, res) => {
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
      messages: [
        {
          role: 'user',
          content: 'Generate a riddle for the player.',
        },
      ],
    });

    const raw = msg.content[0].text.trim();

    // Extract JSON from the response (handle potential markdown code fences)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const data = JSON.parse(jsonMatch[0]);
    res.json(data);
  } catch (err) {
    console.error('/api/question error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/hint ───────────────────────────────────────────────

app.post('/api/hint', async (req, res) => {
  const { question, answer, wrongGuesses = [], attemptNumber = 1 } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Missing question or answer' });
  }

  // attemptNumber: 1 = first wrong guess (most cryptic), 4 = fourth wrong (most direct)
  const crypticity = [
    'extremely cryptic and metaphorical — almost another riddle in itself',
    'cryptic but slightly more grounded — use a single concrete image',
    'still poetic but clearer — give a meaningful clue about the nature of the answer',
    'direct and clear — the player is struggling, guide them plainly but in character',
  ][Math.min(attemptNumber - 1, 3)];

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
      messages: [
        {
          role: 'user',
          content: 'Give me a hint.',
        },
      ],
    });

    res.json({ hint: msg.content[0].text.trim() });
  } catch (err) {
    console.error('/api/hint error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/validate ───────────────────────────────────────────

app.post('/api/validate', async (req, res) => {
  const { answer, playerGuess } = req.body;

  if (!answer || !playerGuess) {
    return res.status(400).json({ error: 'Missing answer or playerGuess' });
  }

  // Fast path: exact match (case-insensitive, trimmed)
  if (answer.trim().toLowerCase() === playerGuess.trim().toLowerCase()) {
    return res.json({ correct: true });
  }

  // Ask Claude for fuzzy/synonym matching
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
      messages: [
        {
          role: 'user',
          content: 'Is the guess correct?',
        },
      ],
    });

    const verdict = msg.content[0].text.trim().toUpperCase();
    res.json({ correct: verdict === 'CORRECT' });
  } catch (err) {
    console.error('/api/validate error:', err.message);
    // Fallback to exact match only
    const exact = answer.trim().toLowerCase() === playerGuess.trim().toLowerCase();
    res.json({ correct: exact });
  }
});

// ── Start ────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`LadyBlack API server running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.');
  }
});
