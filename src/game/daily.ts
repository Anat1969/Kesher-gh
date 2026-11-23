import { CLASSIC_DECK, ITEMS, SCORE_VALUES } from './gameItems';
import { dealDeck } from './deck';
import { evaluate } from './evaluator';

/** The daily challenge: the same start, target and length for everyone on a given day. */
export interface DailyConfig {
  /** Local date, YYYY-MM-DD. */
  key: string;
  /** Challenge number, counting from the first day. */
  number: number;
  start: number;
  target: number;
  /** Exact number of connections the chain may use. */
  links: number;
  /** Highest score any chain of this length can reach today, and one chain that reaches it. */
  best: number;
  bestPath: number[];
  /** The day's board (25 card ids). */
  deck: number[];
}

export const DAILY_LINKS = 5;
const EPOCH = Date.UTC(2026, 9, 27); // challenge #1
/** From this day the daily board is dealt from the whole pool; earlier days keep the classic board. */
export const MIXED_FROM = '2026-11-24';

export function dateKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor((Date.UTC(y, m - 1, d) - EPOCH) / 86400000) + 1;
}

/** Small deterministic PRNG (mulberry32) seeded from the date. */
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const scores = new Map<number, number>();
const score = (a: number, b: number) => {
  const k = a * ITEMS.length + b;
  let v = scores.get(k);
  if (v === undefined) { v = a === b ? 0 : evaluate(a, b).sc; scores.set(k, v); }
  return v;
};

/** Best chain of exactly `links` connections from start to target, without repeating a card. */
export function bestChain(start: number, target: number, links: number, deck: readonly number[] = CLASSIC_DECK): { best: number; path: number[] } {
  let best = -1;
  let bestPath: number[] = [];
  const path = [start];
  const used = new Set([start]);
  const maxStep = SCORE_VALUES.s;
  const walk = (at: number, total: number) => {
    const left = links - (path.length - 1);
    if (left === 1) {
      const t = total + score(at, target);
      if (t > best) { best = t; bestPath = [...path, target]; }
      return;
    }
    if (total + left * maxStep <= best) return;
    for (const n of deck) {
      if (used.has(n) || n === target) continue;
      used.add(n); path.push(n);
      walk(n, total + score(at, n));
      path.pop(); used.delete(n);
    }
  };
  walk(start, 0);
  return { best, path: bestPath };
}

const cache = new Map<string, DailyConfig>();

export function dailyFor(key = dateKey()): DailyConfig {
  const hit = cache.get(key);
  if (hit) return hit;
  const r = rng(`kesher:${key}`);
  const mixed = key >= MIXED_FROM;
  const deck = mixed ? dealDeck('mix', r) : [...CLASSIC_DECK];
  // Same draw as before the pool grew, so past challenges keep their start and target.
  const s = Math.floor(r() * deck.length);
  let t = Math.floor(r() * (deck.length - 1));
  if (t >= s) t++;
  const start = deck[s], target = deck[t];
  const { best, path } = bestChain(start, target, DAILY_LINKS, deck);
  const cfg: DailyConfig = { key, number: dayNumber(key), start, target, links: DAILY_LINKS, best, bestPath: path, deck };
  cache.set(key, cfg);
  return cfg;
}

const shiftDay = (key: string, delta: number) => {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + delta));
};

/** Consecutive days with a finished daily, ending today (or yesterday, if today is still open). */
export function streak(playedKeys: Iterable<string>, today = dateKey()): number {
  const played = new Set(playedKeys);
  let day = played.has(today) ? today : shiftDay(today, -1);
  let n = 0;
  while (played.has(day)) { n++; day = shiftDay(day, -1); }
  return n;
}

/** The last `count` days, oldest first, ending today. */
export function lastDays(count: number, today = dateKey()): string[] {
  return Array.from({ length: count }, (_, k) => shiftDay(today, k - count + 1));
}
