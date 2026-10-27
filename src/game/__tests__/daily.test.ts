import { describe, expect, it } from 'vitest';
import { dailyFor, dateKey, dayNumber, bestChain, DAILY_LINKS, streak, lastDays } from '../daily';
import { gameReducer, initialState, type GameAction } from '../engine';
import { evaluate } from '../evaluator';

describe('daily challenge', () => {
  it('is the same for everyone on a day and changes between days', () => {
    const a = dailyFor('2026-11-03');
    expect(dailyFor('2026-11-03')).toEqual(a);
    expect(a.start).not.toBe(a.target);
    const others = ['2026-11-04', '2026-11-05', '2026-11-06'].map(k => dailyFor(k));
    expect(others.some(o => o.start !== a.start || o.target !== a.target)).toBe(true);
  });

  it('numbers days from the first challenge', () => {
    expect(dayNumber('2026-10-27')).toBe(1);
    expect(dayNumber('2026-11-03')).toBe(8);
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('finds a best chain that really scores its best', () => {
    const d = dailyFor('2026-11-03');
    expect(d.bestPath).toHaveLength(DAILY_LINKS + 1);
    expect(d.bestPath[0]).toBe(d.start);
    expect(d.bestPath.at(-1)).toBe(d.target);
    expect(new Set(d.bestPath).size).toBe(d.bestPath.length);
    const sum = d.bestPath.slice(1).reduce((s, b, i) => s + evaluate(d.bestPath[i], b).sc, 0);
    expect(sum).toBe(d.best);
    expect(bestChain(d.start, d.target, 1).best).toBe(evaluate(d.start, d.target).sc);
  });

  it('starts on the start word, has no clock, and must land on the target', () => {
    const d = dailyFor('2026-11-03');
    const free = [...Array(25).keys()].filter(i => i !== d.start && i !== d.target);
    let s = gameReducer(initialState(), { type: 'startDaily', daily: d });
    expect(s.path).toEqual([d.start]);
    s = gameReducer(s, { type: 'tick' });
    expect(s.timeLeft).toBe(initialState().timeLeft);
    s = free.slice(0, DAILY_LINKS - 1).reduce((st, card) => gameReducer(st, { type: 'pick', card } as GameAction), s);
    expect(s.directConns).toHaveLength(DAILY_LINKS - 1);
    const blocked = gameReducer(s, { type: 'pick', card: free[DAILY_LINKS] });
    expect(blocked.directConns).toHaveLength(DAILY_LINKS - 1);
    expect(blocked.dupId).toBe(s.dupId + 1);
    const done = gameReducer(s, { type: 'pick', card: d.target });
    expect(done.screen).toBe('results');
    expect(done.chainConns).toHaveLength(0);
  });
});

describe('streak and journal days', () => {
  it('counts consecutive days ending today or yesterday', () => {
    expect(streak([], '2026-11-03')).toBe(0);
    expect(streak(['2026-11-03'], '2026-11-03')).toBe(1);
    expect(streak(['2026-11-01', '2026-11-02'], '2026-11-03')).toBe(2);
    expect(streak(['2026-10-31', '2026-11-02', '2026-11-03'], '2026-11-03')).toBe(2);
    expect(streak(['2026-10-30', '2026-10-31'], '2026-11-03')).toBe(0);
  });

  it('lists the last days across month ends', () => {
    expect(lastDays(3, '2026-11-01')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01']);
  });
});
