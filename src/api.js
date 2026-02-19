/**
 * api.js — Fetch wrappers for the three Claude API routes
 */

const BASE = '/api';

/**
 * Ask the server to generate a new Gothic riddle from Lady Black.
 * @returns {Promise<{ question: string, answer: string, theme: string, category: string }>}
 */
export async function fetchQuestion() {
  const res = await fetch(`${BASE}/question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch question: ${res.status} — ${err}`);
  }
  return res.json();
}

/**
 * Ask Lady Black for a cryptic hint.
 * @param {string} question
 * @param {string} answer
 * @param {string[]} wrongGuesses
 * @param {number} attemptNumber  — 1-based; higher = used more attempts = less cryptic hint
 * @returns {Promise<{ hint: string }>}
 */
export async function fetchHint(question, answer, wrongGuesses, attemptNumber) {
  const res = await fetch(`${BASE}/hint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, wrongGuesses, attemptNumber }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch hint: ${res.status} — ${err}`);
  }
  return res.json();
}

/**
 * Ask the server to validate a player's guess (handles synonyms, fuzzy matching).
 * @param {string} answer
 * @param {string} playerGuess
 * @returns {Promise<{ correct: boolean }>}
 */
export async function validateGuess(answer, playerGuess) {
  const res = await fetch(`${BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer, playerGuess }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to validate guess: ${res.status} — ${err}`);
  }
  return res.json();
}
