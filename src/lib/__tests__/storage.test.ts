import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_STATS, loadSettings, loadStats, recordGame, saveSettings } from '../storage';

const game = (total: number, secrets: string[] = []) => ({
  date: new Date().toISOString(), total, connections: 5, chains: 2, personality: null, secrets,
});

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('falls back to defaults on empty or corrupt storage', () => {
    expect(loadStats()).toEqual(DEFAULT_STATS);
    localStorage.setItem('kesher:stats:v1', '{not json');
    expect(loadStats()).toEqual(DEFAULT_STATS);
  });

  it('records games, best score and new secrets', () => {
    const first = recordGame(loadStats(), game(120, ['0,10']));
    expect(first.isNewBest).toBe(true);
    expect(first.newSecrets).toEqual(['0,10']);

    const second = recordGame(loadStats(), game(80, ['0,10', '4,20']));
    expect(second.isNewBest).toBe(false);
    expect(second.newSecrets).toEqual(['4,20']);
    expect(second.stats).toMatchObject({ gamesPlayed: 2, bestScore: 120, totalConnections: 10 });
    expect(second.stats.secrets).toEqual(['0,10', '4,20']);
    expect(loadStats().history.map(h => h.total)).toEqual([80, 120]);
  });

  it('persists settings', () => {
    saveSettings({ sound: false, haptics: true, labels: false });
    expect(loadSettings()).toEqual({ sound: false, haptics: true, labels: false });
  });
});
