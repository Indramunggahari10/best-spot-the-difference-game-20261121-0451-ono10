// render.js — paints both panels from a scene, then the play markers.
// The left panel is the scene with no differences; the right panel is the
// same scene with every difference applied. Found differences get a gold
// ring on BOTH panels, a fading red X marks a miss, and a hint pulse rings
// a random unfound difference. The magnifier lens shows a 2x zoom of the
// panel under the cursor while Shift is held.

import { PANEL_W, PANEL_H } from './scenes.js';

const MARKER = '#f6c453';
const MARKER_DARK = '#d94f30';

export function createRenderer(leftCanvas, rightCanvas, lensCanvas) {
  const leftCtx = leftCanvas.getContext('2d');
  const rightCtx = rightCanvas.getContext('2d');
  const lensCtx = lensCanvas.getContext('2d');

  function drawMarker(ctx, diff, pulse) {
    const r = diff.r + (pulse ? Math.sin(pulse * 6) * 2 : 0);
    ctx.strokeStyle = MARKER;
    ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = MARKER_DARK;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, r + 4, 0, Math.PI * 2); ctx.stroke();
    // small tick inside the ring
    ctx.strokeStyle = MARKER_DARK;
    ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(diff.x - 8, diff.y);
    ctx.lineTo(diff.x - 2, diff.y + 6);
    ctx.lineTo(diff.x + 9, diff.y - 6);
    ctx.stroke();
  }

  function drawMiss(ctx, miss) {
    const age = (performance.now() - miss.at) / 700;
    if (age >= 1) return;
    const alpha = 1 - age;
    const s = 10 + age * 4;
    ctx.strokeStyle = `rgba(192, 57, 43, ${alpha})`;
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(miss.x - s, miss.y - s); ctx.lineTo(miss.x + s, miss.y + s);
    ctx.moveTo(miss.x + s, miss.y - s); ctx.lineTo(miss.x - s, miss.y + s);
    ctx.stroke();
  }

  function drawHintPulse(ctx, diff, startedAt) {
    const age = (performance.now() - startedAt) / 2500;
    if (age >= 1) return;
    const pulse = 0.5 + 0.5 * Math.sin(age * Math.PI * 6);
    const r = diff.r + 4 + pulse * 6;
    ctx.strokeStyle = `rgba(246, 196, 83, ${0.45 + 0.55 * pulse})`;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, r + 5, 0, Math.PI * 2); ctx.stroke();
  }

  // Paint one frame. `state` carries the scene, found ids, misses, hint info.
  function draw(state, t) {
    const scene = state.scene;
    const applied = new Set(scene.diffs.map((d) => d.id));
    scene.paint(leftCtx, PANEL_W, PANEL_H, t, new Set());
    scene.paint(rightCtx, PANEL_W, PANEL_H, t, applied);

    for (const diff of scene.diffs) {
      if (!state.found.has(diff.id)) continue;
      const justFound = state.lastFound === diff.id && performance.now() - state.lastFoundAt < 500;
      drawMarker(leftCtx, diff, justFound ? performance.now() / 1000 : 0);
      drawMarker(rightCtx, diff, justFound ? performance.now() / 1000 : 0);
    }
    for (const miss of state.misses) {
      drawMiss(miss.side === 'left' ? leftCtx : rightCtx, miss);
    }
    if (state.hintDiff && state.hintStartedAt) {
      drawHintPulse(leftCtx, state.hintDiff, state.hintStartedAt);
      drawHintPulse(rightCtx, state.hintDiff, state.hintStartedAt);
    }
  }

  // 2x magnifier lens over the panel under the cursor.
  function drawLens(state, panel, px, py) {
    const src = panel === 'left' ? leftCanvas : rightCanvas;
    const rect = src.getBoundingClientRect();
    lensCanvas.style.display = 'block';
    lensCanvas.style.left = `${rect.left + px - 80 + window.scrollX - 7}px`;
    lensCanvas.style.top = `${rect.top + py - 80 + window.scrollY - 7}px`;
    const scale = lensCanvas.width / PANEL_W;
    const sx = (px / rect.width) * PANEL_W;
    const sy = (py / rect.height) * PANEL_H;
    const half = 40; // source half-size: 80px of panel shown at 2x
    lensCtx.fillStyle = '#fff';
    lensCtx.fillRect(0, 0, lensCanvas.width, lensCanvas.height);
    lensCtx.save();
    lensCtx.beginPath(); lensCtx.arc(80, 80, 78, 0, Math.PI * 2); lensCtx.clip();
    lensCtx.drawImage(src, sx - half, sy - half, half * 2, half * 2, 0, 0, 160, 160);
    lensCtx.restore();
    lensCtx.strokeStyle = '#f6c453'; lensCtx.lineWidth = 4;
    lensCtx.beginPath(); lensCtx.arc(80, 80, 78, 0, Math.PI * 2); lensCtx.stroke();
    lensCtx.strokeStyle = 'rgba(43,33,24,0.6)'; lensCtx.lineWidth = 1;
    lensCtx.beginPath(); lensCtx.moveTo(80, 72); lensCtx.lineTo(80, 88); lensCtx.moveTo(72, 80); lensCtx.lineTo(88, 80); lensCtx.stroke();
  }

  function hideLens() {
    lensCanvas.style.display = 'none';
  }

  return { draw, drawLens, hideLens };
}
