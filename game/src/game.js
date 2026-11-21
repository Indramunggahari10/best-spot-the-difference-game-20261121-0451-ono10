// game.js — the Lantern Harbor game controller: state, scoring, timer,
// hints, level flow, and the animation loop. It wires the scene painters,
// the renderer, the input handlers, the sounds and the HUD together.

import { SCENES } from './scenes.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import { createUi } from './ui.js';
import * as audio from './audio.js';

const FIND_POINTS = 100;
const MISS_POINTS = 10;
const HINT_COST = 50;

export function createGame(els) {
  const renderer = createRenderer(els.leftCanvas, els.rightCanvas, els.lensCanvas);

  const state = {
    phase: 'title', // title | playing | complete | victory
    levelIndex: 0,
    scene: SCENES[0],
    found: new Set(),
    misses: [],
    hintDiff: null,
    hintStartedAt: 0,
    hints: 3,
    hintsUsed: 0,
    score: 0,
    timeBonus: 0,
    streak: 0,
    missCount: 0,
    clicks: 0,
    elapsed: 0,
    startedAt: 0,
    lastFound: null,
    lastFoundAt: 0,
    muted: false,
    totals: [], // { name, score } per finished level
  };

  const ui = createUi(els, {
    play: (i) => startLevel(i),
    next: () => nextLevel(),
    replay: () => startLevel(state.levelIndex),
    levels: () => showTitle(),
    hint: () => useHint(),
    toggleMute: () => toggleMute(),
    victory: () => showVictory(),
  });

  createInput(els, renderer, {
    clickAt: (side, x, y) => clickAt(side, x, y),
    hint: () => useHint(),
    replay: () => startLevel(state.levelIndex),
    next: () => nextLevel(),
    toggleMute: () => toggleMute(),
    levels: () => showTitle(),
    play: (i) => startLevel(i),
  });

  function startLevel(index) {
    state.levelIndex = index;
    state.scene = SCENES[index];
    state.phase = 'playing';
    state.found = new Set();
    state.misses = [];
    state.hintDiff = null;
    state.hints = 3;
    state.hintsUsed = 0;
    state.score = 0;
    state.timeBonus = 0;
    state.streak = 0;
    state.missCount = 0;
    state.clicks = 0;
    state.elapsed = 0;
    state.startedAt = performance.now();
    state.lastFound = null;
    ui.hideOverlay();
    ui.updateHud(state);
    audio.playClick();
  }

  function showTitle() {
    state.phase = 'title';
    ui.showTitle();
  }

  function nextLevel() {
    if (state.phase === 'complete' && state.levelIndex < SCENES.length - 1) {
      startLevel(state.levelIndex + 1);
    } else if (state.phase === 'complete') {
      showVictory();
    }
  }

  function showVictory() {
    state.phase = 'victory';
    const total = state.totals.reduce((sum, t) => sum + t.score, 0);
    ui.showVictory(total, state.totals);
    audio.playWin();
  }

  function toggleMute() {
    state.muted = audio.setMuted(!state.muted);
    ui.updateHud(state);
  }

  function clickAt(side, x, y) {
    if (state.phase !== 'playing') return;
    state.clicks += 1;
    // A click on an already-found difference is a gentle reminder, not a miss.
    for (const diff of state.scene.diffs) {
      if (!state.found.has(diff.id)) continue;
      const d = Math.hypot(x - diff.x, y - diff.y);
      if (d <= diff.r + 6) {
        ui.showToast(`Already found — ${diff.label}!`);
        audio.playClick();
        return;
      }
    }
    for (const diff of state.scene.diffs) {
      if (state.found.has(diff.id)) continue;
      const d = Math.hypot(x - diff.x, y - diff.y);
      if (d <= diff.r) {
        state.found.add(diff.id);
        state.streak += 1;
        state.score += FIND_POINTS + (state.streak - 1) * 10;
        state.lastFound = diff.id;
        state.lastFoundAt = performance.now();
        state.hintDiff = null;
        audio.playFind();
        ui.showToast(`Found it — ${diff.label}! +${FIND_POINTS + (state.streak - 1) * 10}`);
        ui.updateHud(state);
        if (state.found.size === state.scene.diffs.length) completeLevel();
        return;
      }
    }
    // A miss: red X, lost streak, lost points (never below zero).
    state.streak = 0;
    state.missCount += 1;
    state.score = Math.max(0, state.score - MISS_POINTS);
    state.misses.push({ x, y, side, at: performance.now() });
    if (state.misses.length > 6) state.misses.shift();
    audio.playMiss();
    ui.updateHud(state);
  }

  function useHint() {
    if (state.phase !== 'playing' || state.hints <= 0) return;
    const unfound = state.scene.diffs.filter((d) => !state.found.has(d.id));
    if (unfound.length === 0) return;
    // Deterministic pick: the first unfound difference in scene order, so a
    // hint always helps and never feels random.
    state.hintDiff = unfound[0];
    state.hintStartedAt = performance.now();
    state.hints -= 1;
    state.hintsUsed += 1;
    state.score = Math.max(0, state.score - HINT_COST);
    audio.playHint();
    ui.showToast(`Hint: look near the ${state.hintDiff.label}… (−${HINT_COST})`);
    ui.updateHud(state);
  }

  function completeLevel() {
    state.phase = 'complete';
    state.timeBonus = Math.max(0, 300 - Math.floor(state.elapsed)) * 2;
    state.score += state.timeBonus;
    state.totals[state.levelIndex] = { name: state.scene.name, score: state.score };
    audio.playWin();
    ui.updateHud(state);
    ui.showLevelComplete(state);
  }

  // Shot mode: a URL helper for screenshots and play-testing.
  // ?level=2&found=4 starts level 2 with its first 4 differences marked
  // found; ?level=1&complete=1 shows the level-clear screen. Normal play
  // (no query) always opens on the title screen.
  function applyShotMode() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('level') && !params.has('complete')) return false;
    const level = Math.min(SCENES.length - 1, Math.max(0, Number(params.get('level') || 1) - 1));
    startLevel(level);
    const foundCount = Number(params.get('found') || 0);
    const diffs = state.scene.diffs;
    for (let i = 0; i < Math.min(foundCount, diffs.length); i++) state.found.add(diffs[i].id);
    state.score = state.found.size * FIND_POINTS;
    state.elapsed = 83; // fixed clock so screenshots are stable
    state.startedAt = performance.now() - 83000;
    if (params.get('complete') === '1') {
      for (const d of diffs) state.found.add(d.id);
      state.score = diffs.length * FIND_POINTS;
      completeLevel();
    } else {
      ui.updateHud(state);
    }
    return true;
  }

  // Animation loop: repaint both panels every frame so the water shimmers,
  // boats bob, hint pulses breathe and miss marks fade.
  let lastTick = performance.now();
  function frame(now) {
    const t = now / 1000;
    if (state.phase === 'playing') {
      state.elapsed = (now - state.startedAt) / 1000;
      if (Math.floor(state.elapsed) !== Math.floor((lastTick - state.startedAt) / 1000)) ui.updateHud(state);
    }
    renderer.draw(state, t);
    lastTick = now;
    requestAnimationFrame(frame);
  }

  const inShotMode = applyShotMode();
  if (!inShotMode) showTitle();
  ui.updateHud(state);
  requestAnimationFrame(frame);

  return { state, startLevel };
}
