import type { Level } from '@/game/gameItems';

/** Synthesised sound effects (Web Audio, no assets) and haptic feedback. */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, gain = 0.08, type: OscillatorType = 'sine') {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// Pentatonic arpeggios — deeper levels climb higher and ring longer.
const LEVEL_NOTES: Record<Level, number[]> = {
  p: [523.25],
  r: [523.25, 659.25],
  d: [523.25, 659.25, 783.99],
  s: [523.25, 659.25, 783.99, 1046.5],
};

export const sounds = {
  select: () => tone(440, 0, 0.08, 0.04, 'triangle'),
  connect: (lv: Level) => LEVEL_NOTES[lv].forEach((f, i) => tone(f, i * 0.07, 0.35 + i * 0.05)),
  chain: () => [783.99, 987.77].forEach((f, i) => tone(f, 0.25 + i * 0.06, 0.25, 0.05, 'triangle')),
  error: () => tone(160, 0, 0.18, 0.06, 'square'),
  tick: () => tone(880, 0, 0.05, 0.03, 'square'),
  finish: () => [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.09, 0.5)),
};

export function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Unsupported — ignore.
  }
}
