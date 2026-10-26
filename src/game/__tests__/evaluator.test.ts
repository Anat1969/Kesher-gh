import { describe, expect, it } from 'vitest';
import { evaluate, pairKey, SECRET_KEYS, isHandCraftedSecret, suggestConnectionTypes, readingsFor } from '../evaluator';
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

describe('reading engine', () => {
  it('gives every pair its own explanation', () => {
    const exps = new Set(allPairs.map(([a, b]) => evaluate(a, b).exp));
    expect(exps.size).toBe(allPairs.length);
  });

  it('awards sod only for a documented secret or a shared paradox', () => {
    for (const [a, b] of allPairs) {
      const r = readingsFor(a, b)[0];
      if (r.lv === 's') expect(['hc', 'par']).toContain(r.key);
    }
  });

  it('explains why each reading earns its level, and lists deepest first', () => {
    const rank = { p: 0, r: 1, d: 2, s: 3 } as const;
    for (const [a, b] of allPairs) {
      const rs = readingsFor(a, b);
      expect(rs.length).toBeGreaterThan(0);
      rs.forEach(r => expect(r.why.length).toBeGreaterThan(10));
      for (let i = 1; i < rs.length; i++) expect(rank[rs[i - 1].lv]).toBeGreaterThanOrEqual(rank[rs[i].lv]);
      expect(new Set(rs.map(r => r.key)).size).toBe(rs.length);
    }
  });

  it('puts the picked card first in the wording', () => {
    const [x] = readingsFor(8, 24).filter(r => r.key === 't:power');
    const [y] = readingsFor(24, 8).filter(r => r.key === 't:power');
    expect(x.lines?.[0].w).toBe(ITEMS[8].l);
    expect(y.lines?.[0].w).toBe(ITEMS[24].l);
  });
});
