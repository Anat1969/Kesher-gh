import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { MILESTONES, type Level } from '../game/gameItems';
import { gameReducer, initialState, totalScore as sumScore } from '../game/engine';
import { isHandCraftedSecret, pairKey } from '../game/evaluator';
import { analyzePersonality } from '../game/personality';
import { sounds, vibrate } from '../lib/feedback';
import { dailyFor, dateKey } from '../game/daily';
import {
  loadSettings, loadStats, recordGame, mergeHistory, saveSettings, loadDaily, recordDaily, type DailyResult,
  type RecordResult, type Settings, type Stats,
} from '../lib/storage';
import { adoptPlayer, fetchHistory, loadPlayer, parseCode, savePlayer, submitScore, whoami, type Player, type Submission } from '../lib/remote';

export type RemoteStatus =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'done'; best: number; rank: number }
  | { status: 'error' };

const deepShare = (lvs: string[]) => (lvs.length ? lvs.filter(l => l === 'd' || l === 's').length / lvs.length : 0);

export type { GameState } from '../game/engine';

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState());
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [lastRecord, setLastRecord] = useState<RecordResult | null>(null);
  const [dailyResults, setDailyResults] = useState<Record<string, DailyResult>>(loadDaily);
  const [player, setPlayer] = useState<Player | null>(loadPlayer);
  const [remote, setRemote] = useState<RemoteStatus>({ status: 'idle' });
  /** The last finished game, kept so a player who joins the board right after it can still send it. */
  const lastSubmission = useRef<Submission | null>(null);

  const send = useCallback(async (p: Player, sub: Submission) => {
    setRemote({ status: 'sending' });
    const res = await submitScore(p, sub);
    setRemote(res ? { status: 'done', best: res.best, rank: res.rank } : { status: 'error' });
  }, []);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const feedback = useCallback((sound: () => void, haptic?: number | number[]) => {
    if (settingsRef.current.sound) sound();
    if (haptic && settingsRef.current.haptics) vibrate(haptic);
  }, []);

  // ── Timer: runs only while a game is active and not paused ──
  const running = state.screen === 'game' && !state.paused && state.mode === 'classic';
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Pause automatically when the tab/app goes to the background.
  useEffect(() => {
    const onHide = () => { if (document.hidden) dispatch({ type: 'pause' }); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  // Countdown ticks in the last 10 seconds.
  useEffect(() => {
    if (running && state.timeLeft <= 10 && state.timeLeft > 0) feedback(sounds.tick, 15);
  }, [running, state.timeLeft, feedback]);

  // ── Feedback for each new connection / duplicate ──
  useEffect(() => {
    if (!state.lastEval) return;
    feedback(() => sounds.connect(state.lastEval!.ev.lv), state.lastEval.ev.lv === 's' ? [20, 40, 20] : 15);
    if (state.pendingChains.length > 0) feedback(sounds.chain);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per connection
  }, [state.lastEval?.id]);

  useEffect(() => {
    if (state.dupId > 0) feedback(sounds.error, 60);
  }, [state.dupId, feedback]);

  // ── Persist results once per finished game ──
  const recordedRef = useRef(false);
  useEffect(() => {
    if (state.screen === 'game') recordedRef.current = false;
    if (state.screen !== 'results' || recordedRef.current) return;
    recordedRef.current = true;
    if (state.directConns.length === 0) { lastSubmission.current = null; return; } // ended without playing
    const deep = deepShare(state.directConns.map(c => c.ev.lv));
    const personality = state.directConns.length ? analyzePersonality(state.directConns, state.chainConns) : null;
    const secrets = [...state.directConns, ...state.chainConns]
      .filter(c => isHandCraftedSecret(c.a, c.b))
      .map(c => pairKey(c.a, c.b));
    if (state.mode === 'daily' && state.daily) {
      const d = state.daily;
      const rec = recordDaily(loadStats(), {
        key: d.key, number: d.number, score: state.score, best: d.best, path: state.path,
        levels: state.directConns.map(c => c.ev.lv),
      }, secrets);
      setStats(rec.stats);
      setDailyResults(rec.daily);
      setLastRecord({ stats: rec.stats, isNewBest: false, newSecrets: rec.newSecrets });
      feedback(sounds.finish, [30, 50, 30, 50, 80]);
      lastSubmission.current = { mode: 'daily', day: d.key, score: state.score, connections: state.directConns.length, deep };
      const p = loadPlayer();
      if (p) void send(p, lastSubmission.current);
      return;
    }
    const result = recordGame(loadStats(), {
      date: new Date().toISOString(),
      total: sumScore(state),
      connections: state.directConns.length,
      chains: state.chainConns.length,
      personality: personality ? `${personality.emoji} ${personality.type}` : null,
      deep,
      secrets,
    });
    setStats(result.stats);
    setLastRecord(result);
    feedback(sounds.finish, [30, 50, 30, 50, 80]);
    lastSubmission.current = { mode: 'classic', day: null, score: sumScore(state), connections: state.directConns.length, deep };
    const p = loadPlayer();
    if (p) void send(p, lastSubmission.current);
  }, [state, feedback, send]);

  /** Joins the shared board (or renames), and sends the game just finished if it was not sent yet. */
  const joinBoard = useCallback((name: string) => {
    const wasJoined = !!loadPlayer();
    const p = savePlayer(name);
    if (!p) return;
    setPlayer(p);
    if (!wasJoined && lastSubmission.current) void send(p, lastSubmission.current);
  }, [send]);

  /**
   * Continues as the player a code belongs to (from another device): checks the code with the
   * server, adopts the identity and pulls that player's games into the learning graph.
   * Returns the name and how many games were added, or null when the code is wrong or the network is down.
   */
  const restorePlayer = useCallback(async (code: string): Promise<{ name: string; added: number } | null> => {
    const parsed = parseCode(code);
    if (!parsed) return null;
    const name = await whoami(parsed.id, parsed.key);
    if (!name) return null;
    const p: Player = { ...parsed, name };
    adoptPlayer(p);
    setPlayer(p);
    const games = await fetchHistory(p);
    const before = loadStats();
    let added = 0;
    if (games) {
      const records = games.filter(g => g.mode === 'classic').map(g => ({
        date: g.created_at, total: g.score, connections: g.connections, chains: 0, personality: null,
        deep: g.deep_ratio ?? undefined,
      }));
      const merged = mergeHistory(before, records);
      added = merged.gamesPlayed - before.gamesPlayed;
      setStats(merged);
    }
    return { name, added };
  }, []);

  const startGame = useCallback(() => { setLastRecord(null); setRemote({ status: 'idle' }); dispatch({ type: 'start' }); }, []);
  const startDaily = useCallback(() => { setLastRecord(null); setRemote({ status: 'idle' }); dispatch({ type: 'startDaily', daily: dailyFor(dateKey()) }); }, []);
  const resetGame = useCallback(() => dispatch({ type: 'menu' }), []);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
  const resume = useCallback(() => dispatch({ type: 'resume' }), []);
  const finish = useCallback(() => dispatch({ type: 'finish' }), []);
  const annotate = useCallback(
    (index: number, patch: { meant?: string; meantLv?: Level; note?: string }) => dispatch({ type: 'annotate', index, ...patch }),
    [],
  );
  const pick = useCallback((card: number) => {
    if (state.currentCard === -1 && !state.path.includes(card)) feedback(sounds.select, 8);
    dispatch({ type: 'pick', card });
  }, [state.currentCard, state.path, feedback]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const totalScore = sumScore(state);
  const { currentMilestone, nextMilestone } = useMemo(() => ({
    currentMilestone: MILESTONES.filter(m => m.pts <= totalScore).pop(),
    nextMilestone: MILESTONES.find(m => m.pts > totalScore),
  }), [totalScore]);

  return {
    state,
    totalScore,
    currentMilestone,
    nextMilestone,
    settings,
    stats,
    lastRecord,
    startGame,
    startDaily,
    dailyResults,
    resetGame,
    pause,
    resume,
    finish,
    annotate,
    pick,
    updateSettings,
    player,
    remote,
    joinBoard,
    restorePlayer,
  };
}
