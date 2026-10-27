import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchBoard, loadPlayer, savePlayer, submitScore } from '../remote';
import { rolling, trendLine } from '../learning';

describe('player identity', () => {
  beforeEach(() => localStorage.clear());

  it('creates a player once and keeps id and key when renamed', () => {
    expect(loadPlayer()).toBeNull();
    expect(savePlayer('   ')).toBeNull();
    const a = savePlayer('  ענת   ש  ')!;
    expect(a.name).toBe('ענת ש');
    expect(a.key.length).toBeGreaterThanOrEqual(32);
    const b = savePlayer('ענת')!;
    expect(b).toMatchObject({ id: a.id, key: a.key, name: 'ענת' });
    expect(loadPlayer()).toEqual(b);
  });
});

describe('remote calls', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('submits through the rpc door and returns best and rank', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ best: 210, rank: 3 }) });
    vi.stubGlobal('fetch', fetchMock);
    const res = await submitScore({ id: 'p', key: 'k'.repeat(32), name: 'א' }, { mode: 'classic', day: '2026-10-27', score: 210.4, connections: 12, deep: 0.33333 });
    expect(res).toEqual({ best: 210, rank: 3 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/rest\/v1\/rpc\/kesher_submit$/);
    expect(JSON.parse(init.body)).toMatchObject({ p_mode: 'classic', p_day: null, p_score: 210, p_deep: 0.333 });
  });

  it('fails soft when offline or refused', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    expect(await fetchBoard('classic')).toBeNull();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    expect(await submitScore({ id: 'p', key: 'k'.repeat(32), name: 'א' }, { mode: 'daily', day: '2026-10-27', score: 5, connections: 1, deep: 0 })).toBeNull();
  });

  it('normalises leaderboard numbers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [{ rank: '1', player_id: 'p', name: 'א', best: 99, games: '4' }] }));
    expect(await fetchBoard('daily', '2026-10-27')).toEqual([{ rank: 1, player_id: 'p', name: 'א', best: 99, games: 4 }]);
  });
});

describe('learning maths', () => {
  it('rolling mean uses up to five games', () => {
    expect(rolling([10, 20, 30, 40, 50, 60])).toEqual([10, 15, 20, 25, 30, 40]);
  });
  it('trend line names the direction', () => {
    expect(trendLine([50])).toMatch(/כיוון/);
    expect(trendLine([50, 60, 70, 100, 120, 130])).toMatch(/עלה ב-/);
    expect(trendLine([100, 90, 40, 30])).toMatch(/ירד ב-/);
    expect(trendLine([80, 81, 80, 82])).toMatch(/יציב/);
  });
});

describe('player code', () => {
  it('round-trips id and key, also from a link', async () => {
    const { playerCode, parseCode } = await import('../remote');
    const p = { id: '0f1e2d3c-4b5a-4968-8776-655443322110', key: 'ab'.repeat(24), name: 'א' };
    const code = playerCode(p);
    expect(code.length).toBeLessThan(60);
    expect(parseCode(code)).toEqual({ id: p.id, key: p.key });
    expect(parseCode(`https://kesher-gh.vercel.app/scores#player=${code}`)).toEqual({ id: p.id, key: p.key });
    expect(parseCode('hello')).toBeNull();
  });
});

describe('merge history', () => {
  it('adds only games not already on this device', async () => {
    const { mergeHistory, DEFAULT_STATS } = await import('../storage');
    const local = { ...DEFAULT_STATS, gamesPlayed: 1, bestScore: 80, history: [{ date: '2026-10-27T10:00:00.000Z', total: 80, connections: 5, chains: 0, personality: null }] };
    const next = mergeHistory(local, [
      { date: '2026-10-27T10:00:01.200Z', total: 80, connections: 5, chains: 0, personality: null },
      { date: '2026-10-26T09:00:00.000Z', total: 140, connections: 9, chains: 0, personality: null },
    ]);
    expect(next.gamesPlayed).toBe(2);
    expect(next.bestScore).toBe(140);
    expect(next.history.map(h => h.total)).toEqual([80, 140]);
  });
});
