import { describe, expect, it } from 'vitest';
import { evaluate, pairKey, SECRET_KEYS, isHandCraftedSecret, suggestConnectionTypes } from '../evaluator';
import { ITEMS, SCORE_VALUES, LEVEL_ORDER } from '../gameItems';

const allPairs: [number, number][] = [];
for (let a = 0; a < ITEMS.length; a++) for (let b = a + 1; b < ITEMS.length; b++) allPairs.push([a, b]);

describe('evaluate', () => {
  it('returns a well-formed evaluation for every pair', () => {
    for (const [a, b] of allPairs) {
      const ev = evaluate(a, b);
      expect(LEVEL_ORDER).toContain(ev.lv);
      expect(ev.sc).toBe(SCORE_VALUES[ev.lv]);
      expect(ev.sub.length).toBeGreaterThan(0);
      expect(ev.exp.length).toBeGreaterThan(0);
      expect(ev.exp).not.toMatch(/undefined/);
    }
  });

  it('scores symmetrically (wording follows pick order)', () => {
    for (const [a, b] of allPairs) {
      const [x, y] = [evaluate(a, b), evaluate(b, a)];
      expect({ lv: y.lv, sc: y.sc, sub: y.sub }).toEqual({ lv: x.lv, sc: x.sc, sub: x.sub });
    }
  });

  it('never leaks internal English keys to the player', () => {
    for (const [a, b] of allPairs) expect(evaluate(a, b).sub).not.toMatch(/— [a-z_]+$/i);
  });

  it('uses hand-crafted secrets', () => {
    // Sprout + lightning: the Miller–Urey secret.
    const ev = evaluate(0, 10);
    expect(ev.lv).toBe('s');
    expect(ev.exp).toContain('מילר');
  });
});

describe('secrets', () => {
  it('pairKey is order independent', () => {
    expect(pairKey(7, 3)).toBe(pairKey(3, 7));
  });

  it('exposes unique sod secret keys', () => {
    expect(SECRET_KEYS.length).toBeGreaterThan(20);
    expect(new Set(SECRET_KEYS).size).toBe(SECRET_KEYS.length);
    for (const k of SECRET_KEYS) {
      const [a, b] = k.split(',').map(Number);
      expect(isHandCraftedSecret(a, b)).toBe(true);
    }
  });

  it('does not count generic fallbacks as collectable secrets', () => {
    const generic = allPairs.find(([a, b]) => evaluate(a, b).lv === 's' && !SECRET_KEYS.includes(pairKey(a, b)));
    if (generic) expect(isHandCraftedSecret(...generic)).toBe(false);
  });
});

describe('suggestConnectionTypes', () => {
  it('always returns 1–3 suggestions', () => {
    for (const [a, b] of allPairs) {
      const s = suggestConnectionTypes(a, b);
      expect(s.length).toBeGreaterThanOrEqual(1);
      expect(s.length).toBeLessThanOrEqual(3);
    }
  });
});
