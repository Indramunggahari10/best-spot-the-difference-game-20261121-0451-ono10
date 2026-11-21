// audio.js — all sounds are synthesized live with the Web Audio API.
// No audio files are loaded, so the game stays fully offline.

let audioCtx = null;
let muted = false;

export function isMuted() { return muted; }

export function setMuted(value) {
  muted = value;
  return muted;
}

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(freq, startAt, duration, type, volume, slideTo) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, ac.currentTime + startAt);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + startAt + duration);
  gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(volume || 0.18, ac.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + duration + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFind() {
  tone(880, 0, 0.16, 'sine', 0.2);
  tone(1318, 0.09, 0.24, 'sine', 0.18);
  tone(1760, 0.18, 0.2, 'triangle', 0.08);
}

// A low buzz when the player clicks empty water / sky.
export function playMiss() {
  tone(160, 0, 0.18, 'sawtooth', 0.1, 110);
}

// A soft sparkle when a hint is spent.
export function playHint() {
  tone(1568, 0, 0.12, 'sine', 0.12);
  tone(2093, 0.07, 0.16, 'sine', 0.1);
}

// A little fanfare when a level is cleared.
export function playWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => tone(freq, i * 0.11, 0.22, 'triangle', 0.18));
  tone(1319, 0.48, 0.4, 'sine', 0.14);
}

// A quiet tick for button presses.
export function playClick() {
  tone(660, 0, 0.06, 'square', 0.05);
}
