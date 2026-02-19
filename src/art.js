/**
 * art.js — ASCII art constants for LadyBlack
 * Each export is a multiline string.
 * Rendered via terminal.printArt()
 */

export const LADY_BLACK = `
          .  *  .  *  .  *  .
       *    .    *    .    *
     .   *   .       .   *   .
          ,---.         ,---.
       *  |   |         |   |  *
     .    |   |         |   |    .
       *  '---'    .    '---'  *
           \\  \\   ( )   /  /
        .   \\  '--===--'  /   .
          *  '--._____,--'  *
          .   |  _   _  |   .
       *      | (_) (_) |      *
          .   |    ^    |   .
           *  |  \\_|_/  |  *
              |   ---   |
          .   '--_____--'   .
       *      /           \\      *
          .  /  |       |  \\  .
            / .-'-.   .-'-. \\
           /  |   |   |   |  \\
          |   |   |   |   |   |
          |___|___|   |___|___|
              | . |   | . |
              |___|   |___|
           *        *        *
         .    .   *   .   .    .`;

export const LADY_BLACK_FULL = `
         *         *         *
      .     .   .     .   .     .
   *     *    *    *    *    *     *
  .   *     .   .     .   .     *   .
         ___________
        /           \\
       /  .       .  \\          *
      /  ( )     ( )  \\
     |    \\ \\___/ /    |
     |     |     |     |     .
      \\    |  _  |    /
       \\   '--^--'   /    *
        '-----------'
             | |
        .   /   \\   .
        *  | | | |  *
    .      | | | |      .
      *   /  | |  \\   *
   .      |  | |  |      .
      *   |__|_|__|   *
          \\  | |  /
        *  \\ | | /  *
     .      \\| |/      .
            /| |\\
           / | | \\
       *  /  | |  \\  *
          |  | |  |
          |__|_|__|
             | |
          *  | |  *
      .      | |      .
          *     *`;

export const MANOR_DOOR = `
   +---------------------------+
   |   .---.         .---.    |
   |  /     \\       /     \\   |
   | |  ( )  |     |  ( )  |  |
   |  \\     /       \\     /   |
   |   '---'    +    '---'    |
   |         /     \\          |
   |        /  [*]  \\         |
   |       /         \\        |
   |------'           '-------|
   |   []               []   |
   |   []               []   |
   |   []               []   |
   |   []     .   .     []   |
   |   []    ( ) ( )    []   |
   |   []     '-.-'     []   |
   |___[]_______|_______[]___|
   |||                     |||
   +---------------------------+`;

export const CLOCK_MIDNIGHT = `
         .  *  .  *  .
      *                  *
   .      .--======--.      .
      *  /  XII  XII  \\  *
   .    |  XI     .I  I |    .
      * |  X   /  II  | *
   .    |  IX  \\  III | .
      * |  VIII   IV  | *
   .    |   VII  V   |   .
      *  \\    VI     /  *
   .      '--======--'      .
      *  BONG * BONG * BONG *
   .  *  BONG * BONG * BONG  *  .
      *  BONG * BONG * BONG *
   .  *   BONG * BONG * BONG  *  .
      *  BONG * BONG * BONG *`;

export const GAME_FRAME_TOP = `╔══════════════════════════════════════════════════════════╗`;
export const GAME_FRAME_BOT = `╚══════════════════════════════════════════════════════════╝`;

export const WIN_BANNER = `
    *    .    *    .    *    .    *    .    *
  .                                         .
      *   SHE SMILES... AND FADES AWAY   *
  .                                         .
    *    .    *    .    *    .    *    .    *`;

export const LOSE_BANNER = `
  . * . * . * . * . * . * . * . * . * . * .
  *                                         *
  .   HER LAUGHTER ECHOES AS DAWN RISES    .
  *                                         *
  . * . * . * . * . * . * . * . * . * . * .`;

export const BOOT_LINES = [
  'BLACKMANOR OS v1.0  —  Copyright 1983 Black Manor Systems',
  'Memory check: 64K RAM ...... OK',
  'Loading GOTHICA.SYS ........ OK',
  'Loading SPIRIT.DRV ......... OK',
  'Loading RIDDLE.EXE ......... OK',
  'Checking temporal index .... MIDNIGHT',
  '',
  'WARNING: Paranormal activity detected on all channels.',
  'WARNING: Do not attempt to flee.',
  '',
];
