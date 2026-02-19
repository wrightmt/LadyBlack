/**
 * game.js — State machine + game loop
 *
 * States: BOOT → INTRO → MIDNIGHT → APPEAR → QUESTION → GUESSING → WIN | LOSE → RESTART
 */

import {
  print, blank, typewrite, typewriteLines, printArt,
  clearScreen, awaitInput, wait, divider,
} from './terminal.js';

import {
  BOOT_LINES, LADY_BLACK, CLOCK_MIDNIGHT,
  GAME_FRAME_TOP, GAME_FRAME_BOT,
  WIN_BANNER, LOSE_BANNER,
} from './art.js';

import { fetchQuestion, fetchHint, validateGuess } from './api.js';

const MAX_ATTEMPTS = 5;

// ── State ───────────────────────────────────────────────────────

let state = {
  phase: 'BOOT',
  question: '',
  answer: '',
  theme: '',
  category: '',
  attemptsLeft: MAX_ATTEMPTS,
  wrongGuesses: [],
};

function resetState() {
  state = {
    phase: 'BOOT',
    question: '',
    answer: '',
    theme: '',
    category: '',
    attemptsLeft: MAX_ATTEMPTS,
    wrongGuesses: [],
  };
}

// ── Helpers ─────────────────────────────────────────────────────

function gemsDisplay(n) {
  return '◆'.repeat(n) + '◇'.repeat(MAX_ATTEMPTS - n);
}

function loadingDots(label = 'Consulting the spirits', duration = 2200) {
  return new Promise(resolve => {
    const div = print(`${label}`, 'line-dim');
    let count = 0;
    const interval = setInterval(() => {
      count++;
      div.textContent = `${label}` + '.'.repeat((count % 4));
    }, 300);
    setTimeout(() => {
      clearInterval(interval);
      div.textContent = '';
      resolve();
    }, duration);
  });
}

// ── Phases ──────────────────────────────────────────────────────

async function phaseBoot() {
  clearScreen();
  await wait(400);

  for (const line of BOOT_LINES) {
    if (line === '') {
      blank();
      await wait(100);
    } else {
      await typewrite(line, 'line-system', 18);
      await wait(40);
    }
  }

  await wait(600);
  state.phase = 'MIDNIGHT';
  await phaseMidnight();
}

async function phaseMidnight() {
  clearScreen();
  await wait(300);
  print(GAME_FRAME_TOP, 'line-dim');
  blank();
  await printArt(CLOCK_MIDNIGHT, 'line-art', 25);
  blank();
  print(GAME_FRAME_BOT, 'line-dim');
  await wait(800);

  // Bong sequence
  for (let i = 0; i < 12; i++) {
    await typewrite(`  BONG ${i + 1} of 12...`, 'line-system', 12);
    await wait(180);
  }

  await wait(500);
  state.phase = 'APPEAR';
  await phaseAppear();
}

async function phaseAppear() {
  clearScreen();
  await wait(200);

  print('  A chill descends upon the drawing room.', 'line-system');
  await wait(400);
  print('  The candles gutter. The mirrors go dark.', 'line-system');
  await wait(500);
  blank();

  await printArt(LADY_BLACK, 'line-art-lady', 20);

  await wait(600);
  blank();
  divider('─', 60);
  blank();

  await typewriteLines([
    '  Good evening, traveller.',
    '',
    '  I am Lady Black — mistress of Black Manor,',
    '  and keeper of riddles that the living dare not ponder.',
    '',
    '  You stand at midnight in my drawing room.',
    '  There is no door behind you.',
    '',
    '  Answer my riddle and I shall grant you passage.',
    '  Fail... and the manor keeps you.',
  ], 'line-lady', 22, 60);

  blank();
  divider('─', 60);
  await wait(600);

  state.phase = 'QUESTION';
  await phaseQuestion();
}

async function phaseQuestion() {
  blank();
  print('  Preparing the riddle...', 'line-dim');

  let questionData;
  try {
    await loadingDots('  Consulting the ancient tomes', 2000);
    questionData = await fetchQuestion();
  } catch (err) {
    print(`  [ ERROR: ${err.message} ]`, 'line-error');
    print('  The spirits are silent tonight. Try again later.', 'line-system');
    return;
  }

  state.question   = questionData.question;
  state.answer     = questionData.answer;
  state.theme      = questionData.theme   || '';
  state.category   = questionData.category || '';
  state.attemptsLeft = MAX_ATTEMPTS;
  state.wrongGuesses = [];

  blank();
  divider('═', 60);
  blank();

  await typewriteLines(
    wrapText(`  ${state.question}`, 58).split('\n'),
    'line-lady', 24, 50
  );

  blank();
  divider('═', 60);
  blank();

  if (state.theme) {
    print(`  Theme: ${state.theme}`, 'line-dim');
  }

  blank();
  state.phase = 'GUESSING';
  await phaseGuessing();
}

async function phaseGuessing() {
  while (state.attemptsLeft > 0) {
    print(`  Attempts remaining: `, 'line-dim');
    print(`  ${gemsDisplay(state.attemptsLeft)}`, 'attempts-display');
    blank();

    const guess = await awaitInput('your answer...');

    if (!guess) {
      print('  Speak up. The manor does not hear silence.', 'line-system');
      blank();
      continue;
    }

    // Validate
    print('', 'line-dim');
    await loadingDots('  She considers your answer', 1400);

    let result;
    try {
      result = await validateGuess(state.answer, guess);
    } catch (err) {
      print(`  [ ERROR: ${err.message} ]`, 'line-error');
      blank();
      continue;
    }

    if (result.correct) {
      state.phase = 'WIN';
      await phaseWin();
      return;
    }

    // Wrong
    state.attemptsLeft--;
    state.wrongGuesses.push(guess);

    blank();
    print('  Incorrect.', 'line-error');
    blank();

    if (state.attemptsLeft === 0) break;

    // Get a hint
    print('  Lady Black narrows her eyes...', 'line-dim');
    await wait(600);

    let hintData;
    try {
      hintData = await fetchHint(
        state.question,
        state.answer,
        state.wrongGuesses,
        MAX_ATTEMPTS - state.attemptsLeft
      );
    } catch (err) {
      print(`  [ ERROR: ${err.message} ]`, 'line-error');
      blank();
      continue;
    }

    blank();
    divider('·', 40);
    await typewriteLines(
      wrapText(`  "${hintData.hint}"`, 58).split('\n'),
      'line-lady', 20, 40
    );
    divider('·', 40);
    blank();
  }

  state.phase = 'LOSE';
  await phaseLose();
}

async function phaseWin() {
  clearScreen();
  await wait(300);

  blank();
  await printArt(WIN_BANNER, 'line-win', 40);
  blank();
  divider('═', 60);
  blank();

  await typewriteLines([
    '  Remarkable.',
    '',
    '  You have answered correctly.',
    '',
    `  The answer was: ${state.answer}.`,
    '',
    '  Lady Black inclines her head — a rare honour.',
    '  She presses something cold into your palm.',
    '  A key. Old iron. The door behind you reappears.',
    '',
    '  "Until we meet again, traveller."',
    '',
    '  She fades. The candles brighten.',
    '  You are alone.',
  ], 'line-lady', 22, 60);

  blank();
  divider('─', 60);
  blank();
  await phaseRestart();
}

async function phaseLose() {
  clearScreen();
  await wait(400);

  blank();
  await printArt(LOSE_BANNER, 'line-error', 40);
  blank();
  divider('═', 60);
  blank();

  await typewriteLines([
    '  Five guesses. Five failures.',
    '',
    '  Lady Black throws back her head and laughs.',
    '  The sound echoes through corridors that lead nowhere.',
    '',
    `  The answer was: ${state.answer}.`,
    '',
    '  A grey light seeps beneath the door — dawn.',
    '  But dawn comes too late for you.',
    '',
    '  "You belong to the manor now."',
    '',
    '  Her form expands to fill the room.',
    '  The candles go dark.',
  ], 'line-error', 22, 60);

  blank();
  divider('─', 60);
  blank();
  await phaseRestart();
}

async function phaseRestart() {
  await typewrite('  Play again? (y / n)', 'line-system');
  blank();

  const answer = await awaitInput('y or n');

  if (answer.toLowerCase().startsWith('y')) {
    resetState();
    state.phase = 'QUESTION';
    clearScreen();
    await wait(300);

    await typewriteLines([
      '  The drawing room reshapes itself.',
      '  Lady Black re-materialises from the shadows.',
      '',
      '  "Another riddle, then."',
    ], 'line-lady', 22, 60);

    blank();
    await phaseQuestion();
  } else {
    clearScreen();
    blank();
    blank();
    await typewriteLines([
      '  You chose to leave.',
      '',
      '  The manor does not permit it.',
      '',
      '  . . .',
      '',
      '  Refresh the page to escape.',
      '  If you can.',
    ], 'line-dim', 30, 80);
    blank();
  }
}

// ── Word wrap helper ─────────────────────────────────────────────

function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    if ((current + (current ? ' ' : '') + word).length <= maxWidth) {
      current += (current ? ' ' : '') + word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.join('\n');
}

// ── Entry Point ──────────────────────────────────────────────────

export async function startGame() {
  resetState();
  await phaseBoot();
}
