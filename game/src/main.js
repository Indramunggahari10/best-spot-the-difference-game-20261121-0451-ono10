// main.js — boots Lantern Harbor: grabs the page's elements and hands
// them to the game controller, which wires up scenes, input, sound and UI.

import { createGame } from './game.js';

const els = {
  leftCanvas: document.getElementById('panel-left'),
  rightCanvas: document.getElementById('panel-right'),
  lensCanvas: document.getElementById('lens'),
  counter: document.getElementById('counter'),
  streak: document.getElementById('streak'),
  timer: document.getElementById('timer'),
  score: document.getElementById('score'),
  hintBtn: document.getElementById('hint-btn'),
  hintsLeft: document.getElementById('hints-left'),
  muteBtn: document.getElementById('mute-btn'),
  overlay: document.getElementById('overlay'),
  overlayCard: document.getElementById('overlay-card'),
  misses: document.getElementById('misses'),
  levelName: document.getElementById('level-name'),
  restartBtn: document.getElementById('restart-btn'),
  levelsBtn: document.getElementById('levels-btn'),
};

createGame(els);
