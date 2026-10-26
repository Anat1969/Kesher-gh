import { ITEMS, CHAIN_RATIO } from './gameItems';
import { evaluate, pairKey, type Evaluation } from './evaluator';
import type { Connection } from './personality';

export const GAME_DURATION = 300;
export const TOTAL_CARDS = ITEMS.length;

export type Screen = 'splash' | 'game' | 'results';

export interface LastEval {
  a: number;
  b: number;
  ev: Evaluation;
  /** Monotonic id so the UI can replay animations for each new connection. */
  id: number;
}

export interface GameState {
  screen: Screen;
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
  | { type: 'pick'; card: number }
  | { type: 'tick' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'finish' }
  | { type: 'menu' };

export function initialState(screen: Screen = 'splash'): GameState {
  return {
    screen,
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
  for (const n of state.adj[a] ?? []) {
    const k = pairKey(n, b);
    if (n !== b && !pairs.has(k)) { pairs.add(k); found.push(chainConnection(n, b, a)); }
  }
  for (const n of state.adj[b] ?? []) {
    const k = pairKey(a, n);
    if (n !== a && !pairs.has(k)) { pairs.add(k); found.push(chainConnection(a, n, b)); }
  }

  const path = [...state.path, b];
  const done = path.length === TOTAL_CARDS;

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
    case 'pick':
      return pick(state, action.card);
    case 'tick':
      if (state.screen !== 'game' || state.paused) return state;
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
  }
}

export function totalScore(state: Pick<GameState, 'score' | 'chainScore'>): number {
  return state.score + state.chainScore;
}
