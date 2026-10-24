import { describe, expect, it } from 'vitest';
import { analyzePersonality, type Connection } from '../personality';
import type { Level } from '../gameItems';
import { SCORE_VALUES } from '../gameItems';

const conn = (lv: Level, a = 0, b = 1): Connection => ({ a, b, ev: { lv, sc: SCORE_VALUES[lv], sub: 'x', exp: 'y' } });

describe('analyzePersonality', () => {
  it('identifies a mystic when most links are sod', () => {
    const r = analyzePersonality([conn('s'), conn('s'), conn('p')], []);
    expect(r.type).toBe('הפייטן המיסטי');
  });

  it('identifies a sharp observer when most links are pshat', () => {
    const r = analyzePersonality([conn('p'), conn('p'), conn('p'), conn('r')], []);
    expect(r.type).toBe('המנתח החד-עין');
  });

  it('picks the highest scoring connection as best', () => {
    const best = conn('s', 4, 5);
    const r = analyzePersonality([conn('p'), best, conn('r')], []);
    expect(r.best).toBe(best);
    expect(r.cnt).toEqual({ p: 1, r: 1, d: 0, s: 1 });
  });
});
