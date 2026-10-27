import { ITEMS, CHAIN_RATIO, type Level } from './gameItems';
import { evaluate, pairKey, type Evaluation } from './evaluator';
import type { Connection } from './personality';
import type { DailyConfig } from './daily';

export const GAME_DURATION = 300;
export const TOTAL_CARDS = ITEMS.length;

export type Screen = 'splash' | 'game' | 'results';
export type Mode = 'classic' | 'daily';

export interface LastEval {
  a: number;
  b: number;
  ev: Evaluation;
  /** Monotonic id so the UI can replay animations for each new connection. */
  id: number;
}

export interface GameState {
  screen: Screen;
  mode: Mode;
  /** The day's challenge, when playing the daily mode. */
  daily: DailyConfig | null;
  paused: boolean;
  currentCard: number;
  /** Cards in the order they were added to the chain. */
  path: number[];
  pairs: string[];
  /** Adjacency list of direct connections. */
  adj: Record<number, number[]>;
  directConns: Connection[];
  chainConns: Connection[];
  score: number;
  chainScore: number;
  timeLeft: number;
  lastEval: LastEval | null;
  /** Chain connections discovered by the most recent pick. */
  pendingChains: Connection[];
  /** Card that was just rejected because it is already in the chain. */
  dupCard: number;
  dupId: number;
}

export type GameAction =
  | { type: 'start' }
  | { type: 'startDaily'; daily: DailyConfig }
  | { type: 'pick'; card: number }
  | { type: 'tick' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'finish' }
  | { type: 'menu' }
  /** Record what the player meant by a connection: one of its readings, or their own words. */
  | { type: 'annotate'; index: number; meant?: string; meantLv?: Level; note?: string };

export function initialState(screen: Screen = 'splash'): GameState {
  return {
    screen,
    mode: 'classic',
    daily: null,
    paused: false,
    currentCard: -1,
    path: [],
    pairs: [],
    adj: {},
    directConns: [],
    chainConns: [],
    score: 0,
    chainScore: 0,
    timeLeft: GAME_DURATION,
    lastEval: null,
    pendingChains: [],
    dupCard: -1,
    dupId: 0,
  };
}

function link(adj: Record<number, number[]>, a: number, b: number): Record<number, number[]> {
  const next = { ...adj };
  next[a] = (next[a] ?? []).includes(b) ? next[a] : [...(next[a] ?? []), b];
  next[b] = (next[b] ?? []).includes(a) ? next[b] : [...(next[b] ?? []), a];
  return next;
}

function chainConnection(x: number, y: number, bridge: number): Connection {
  const ev = evaluate(x, y);
  return { a: x, b: y, ev, isChain: true, bonus: Math.ceil(ev.sc * CHAIN_RATIO), bridge };
}

function pick(state: GameState, card: number): GameState {
  if (state.screen !== 'game' || state.paused) return state;
  if (card < 0 || card >= TOTAL_CARDS || card === state.currentCard) return state;

  if (state.path.includes(card)) {
    return { ...state, dupCard: card, dupId: state.dupId + 1 };
  }

  // Daily: the last connection must land on the target.
  const daily = state.mode === 'daily' ? state.daily : null;
  if (daily && state.path.length === daily.links && card !== daily.target) {
    return { ...state, dupCard: card, dupId: state.dupId + 1 };
  }

  if (state.currentCard === -1) {
    return { ...state, currentCard: card, path: [card], dupCard: -1 };
  }

  const a = state.currentCard;
  const b = card;
  const ev = evaluate(a, b);
  const pairs = new Set(state.pairs);
  pairs.add(pairKey(a, b));

  // A new edge a–b closes a triangle with every existing neighbour of a or b:
  // n–a–b reveals the hidden chain connection n–b (and a–b–n reveals a–n).
  const found: Connection[] = [];
  if (!daily) for (const n of state.adj[a] ?? []) {
    const k = pairKey(n, b);
    if (n !== b && !pairs.has(k)) { pairs.add(k); found.push(chainConnection(n, b, a)); }
  }
  if (!daily) for (const n of state.adj[b] ?? []) {
    const k = pairKey(a, n);
    if (n !== a && !pairs.has(k)) { pairs.add(k); found.push(chainConnection(a, n, b)); }
  }

  const path = [...state.path, b];
  const done = daily ? b === daily.target : path.length === TOTAL_CARDS;

  return {
    ...state,
    currentCard: b,
    path,
    pairs: [...pairs],
    adj: link(state.adj, a, b),
    directConns: [...state.directConns, { a, b, ev }],
    chainConns: [...state.chainConns, ...found],
    score: state.score + ev.sc,
    chainScore: state.chainScore + found.reduce((s, f) => s + (f.bonus ?? 0), 0),
    lastEval: { a, b, ev, id: (state.lastEval?.id ?? 0) + 1 },
    pendingChains: found,
    dupCard: -1,
    screen: done ? 'results' : 'game',
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start':
      return initialState('game');
    case 'startDaily': {
      const s = action.daily.start;
      return { ...initialState('game'), mode: 'daily', daily: action.daily, currentCard: s, path: [s] };
    }
    case 'pick':
      return pick(state, action.card);
    case 'tick':
      if (state.screen !== 'game' || state.paused || state.mode === 'daily') return state;
      return state.timeLeft <= 1
        ? { ...state, timeLeft: 0, screen: 'results' }
        : { ...state, timeLeft: state.timeLeft - 1 };
    case 'pause':
      return state.screen === 'game' ? { ...state, paused: true } : state;
    case 'resume':
      return { ...state, paused: false };
    case 'finish':
      return state.screen === 'game' ? { ...state, paused: false, screen: 'results' } : state;
    case 'menu':
      return initialState('splash');
    case 'annotate': {
      const c = state.directConns[action.index];
      if (!c) return state;
      const { index: _i, type: _t, ...patch } = action;
      const directConns = state.directConns.slice();
      directConns[action.index] = { ...c, ...patch };
      return { ...state, directConns };
    }
  }
}

export function totalScore(state: Pick<GameState, 'score' | 'chainScore'>): number {
  return state.score + state.chainScore;
}
