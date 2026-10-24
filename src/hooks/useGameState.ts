import { useState, useCallback, useRef, useEffect } from 'react';
import { ITEMS, SCORE_VALUES, CHAIN_RATIO, MILESTONES } from '../game/gameItems';
import { evaluate, type Evaluation } from '../game/evaluator';
import type { Connection } from '../game/personality';

interface AdjList {
  [key: number]: number[];
}

export interface GameState {
  screen: 'splash' | 'game' | 'results';
  currentCard: number;
  chainOrder: number;
  usedCards: Set<number>;
  pairs: Set<string>;
  directConns: Connection[];
  chainConns: Connection[];
  score: number;
  chainScore: number;
  timeLeft: number;
  lastEval: { a: number; b: number; ev: Evaluation; isChain: boolean; bonus?: number } | null;
  pendingChains: Connection[];
  hintText: string;
  dupCard: number;
}

export function useGameState() {
  const [state, setState] = useState<GameState>({
    screen: 'splash',
    currentCard: -1,
    chainOrder: 0,
    usedCards: new Set(),
    pairs: new Set(),
    directConns: [],
    chainConns: [],
    score: 0,
    chainScore: 0,
    timeLeft: 300,
    lastEval: null,
    pendingChains: [],
    hintText: 'בחר כרטיס ראשון לפתיחת השרשרת',
    dupCard: -1,
  });

  const adjListRef = useRef<AdjList>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scorePopRef = useRef<{ pts: number; lv: string; key: number } | null>(null);
  const [scorePopKey, setScorePopKey] = useState(0);
  const [chainToast, setChainToast] = useState<{ count: number; key: number } | null>(null);

  const addAdj = useCallback((a: number, b: number) => {
    const adj = adjListRef.current;
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  }, []);

  const startGame = useCallback(() => {
    adjListRef.current = {};
    setState({
      screen: 'game',
      currentCard: -1,
      chainOrder: 0,
      usedCards: new Set(),
      pairs: new Set(),
      directConns: [],
      chainConns: [],
      score: 0,
      chainScore: 0,
      timeLeft: 300,
      lastEval: null,
      pendingChains: [],
      hintText: 'בחר כרטיס ראשון לפתיחת השרשרת',
      dupCard: -1,
    });
    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeLeft <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, timeLeft: 0, screen: 'results' };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState(prev => ({ ...prev, screen: 'splash' }));
  }, []);

  const pick = useCallback((i: number) => {
    setState(prev => {
      if (prev.screen !== 'game') return prev;

      // Already used — flash
      if (prev.usedCards.has(i) && i !== prev.currentCard) {
        setTimeout(() => setState(p => ({ ...p, dupCard: -1 })), 420);
        return { ...prev, dupCard: i };
      }

      // First card
      if (prev.currentCard === -1) {
        const newUsed = new Set(prev.usedCards);
        newUsed.add(i);
        return {
          ...prev,
          currentCard: i,
          chainOrder: 1,
          usedCards: newUsed,
          hintText: `${ITEMS[i].e} ${ITEMS[i].l} — עכשיו בחר כרטיס לחיבור`,
          dupCard: -1,
        };
      }

      // Same card
      if (i === prev.currentCard) return prev;

      // Make connection
      const a = prev.currentCard, b = i;
      const k = [Math.min(a, b), Math.max(a, b)].join(',');
      const ev = evaluate(a, b);
      const newPairs = new Set(prev.pairs);
      newPairs.add(k);
      const newDirect = [...prev.directConns, { a, b, ev }];
      const newScore = prev.score + ev.sc;
      addAdj(a, b);

      const newUsed = new Set(prev.usedCards);
      newUsed.add(b);
      const newChainOrder = prev.chainOrder + 1;

      // Discover chains
      const adj = adjListRef.current;
      const nbrA = (adj[a] || []).filter((n: number) => n !== b);
      const nbrB = (adj[b] || []).filter((n: number) => n !== a);
      const found: Connection[] = [];

      nbrA.forEach((na: number) => {
        const ck = [Math.min(na, b), Math.max(na, b)].join(',');
        if (!newPairs.has(ck)) {
          newPairs.add(ck);
          const cev = evaluate(na, b);
          const bonus = Math.ceil(cev.sc * CHAIN_RATIO);
          found.push({ a: na, b, ev: cev, isChain: true, bonus, bridge: a });
        }
      });
      nbrB.forEach((nb: number) => {
        const ck = [Math.min(a, nb), Math.max(a, nb)].join(',');
        if (!newPairs.has(ck)) {
          newPairs.add(ck);
          const cev = evaluate(a, nb);
          const bonus = Math.ceil(cev.sc * CHAIN_RATIO);
          found.push({ a, b: nb, ev: cev, isChain: true, bonus, bridge: b });
        }
      });

      const newChainConns = [...prev.chainConns, ...found];
      const newChainScore = prev.chainScore + found.reduce((s, f) => s + (f.bonus || 0), 0);

      // Show chain toast
      if (found.length > 0) {
        setChainToast({ count: found.length, key: Date.now() });
        setTimeout(() => setChainToast(null), 2200);
      }

      // Score popup
      scorePopRef.current = { pts: ev.sc, lv: ev.lv, key: Date.now() };
      setScorePopKey(Date.now());

      const isGameOver = newChainOrder === 25;
      if (isGameOver && timerRef.current) clearInterval(timerRef.current);

      return {
        ...prev,
        currentCard: b,
        chainOrder: newChainOrder,
        usedCards: newUsed,
        pairs: newPairs,
        directConns: newDirect,
        chainConns: newChainConns,
        score: newScore,
        chainScore: newChainScore,
        lastEval: { a, b, ev, isChain: false },
        pendingChains: found,
        hintText: isGameOver ? 'כל הכרטיסים חוברו!' : `${ITEMS[b].e} ${ITEMS[b].l} — בחר כרטיס הבא · ${newChainOrder}/25`,
        dupCard: -1,
        screen: isGameOver ? 'results' : 'game',
      };
    });
  }, [addAdj]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const totalScore = state.score + state.chainScore;
  const currentMilestone = MILESTONES.filter(m => m.pts <= totalScore).pop();
  const nextMilestone = MILESTONES.find(m => m.pts > totalScore);

  return {
    state,
    totalScore,
    currentMilestone,
    nextMilestone,
    scorePopRef,
    scorePopKey,
    chainToast,
    startGame,
    resetGame,
    pick,
  };
}
