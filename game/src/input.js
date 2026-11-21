// input.js — mouse and keyboard input for Lantern Harbor.
// Clicks on either panel are converted to panel coordinates and hit-tested
// against the scene's differences; holding Shift shows the magnifier lens.
// Keyboard: H hint, R restart, N next, M mute, Esc levels, 1/2/3 pick a scene.

import { PANEL_W, PANEL_H } from './scenes.js';

export function createInput(els, renderer, callbacks) {
  const { leftCanvas, rightCanvas } = els;
  let shiftHeld = false;

  function panelPoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * PANEL_W,
      y: ((event.clientY - rect.top) / rect.height) * PANEL_H,
      px: event.clientX - rect.left,
      py: event.clientY - rect.top,
    };
  }

  function onPanelClick(side, event) {
    const canvas = side === 'left' ? leftCanvas : rightCanvas;
    const p = panelPoint(canvas, event);
    callbacks.clickAt(side, p.x, p.y);
  }

  leftCanvas.addEventListener('click', (e) => onPanelClick('left', e));
  rightCanvas.addEventListener('click', (e) => onPanelClick('right', e));

  function onMove(side, event) {
    if (!shiftHeld) return;
    const canvas = side === 'left' ? leftCanvas : rightCanvas;
    const p = panelPoint(canvas, event);
    renderer.drawLens(null, side, p.px, p.py);
  }
  leftCanvas.addEventListener('mousemove', (e) => onMove('left', e));
  rightCanvas.addEventListener('mousemove', (e) => onMove('right', e));
  leftCanvas.addEventListener('mouseleave', () => renderer.hideLens());
  rightCanvas.addEventListener('mouseleave', () => renderer.hideLens());

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
      shiftHeld = true;
      return;
    }
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') callbacks.hint();
    else if (key === 'r') callbacks.replay();
    else if (key === 'n') callbacks.next();
    else if (key === 'm') callbacks.toggleMute();
    else if (key === 'escape') callbacks.levels();
    else if (key === '1' || key === '2' || key === '3') callbacks.play(Number(key) - 1);
  });
  window.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
      shiftHeld = false;
      renderer.hideLens();
    }
  });
  window.addEventListener('blur', () => {
    shiftHeld = false;
    renderer.hideLens();
  });
}
