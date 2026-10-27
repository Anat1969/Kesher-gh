/** Small, failure-tolerant wrapper around localStorage for stats and settings. */

export interface GameRecord {
  date: string;
  total: number;
  connections: number;
  chains: number;
  personality: string | null;
  /** Share of direct connections at drash or sod (0..1). Missing on records from older versions. */
  deep?: number;
}

export interface Stats {
  gamesPlayed: number;
  bestScore: number;
  totalConnections: number;
  /** Pair keys of hand-crafted secrets the player has uncovered, across all games. */
  secrets: string[];
  history: GameRecord[];
}

export interface Settings {
  sound: boolean;
  haptics: boolean;
  /** Show word names under the drawings on the board. */
  labels: boolean;
}

const STATS_KEY = 'kesher:stats:v1';
const SETTINGS_KEY = 'kesher:settings:v1';
const HISTORY_LIMIT = 100;

export const DEFAULT_STATS: Stats = { gamesPlayed: 0, bestScore: 0, totalConnections: 0, secrets: [], history: [] };
export const DEFAULT_SETTINGS: Settings = { sound: true, haptics: true, labels: false };

function read<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or blocked (private mode) — the game still works without it.
  }
}

export const loadStats = (): Stats => read(STATS_KEY, DEFAULT_STATS);
export const loadSettings = (): Settings => read(SETTINGS_KEY, DEFAULT_SETTINGS);
export const saveSettings = (s: Settings): void => write(SETTINGS_KEY, s);

export interface RecordResult {
  stats: Stats;
  isNewBest: boolean;
  newSecrets: string[];
}

/** Folds a finished game into the persisted stats. */
export function recordGame(prev: Stats, game: GameRecord & { secrets: string[] }): RecordResult {
  const known = new Set(prev.secrets);
  const newSecrets = game.secrets.filter(k => !known.has(k));
  const { secrets: _ignored, ...entry } = game;
  const stats: Stats = {
    gamesPlayed: prev.gamesPlayed + 1,
    bestScore: Math.max(prev.bestScore, game.total),
    totalConnections: prev.totalConnections + game.connections,
    secrets: [...prev.secrets, ...newSecrets],
    history: [entry, ...prev.history].slice(0, HISTORY_LIMIT),
  };
  write(STATS_KEY, stats);
  return { stats, isNewBest: game.total > prev.bestScore && game.total > 0, newSecrets };
}

// ── Daily challenge ──

export interface DailyResult {
  key: string;
  number: number;
  score: number;
  best: number;
  path: number[];
  levels: string[];
}

const DAILY_KEY = 'kesher:daily:v1';

export const loadDaily = (): Record<string, DailyResult> => read<Record<string, DailyResult>>(DAILY_KEY, {});

/** Keeps the best attempt per day and folds any secrets found into the lifetime stats. */
export function recordDaily(prev: Stats, result: DailyResult, secrets: string[]): { stats: Stats; daily: Record<string, DailyResult>; newSecrets: string[] } {
  const all = loadDaily();
  const before = all[result.key];
  if (!before || result.score > before.score) all[result.key] = result;
  write(DAILY_KEY, all);
  const known = new Set(prev.secrets);
  const newSecrets = secrets.filter(k => !known.has(k));
  const stats: Stats = { ...prev, secrets: [...prev.secrets, ...newSecrets] };
  write(STATS_KEY, stats);
  return { stats, daily: all, newSecrets };
}

/** Folds games recorded on another device into the local history (deduplicated, newest first). */
export function mergeHistory(prev: Stats, incoming: GameRecord[]): Stats {
  const near = (a: GameRecord, b: GameRecord) => a.total === b.total && Math.abs(Date.parse(a.date) - Date.parse(b.date)) < 120_000;
  const added = incoming.filter(g => !prev.history.some(h => near(h, g)));
  if (added.length === 0) return prev;
  const history = [...prev.history, ...added].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, HISTORY_LIMIT);
  const stats: Stats = {
    ...prev,
    gamesPlayed: prev.gamesPlayed + added.length,
    bestScore: Math.max(prev.bestScore, ...added.map(g => g.total)),
    totalConnections: prev.totalConnections + added.reduce((s, g) => s + g.connections, 0),
    history,
  };
  write(STATS_KEY, stats);
  return stats;
}
