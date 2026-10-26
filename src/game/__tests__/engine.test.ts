import { describe, expect, it } from 'vitest';
import { gameReducer, initialState, GAME_DURATION, TOTAL_CARDS, totalScore, type GameAction, type GameState } from '../engine';
import { evaluate } from '../evaluator';
import { CHAIN_RATIO } from '../gameItems';

const run = (actions: GameAction[], from: GameState = initialState()) => actions.reduce(gameReducer, from);
const picks = (...cards: number[]): GameAction[] => cards.map(card => ({ type: 'pick', card }));

describe('gameReducer', () => {
  it('starts a fresh game', () => {
    const s = run([{ type: 'start' }]);
    expect(s.screen).toBe('game');
    expect(s.timeLeft).toBe(GAME_DURATION);
    expect(s.currentCard).toBe(-1);
  });

  it('ignores picks outside of an active game', () => {
    expect(run(picks(1))).toEqual(initialState());
  });

  it('first pick selects without scoring', () => {
    const s = run([{ type: 'start' }, ...picks(3)]);
    expect(s.currentCard).toBe(3);
    expect(s.path).toEqual([3]);
    expect(s.score).toBe(0);
    expect(s.lastEval).toBeNull();
  });

  it('second pick scores the connection', () => {
    const s = run([{ type: 'start' }, ...picks(0, 10)]);
    const ev = evaluate(0, 10);
    expect(s.score).toBe(ev.sc);
    expect(s.directConns).toHaveLength(1);
    expect(s.lastEval).toMatchObject({ a: 0, b: 10, id: 1 });
    expect(s.currentCard).toBe(10);
  });

  it('flags picking a card already in the chain without changing score', () => {
    const before = run([{ type: 'start' }, ...picks(0, 1, 2)]);
    const after = gameReducer(before, { type: 'pick', card: 0 });
    expect(after.dupCard).toBe(0);
    expect(after.dupId).toBe(before.dupId + 1);
    expect(after.score).toBe(before.score);
    expect(after.path).toEqual(before.path);
  });

  it('ignores re-picking the current card', () => {
    const before = run([{ type: 'start' }, ...picks(0, 1)]);
    expect(gameReducer(before, { type: 'pick', card: 1 })).toBe(before);
  });

  it('discovers chain connections with a bonus', () => {
    // 0–1 then 1–2: the a–b–n triangle reveals the hidden 0–2 link.
    const s = run([{ type: 'start' }, ...picks(0, 1, 2)]);
    expect(s.chainConns).toHaveLength(1);
    const chain = s.chainConns[0];
    expect([chain.a, chain.b].sort()).toEqual([0, 2]);
    expect(chain.bridge).toBe(1);
    expect(chain.bonus).toBe(Math.ceil(evaluate(0, 2).sc * CHAIN_RATIO));
    expect(s.chainScore).toBe(chain.bonus);
    expect(totalScore(s)).toBe(s.score + s.chainScore);
  });

  it('never double counts a pair', () => {
    const order = Array.from({ length: TOTAL_CARDS }, (_, i) => i);
    const s = run([{ type: 'start' }, ...picks(...order)]);
    expect(new Set(s.pairs).size).toBe(s.pairs.length);
  });

  it('ends the game once every card is chained', () => {
    const order = Array.from({ length: TOTAL_CARDS }, (_, i) => TOTAL_CARDS - 1 - i);
    const s = run([{ type: 'start' }, ...picks(...order)]);
    expect(s.screen).toBe('results');
    expect(s.directConns).toHaveLength(TOTAL_CARDS - 1);
  });

  it('counts down and ends when time runs out', () => {
    let s = run([{ type: 'start' }]);
    s = run(Array(GAME_DURATION - 1).fill({ type: 'tick' }), s);
    expect(s.timeLeft).toBe(1);
    expect(s.screen).toBe('game');
    s = gameReducer(s, { type: 'tick' });
    expect(s.timeLeft).toBe(0);
    expect(s.screen).toBe('results');
  });

  it('freezes time and input while paused', () => {
    const s = run([{ type: 'start' }, ...picks(0), { type: 'pause' }, { type: 'tick' }, ...picks(5)]);
    expect(s.timeLeft).toBe(GAME_DURATION);
    expect(s.path).toEqual([0]);
    const resumed = run([{ type: 'resume' }, { type: 'tick' }, ...picks(5)], s);
    expect(resumed.timeLeft).toBe(GAME_DURATION - 1);
    expect(resumed.path).toEqual([0, 5]);
  });

  it('can finish early and return to menu', () => {
    const s = run([{ type: 'start' }, ...picks(0, 1), { type: 'finish' }]);
    expect(s.screen).toBe('results');
    expect(run([{ type: 'menu' }], s)).toEqual(initialState());
  });
});

describe('annotate', () => {
  it('records what the player meant without changing the score', () => {
    let s = gameReducer(initialState(), { type: 'start' });
    s = gameReducer(s, { type: 'pick', card: 8 });
    s = gameReducer(s, { type: 'pick', card: 24 });
    const score = s.score;
    s = gameReducer(s, { type: 'annotate', index: 0, meant: 't:gold', meantLv: 'p', note: 'שניהם זהובים' });
    expect(s.directConns[0]).toMatchObject({ meant: 't:gold', meantLv: 'p', note: 'שניהם זהובים' });
    expect(s.score).toBe(score);
    expect(gameReducer(s, { type: 'annotate', index: 5, note: 'x' })).toBe(s);
  });
});
