// ui.js — the HUD and the overlay screens (title, level select,
// level complete, victory). The overlay is one card whose content this
// module rebuilds for each screen; the game logic decides when to show it.

import { SCENES } from './scenes.js';

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function createUi(els, callbacks) {
  const { counter, streak, timer, score, hintBtn, hintsLeft, muteBtn,
    overlay, overlayCard, misses, levelName, restartBtn, levelsBtn } = els;

  function bestScore(sceneId) {
    try {
      return Number(window.localStorage.getItem(`lantern-harbor-best-${sceneId}`) || 0);
    } catch (e) { return 0; }
  }
  function saveBest(sceneId, value) {
    try {
      const prev = bestScore(sceneId);
      if (value > prev) window.localStorage.setItem(`lantern-harbor-best-${sceneId}`, String(value));
    } catch (e) { /* storage unavailable: best scores just don't persist */ }
  }

  function showOverlay(html) {
    overlayCard.innerHTML = html;
    overlay.classList.add('show');
  }
  function hideOverlay() {
    overlay.classList.remove('show');
  }

  function updateHud(state) {
    const total = state.scene.diffs.length;
    const found = state.found.size;
    const remain = total - found;
    counter.textContent = remain === 0
      ? `All ${total} found — level clear!`
      : `Found ${found} of ${total} — ${remain} to go`;
    counter.parentElement.classList.remove('flash-good');
    void counter.parentElement.offsetWidth; // restart the pop animation
    if (found > 0) counter.parentElement.classList.add('flash-good');
    streak.textContent = state.streak >= 2 ? `🔥 Streak ${state.streak}` : 'Streak 0';
    timer.textContent = fmtTime(state.elapsed);
    score.textContent = `Score ${state.score}`;
    hintsLeft.textContent = String(state.hints);
    hintBtn.disabled = state.hints <= 0 || state.phase !== 'playing';
    misses.textContent = `Misses ${state.missCount}`;
    levelName.textContent = state.scene.name;
    muteBtn.textContent = state.muted ? '🔇' : '🔊';
  }

  function showTitle() {
    const cards = SCENES.map((scene, i) => `
      <button type="button" class="level-card" data-level="${i}">
        <h3>${i + 1}. ${scene.name}</h3>
        <p>${scene.diffs.length} differences</p>
        <p>${scene.tagline}</p>
        <p class="best">Best: ${bestScore(scene.id)}</p>
      </button>`).join('');
    showOverlay(`
      <h1>🏮 Lantern Harbor</h1>
      <h2>Spot the Difference</h2>
      <p>Two pictures of the same harbor scene hang side by side — but the
      right one hides a handful of changes. Click every difference you can
      find. Wrong clicks cost points; hints cost points too.</p>
      <p class="big">Three scenes · 29 differences · how sharp are your eyes?</p>
      <div class="level-grid">${cards}</div>
      <p>Mouse to click · <b>H</b> hint · hold <b>Shift</b> for the magnifier · <b>M</b> sound</p>
      <div class="row">
        <button type="button" data-action="play">▶ Play Harbor Dawn</button>
      </div>`);
    overlayCard.querySelector('[data-action="play"]').addEventListener('click', () => callbacks.play(0));
    overlayCard.querySelectorAll('.level-card').forEach((card) => {
      card.addEventListener('click', () => callbacks.play(Number(card.dataset.level)));
    });
  }

  function showLevelComplete(state) {
    const total = state.scene.diffs.length;
    const accuracy = state.clicks === 0 ? 100 : Math.round((state.found.size / state.clicks) * 100);
    const isLast = state.levelIndex === SCENES.length - 1;
    saveBest(state.scene.id, state.score);
    showOverlay(`
      <h1>🎉 ${state.scene.name} — Clear!</h1>
      <p class="big">You found all ${total} differences in ${fmtTime(state.elapsed)}.</p>
      <p>Score this level: <b>${state.score}</b> · Time bonus: <b>+${state.timeBonus}</b><br>
      Accuracy: <b>${accuracy}%</b> · Misses: <b>${state.missCount}</b> · Hints used: <b>${state.hintsUsed}</b></p>
      <p>Best score on this scene: <b>${bestScore(state.scene.id)}</b></p>
      <div class="row">
        ${isLast
          ? '<button type="button" data-action="victory">See your festival score 🏆</button>'
          : '<button type="button" data-action="next">Next scene ▶</button>'}
        <button type="button" class="ghost" data-action="replay">↺ Play again</button>
        <button type="button" class="ghost" data-action="levels">▦ Levels</button>
      </div>
      <p>Press <b>N</b> for the next scene, <b>R</b> to replay.</p>`);
    const next = overlayCard.querySelector('[data-action="next"]');
    if (next) next.addEventListener('click', () => callbacks.next());
    const victory = overlayCard.querySelector('[data-action="victory"]');
    if (victory) victory.addEventListener('click', () => callbacks.victory());
    overlayCard.querySelector('[data-action="replay"]').addEventListener('click', () => callbacks.replay());
    overlayCard.querySelector('[data-action="levels"]').addEventListener('click', () => callbacks.levels());
  }

  function showVictory(totalScore, perLevel) {
    showOverlay(`
      <h1>🏆 Festival Complete!</h1>
      <p class="big">All 29 differences found across three scenes.</p>
      <p>${perLevel.map((p) => `${p.name}: <b>${p.score}</b>`).join(' · ')}</p>
      <p class="big">Total score: ${totalScore}</p>
      <p>Every lantern is lit, every gull accounted for. The harbor thanks you, sharp-eyes.</p>
      <div class="row">
        <button type="button" data-action="again">↺ Play again from Harbor Dawn</button>
        <button type="button" class="ghost" data-action="levels">▦ Pick a scene</button>
      </div>`);
    overlayCard.querySelector('[data-action="again"]').addEventListener('click', () => callbacks.play(0));
    overlayCard.querySelector('[data-action="levels"]').addEventListener('click', () => callbacks.levels());
  }

  function showToast(text) {
    // A found-difference callout rides on the counter for a moment.
    const old = counter.textContent;
    counter.textContent = text;
    window.setTimeout(() => { counter.textContent = old; }, 1400);
  }

  restartBtn.addEventListener('click', () => callbacks.replay());
  levelsBtn.addEventListener('click', () => callbacks.levels());
  hintBtn.addEventListener('click', () => callbacks.hint());
  muteBtn.addEventListener('click', () => callbacks.toggleMute());

  return { updateHud, showTitle, showLevelComplete, showVictory, showToast, hideOverlay, saveBest };
}
