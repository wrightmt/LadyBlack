/**
 * terminal.js — Typewriter, print, and screen utilities
 * All output goes through these functions.
 */

const terminalEl = document.getElementById('terminal');
const inputRow   = document.getElementById('input-row');
const inputEl    = document.getElementById('player-input');

// ── Internal helpers ────────────────────────────────────────────

function makeLine(text = '', cssClass = '') {
  const div = document.createElement('div');
  div.className = cssClass || '';
  div.textContent = text;
  return div;
}

function scrollBottom() {
  terminalEl.scrollTop = terminalEl.scrollHeight;
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Instantly print a line to the terminal.
 * @param {string} text
 * @param {string} cssClass  — e.g. 'line-lady', 'line-system', 'line-art'
 */
export function print(text = '', cssClass = '') {
  const div = makeLine(text, cssClass);
  terminalEl.appendChild(div);
  scrollBottom();
  return div;
}

/**
 * Print a blank line.
 */
export function blank() {
  const div = document.createElement('div');
  div.className = 'line-blank';
  terminalEl.appendChild(div);
  scrollBottom();
}

/**
 * Typewriter-print a single line, one character at a time.
 * Returns a promise that resolves when complete.
 * @param {string} text
 * @param {string} cssClass
 * @param {number} speed  — ms per character (default 28ms)
 */
export function typewrite(text, cssClass = '', speed = 28) {
  return new Promise(resolve => {
    const div = makeLine('', cssClass);
    terminalEl.appendChild(div);
    scrollBottom();

    let i = 0;
    function tick() {
      if (i < text.length) {
        div.textContent += text[i];
        i++;
        scrollBottom();
        setTimeout(tick, speed);
      } else {
        resolve();
      }
    }
    tick();
  });
}

/**
 * Typewriter-print multiple lines sequentially with a line delay between each.
 * @param {string[]} lines
 * @param {string} cssClass
 * @param {number} charSpeed   — ms per character
 * @param {number} lineDelay   — ms between lines
 */
export async function typewriteLines(lines, cssClass = '', charSpeed = 28, lineDelay = 80) {
  for (const line of lines) {
    await typewrite(line, cssClass, charSpeed);
    await wait(lineDelay);
  }
}

/**
 * Print ASCII art line by line (fast, no per-char delay).
 * @param {string} art        — multiline string
 * @param {string} cssClass
 * @param {number} lineDelay  — ms between lines (default 30ms)
 */
export function printArt(art, cssClass = 'line-art', lineDelay = 30) {
  const lines = art.split('\n');
  return new Promise(resolve => {
    let i = 0;
    function nextLine() {
      if (i < lines.length) {
        print(lines[i], cssClass);
        i++;
        setTimeout(nextLine, lineDelay);
      } else {
        resolve();
      }
    }
    nextLine();
  });
}

/**
 * Clear all terminal output.
 */
export function clearScreen() {
  terminalEl.innerHTML = '';
}

/**
 * Show the input row and focus it. Returns a promise that resolves
 * with the trimmed string the player submitted (on Enter).
 * @param {string} placeholder
 */
export function awaitInput(placeholder = '') {
  inputEl.value = '';
  inputEl.placeholder = placeholder;
  inputRow.classList.remove('hidden');
  inputEl.focus();

  return new Promise(resolve => {
    function onKey(e) {
      if (e.key === 'Enter') {
        const val = inputEl.value.trim();
        inputEl.removeEventListener('keydown', onKey);
        hideInput();
        // Echo the player's input to the terminal
        print(`> ${val}`, 'line-bright');
        resolve(val);
      }
    }
    inputEl.addEventListener('keydown', onKey);
  });
}

/**
 * Hide the input row.
 */
export function hideInput() {
  inputRow.classList.add('hidden');
  inputEl.value = '';
}

/**
 * Simple wait.
 * @param {number} ms
 */
export function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Print a horizontal divider.
 */
export function divider(char = '─', len = 60) {
  print(char.repeat(len), 'divider');
}
