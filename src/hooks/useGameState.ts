import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { MILESTONES, type Level } from '../game/gameItems';
import { gameReducer, initialState, totalScore as sumScore } from '../game/engine';
import { isHandCraftedSecret, pairKey } from '../game/evaluator';
import { analyzePersonality } from '../game/personality';
import { sounds, vibrate } from '../lib/feedback';
import { dailyFor, dateKey } from '../game/daily';
import {
  loadSettings, loadStats, recordGame, saveSettings, loadDaily, recordDaily, type DailyResult,
  type RecordResult, type Settings, type Stats,
} from '../lib/storage';

export type { GameState } from '../game/engine';

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState());
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [lastRecord, setLastRecord] = useState<RecordResult | null>(null);
  const [dailyResults, setDailyResults] = useState<Record<string, DailyResult>>(loadDaily);

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
    if (state.directConns.length === 0) return; // ended without playing — nothing to record
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
      return;
    }
    const result = recordGame(loadStats(), {
      date: new Date().toISOString(),
      total: sumScore(state),
      connections: state.directConns.length,
      chains: state.chainConns.length,
      personality: personality ? `${personality.emoji} ${personality.type}` : null,
      secrets,
    });
    setStats(result.stats);
    setLastRecord(result);
    feedback(sounds.finish, [30, 50, 30, 50, 80]);
  }, [state, feedback]);

  const startGame = useCallback(() => { setLastRecord(null); dispatch({ type: 'start' }); }, []);
  const startDaily = useCallback(() => { setLastRecord(null); dispatch({ type: 'startDaily', daily: dailyFor(dateKey()) }); }, []);
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
  };
}
