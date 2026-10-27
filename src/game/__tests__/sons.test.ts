import { describe, expect, it } from 'vitest';
import { sonResults, sonReached } from '../sons';

describe('the four sons', () => {
  const r = sonResults();
  it('rank in Haggadah order, chacham first', () => {
    const bests = r.map(s => s.best);
    expect([...bests].sort((a, b) => b - a)).toEqual(bests);
    expect(new Set(bests).size).toBe(4);
  });
  it('each stays within the levels he can see and his pace', () => {
    for (const s of r) {
      expect(s.levels.length).toBeLessThanOrEqual(s.links);
      expect(s.levels.every(l => s.sees.includes(l))).toBe(true);
    }
    expect(r[0].levels).toContain('s');
  });
  it('places a score between sons', () => {
    expect(sonReached(r[0].best)?.name).toBe('חכם');
    expect(sonReached(r[3].best - 1)).toBeNull();
    expect(sonReached(r[2].best)?.name).toBe('תם');
  });
});
