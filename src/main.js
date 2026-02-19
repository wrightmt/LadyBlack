/**
 * main.js — Entry point. Bootstraps the game on DOMContentLoaded.
 */

import { startGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  startGame().catch(err => {
    console.error('LadyBlack fatal error:', err);
    const terminal = document.getElementById('terminal');
    if (terminal) {
      terminal.innerHTML = `<div class="line-error">FATAL: ${err.message}</div>`;
    }
  });
});
