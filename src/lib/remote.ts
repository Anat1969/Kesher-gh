/**
 * Shared scoreboard. The database is reached only through three functions (kesher_submit,
 * kesher_leaderboard, kesher_history); tables are closed to the public key. Every call fails
 * soft: offline, blocked or slow networks return null and the game keeps working locally.
 */

const URL = 'https://ktqmwpbzcnzkhjskqisy.supabase.co/rest/v1/rpc/';
/** Publishable (public) key: safe in the client, it can only call the three functions. */
const KEY = 'sb_publishable_IkreG7naPa1h-d4kGp1gpA_sLU4tg5q';
const PLAYER_KEY = 'kesher:player:v1';
const TIMEOUT_MS = 8000;

export type Mode = 'classic' | 'daily';

export interface Player {
  id: string;
  /** Private key that proves this device owns the player. Never shown. */
  key: string;
  name: string;
}

export interface Submission {
  mode: Mode;
  /** YYYY-MM-DD, only for the daily challenge. */
  day: string | null;
  score: number;
  connections: number;
  /** Share of connections at drash or sod, 0..1. */
  deep: number;
}

export interface BoardRow {
  rank: number;
  player_id: string;
  name: string;
  best: number;
  games: number;
}

const hex = (bytes: Uint8Array) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');

function randomId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = hex(b);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export const cleanName = (name: string) => name.replace(/\s+/g, ' ').trim().slice(0, 24);

export function loadPlayer(): Player | null {
  try {
    const p = JSON.parse(localStorage.getItem(PLAYER_KEY) || 'null');
    return p && typeof p.id === 'string' && typeof p.key === 'string' && typeof p.name === 'string' && p.name ? p : null;
  } catch {
    return null;
  }
}

/** Creates the player on first use (id and key stay for good), or renames it. */
export function savePlayer(name: string): Player | null {
  const clean = cleanName(name);
  if (!clean) return null;
  const prev = loadPlayer();
  const player: Player = prev
    ? { ...prev, name: clean }
    : { id: randomId(), key: hex(crypto.getRandomValues(new Uint8Array(24))), name: clean };
  try { localStorage.setItem(PLAYER_KEY, JSON.stringify(player)); } catch { /* private mode */ }
  return player;
}

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T | null> {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : null;
  try {
    const res = await fetch(URL + fn, {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl?.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Sends one finished game. Returns the player's best and rank on that board. */
export function submitScore(player: Player, s: Submission) {
  return rpc<{ best: number; rank: number }>('kesher_submit', {
    p_player: player.id, p_key: player.key, p_name: player.name,
    p_mode: s.mode, p_day: s.mode === 'daily' ? s.day : null,
    p_score: Math.max(0, Math.round(s.score)), p_connections: s.connections,
    p_deep: Math.round(Math.min(1, Math.max(0, s.deep)) * 1000) / 1000,
  });
}

/** Each player's best score: all time for classic, or for one day of the daily challenge. */
export async function fetchBoard(mode: Mode, day: string | null = null, limit = 20): Promise<BoardRow[] | null> {
  const rows = await rpc<BoardRow[]>('kesher_leaderboard', { p_mode: mode, p_day: mode === 'daily' ? day : null, p_limit: limit });
  return Array.isArray(rows) ? rows.map(r => ({ ...r, rank: Number(r.rank), games: Number(r.games) })) : null;
}

// ── Moving between devices ──

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromHex = (h: string) => new Uint8Array((h.match(/../g) ?? []).map(x => parseInt(x, 16)));

/** Player code: id and private key in one short string. Whoever holds it plays under this name. */
export function playerCode(p: Player): string {
  const id = fromHex(p.id.replace(/-/g, ''));
  const key = fromHex(p.key);
  const all = new Uint8Array(id.length + key.length);
  all.set(id); all.set(key, id.length);
  return b64url(all);
}

/** Reads a code (or a link that carries one). Returns id and key, or null if it is not a code. */
export function parseCode(input: string): { id: string; key: string } | null {
  const raw = (input.match(/player=([A-Za-z0-9_-]+)/)?.[1] ?? input).trim();
  if (!/^[A-Za-z0-9_-]{40,}$/.test(raw)) return null;
  try {
    const bin = atob(raw.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    if (bytes.length < 16 + 8) return null;
    const h = hex(bytes.slice(0, 16));
    const id = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    return { id, key: hex(bytes.slice(16)) };
  } catch {
    return null;
  }
}

/** Name of the player the code belongs to, or null if the code is wrong (or offline). */
export function whoami(id: string, key: string) {
  return rpc<string | null>('kesher_whoami', { p_player: id, p_key: key });
}

export interface RemoteGame {
  created_at: string;
  mode: Mode;
  day_key: string | null;
  score: number;
  connections: number;
  deep_ratio: number | null;
}

/** Every game this player sent, oldest first. */
export async function fetchHistory(p: Pick<Player, 'id' | 'key'>): Promise<RemoteGame[] | null> {
  const rows = await rpc<RemoteGame[]>('kesher_history', { p_player: p.id, p_key: p.key });
  return Array.isArray(rows) ? rows : null;
}

/** Makes this device play as an existing player. */
export function adoptPlayer(p: Player): void {
  try { localStorage.setItem(PLAYER_KEY, JSON.stringify(p)); } catch { /* private mode */ }
}
