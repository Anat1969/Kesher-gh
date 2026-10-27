import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ITEMS, LEVEL_NAMES, LEVEL_ORDER, SCORE_VALUES, CHAIN_RATIO, MILESTONES,
  levelColor, type Level, type Milestone,
} from '../game/gameItems';
import type { GameState } from '../game/engine';
import { GAME_DURATION, TOTAL_CARDS } from '../game/engine';
import { isHandCraftedSecret, pairKey, readingsFor } from '../game/evaluator';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import ReadingPanel from './ReadingPanel';
import Glyph from './Glyph';
import Rich from './Rich';
import type { Settings } from '../lib/storage';
import ConnectionLines from './ConnectionLines';
import AnimatedNumber from './AnimatedNumber';

interface GameScreenProps {
  state: GameState;
  totalScore: number;
  currentMilestone: Milestone | undefined;
  nextMilestone: Milestone | undefined;
  settings: Settings;
  knownSecrets: ReadonlySet<string>;
  onPick: (i: number) => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onMenu: () => void;
  onSettings: (patch: Partial<Settings>) => void;
  onAnnotate: (index: number, patch: { meant?: string; meantLv?: Level; note?: string }) => void;
}

const COLS = 5;
const TRACK_MAX = MILESTONES[MILESTONES.length - 1].pts;
const EASE = [0.4, 0, 0.2, 1] as const;

const pad2 = (n: number) => String(n).padStart(2, '0');
function formatTime(t: number) {
  return `${Math.floor(t / 60)}:${pad2(t % 60)}`;
}

export default function GameScreen({
  state, totalScore, currentMilestone, nextMilestone, settings, knownSecrets,
  onPick, onPause, onResume, onFinish, onMenu, onSettings, onAnnotate,
}: GameScreenProps) {
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [chainToast, setChainToast] = useState<{ count: number; id: number } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { lastEval } = state;
  const daily = state.mode === 'daily' ? state.daily : null;
  const isUrgent = state.timeLeft <= 30;

  // Collapse the explanation and surface chain discoveries on every new connection.
  useEffect(() => {
    if (!lastEval) return;
    setSheetOpen(false);
    if (state.pendingChains.length === 0) return;
    setChainToast({ count: state.pendingChains.length, id: lastEval.id });
    const t = setTimeout(() => setChainToast(null), 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per connection
  }, [lastEval?.id]);

  // Escape resumes a stopped clock.
  useEffect(() => {
    if (!state.paused) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onResume(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.paused, onResume]);

  const levelsFor = (idx: number) => state.directConns.filter(c => c.a === idx || c.b === idx).map(c => c.ev.lv);

  // Arrow-key navigation across the grid (RTL: ArrowLeft moves forward).
  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = cardRefs.current.findIndex(el => el === document.activeElement);
    if (i < 0) return;
    const delta = { ArrowLeft: 1, ArrowRight: -1, ArrowDown: COLS, ArrowUp: -COLS }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const next = Math.min(TOTAL_CARDS - 1, Math.max(0, i + delta));
    cardRefs.current[next]?.focus();
  };

  const isNewSecret = !!lastEval && isHandCraftedSecret(lastEval.a, lastEval.b) && !knownSecrets.has(pairKey(lastEval.a, lastEval.b));

  const lastIndex = state.directConns.length - 1;
  const lastConn = lastEval ? state.directConns[lastIndex] : undefined;
  const alternatives = lastEval ? Math.max(0, readingsFor(lastEval.a, lastEval.b).length - 1) : 0;
  const panel = lastEval && lastConn ? (
    <ReadingPanel
      a={lastEval.a}
      b={lastEval.b}
      ordinal={state.directConns.length}
      meant={lastConn.meant}
      note={lastConn.note}
      onMeant={(meant, meantLv) => onAnnotate(lastIndex, { meant, meantLv })}
      onNote={note => onAnnotate(lastIndex, { note })}
    />
  ) : null;

  const recent = [
    ...state.directConns.map((c, i) => ({ ...c, key: `d${i}` })),
    ...state.chainConns.map((c, i) => ({ ...c, key: `c${i}` })),
  ].reverse().slice(0, 10);

  return (
    <div
      className="mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-x-6 overflow-hidden px-3 pb-3 pt-3 lg:grid-cols-[minmax(0,1fr)_400px]"
      style={{ height: 'calc(100dvh - var(--bar-h) - env(safe-area-inset-top))' }}
    >
    <div className="flex min-h-0 flex-col gap-3">
      {/* Instrument panel */}
      <section className="panel flex-shrink-0" aria-label="מצב המשחק">
        {daily ? (
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-stretch">
            <Figure label={`אתגר יומי ${daily.number}`}>
              <span className="flex items-center gap-1.5 text-[1.05rem] font-light">
                <Glyph i={daily.start} size={22} />
                <span className="h-px w-3 bg-foreground/40" />
                <Glyph i={daily.target} size={22} />
              </span>
            </Figure>
            <Figure label="ניקוד" divider>
              <AnimatedNumber value={totalScore} className="display-num text-[2.4rem]" />
            </Figure>
            <Figure label="קשרים" divider>
              <span className="num-mono text-[1.35rem] font-light" dir="ltr">{state.directConns.length}/{daily.links}</span>
            </Figure>
            <div className="flex items-center border-r border-border px-2.5">
              <button onClick={onMenu} className="btn btn-text h-9 px-1.5 text-sm">יציאה</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-stretch">
            <button
              type="button"
              onClick={state.paused ? onResume : onPause}
              className="text-right transition-colors hover:bg-surface-2"
              aria-label={state.paused ? 'המשך השעון' : 'עצירת השעון'}
            >
              <Figure label={state.paused ? 'עצור' : 'זמן'} role="timer" ariaLabel={`זמן שנותר ${formatTime(state.timeLeft)}`}>
                <span className={`num-mono text-[1.35rem] font-light ${isUrgent && !state.paused ? 'animate-blink' : ''} ${state.paused ? 'text-muted-foreground' : ''}`} dir="ltr">{formatTime(state.timeLeft)}</span>
              </Figure>
            </button>
            <Figure label="ניקוד" divider>
              <AnimatedNumber value={totalScore} className="display-num text-[2.4rem]" />
            </Figure>
            <Figure label="קשרים" divider>
              <span className="num-mono text-[1.35rem] font-light" dir="ltr">{pad2(state.directConns.length)}</span>
            </Figure>
            <Figure label="שרשרת" divider>
              <span className="num-mono text-[1.35rem] font-light" style={{ color: 'hsl(var(--chain))' }} dir="ltr">+{state.chainScore}</span>
            </Figure>
            <div className="flex items-center border-r border-border px-2">
              <button
                onClick={state.paused ? onResume : onPause}
                aria-pressed={state.paused}
                className={`btn h-9 px-2.5 text-sm ${state.paused ? 'btn-primary' : 'btn-ghost'}`}
              >
                {state.paused ? 'המשך' : 'עצירה'}
              </button>
            </div>
          </div>
        )}

        {/* Two tracks: time remaining and milestones (classic) or links used (daily) */}
        {daily ? (
          <div className="px-3 pb-2.5 pt-2 sm:px-4">
            <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${daily.links}, minmax(0,1fr))` }}>
              {Array.from({ length: daily.links }, (_, k) => {
                const c = state.directConns[k];
                return <span key={k} className="h-[3px]" style={{ background: c ? levelColor(c.ev.lv) : 'hsl(var(--surface-3))' }} />;
              })}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="label-mono">מ{ITEMS[daily.start].l} אל {ITEMS[daily.target].l}</span>
              <span className="label-mono">מקסימום היום · <span dir="ltr">{daily.best}</span></span>
            </div>
          </div>
        ) : (<>
        <div className="relative h-px bg-border">
          <motion.div
            className="absolute inset-y-0 right-0 bg-foreground"
            initial={false}
            animate={{ width: `${(state.timeLeft / GAME_DURATION) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
        <MilestoneTrack total={totalScore} current={currentMilestone} next={nextMilestone} />
        </>)}
      </section>

      {/* Legend */}
      <div className="flex flex-shrink-0 flex-wrap items-center justify-center gap-x-5 gap-y-1" aria-label="רמות קשר וניקוד">
        {LEVEL_ORDER.map(lv => (
          <span key={lv} className="flex items-center gap-1.5">
            <span className="h-[2px] w-3" style={{ background: levelColor(lv) }} />
            <span className="text-[0.78rem]" style={{ color: levelColor(lv) }}>{LEVEL_NAMES[lv]}</span>
            <span className="num-mono text-[0.66rem] text-muted-foreground">{SCORE_VALUES[lv]}</span>
          </span>
        ))}
        {!daily && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 border-t border-dashed" style={{ borderColor: 'hsl(var(--chain))' }} />
            <span className="text-[0.78rem]" style={{ color: 'hsl(var(--chain))' }}>שרשרת</span>
            <span className="num-mono text-[0.66rem] text-muted-foreground" dir="ltr">{Math.round(CHAIN_RATIO * 100)}%</span>
          </span>
        )}
        <button
          type="button"
          onClick={() => onSettings({ labels: !settings.labels })}
          aria-pressed={settings.labels}
          className={`rounded-[2px] border px-2 py-0.5 text-[0.74rem] transition-colors ${settings.labels ? 'border-foreground text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
        >
          {settings.labels ? 'הסתרת שמות' : 'הצגת שמות'}
        </button>
      </div>

      {/* Board */}
      <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        <div
          className="well relative w-full p-[clamp(6px,1.8vw,12px)]"
          style={{ maxWidth: 'min(600px, calc((100dvh - var(--bar-h) - var(--board-chrome)) * 1.05))', minWidth: '272px' }}
        >
          <ConnectionLines directConns={state.directConns} chainConns={state.chainConns} newestId={lastEval?.id ?? 0} />

          <div
            role="group"
            aria-label="כרטיסי המשחק"
            onKeyDown={onGridKey}
            className="relative z-[2] grid grid-cols-5"
            style={{ gap: 'clamp(4px, 1.4vw, 8px)' }}
          >
            {ITEMS.map((item, i) => {
              const isActive = state.currentCard === i;
              const inChain = state.path.includes(i);
              const isUsed = inChain && !isActive;
              const isDup = state.dupCard === i;
              const order = inChain ? state.path.indexOf(i) + 1 : null;
              const levels = levelsFor(i);
              const showName = settings.labels || isActive;
              const isTarget = daily?.target === i && !inChain;

              return (
                <motion.button
                  key={i}
                  ref={el => (cardRefs.current[i] = el)}
                  data-card={i}
                  title={item.l}
                  type="button"
                  onClick={() => onPick(i)}
                  aria-pressed={isActive}
                  aria-disabled={isUsed}
                  aria-label={`${item.l}${order ? `, מקום ${order} בשרשרת` : ''}${isActive ? ', הכרטיס הנוכחי' : ''}${isTarget ? ', היעד' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.012, duration: 0.5, ease: EASE }}
                  className={`group relative flex aspect-square select-none flex-col justify-between rounded-[2px] border p-[clamp(3px,1vw,6px)] text-right transition-[background-color,color,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isActive
                      ? 'z-[3] cursor-default border-foreground bg-foreground text-background shadow-lg'
                      : isUsed
                        ? 'cursor-not-allowed border-border/70 bg-surface-3 text-muted-foreground'
                        : 'cursor-pointer border-border bg-surface-1 text-foreground shadow-sm hover:border-foreground/60'
                  }`}
                >
                  {isDup && <span key={state.dupId} className="animate-dup-flash absolute inset-0 rounded-[2px] border border-foreground" aria-hidden="true" />}
                  {isTarget && (
                    <span className="pointer-events-none absolute inset-[-1px] rounded-[2px] border-2" style={{ borderColor: 'hsl(var(--gold))' }} aria-hidden="true">
                      <span className="label-mono absolute -top-[0.55rem] left-1/2 -translate-x-1/2 bg-surface-1 px-1" style={{ color: 'hsl(var(--gold))' }}>יעד</span>
                    </span>
                  )}

                  <span className="flex items-start justify-between" aria-hidden="true">
                    <span className={`num-mono leading-none ${isActive ? 'text-background/60' : 'text-muted-foreground/70'}`} style={{ fontSize: 'clamp(0.48rem, 1.3vw, 0.6rem)' }} dir="ltr">
                      {pad2(i + 1)}
                    </span>
                    {order && (
                      <span className={`num-mono leading-none ${isActive ? 'text-background' : 'text-foreground/70'}`} style={{ fontSize: 'clamp(0.48rem, 1.3vw, 0.6rem)' }} dir="ltr">
                        {order}
                      </span>
                    )}
                  </span>

                  <span aria-hidden="true" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[clamp(2px,0.6vw,5px)]">
                    <Glyph
                      i={i}
                      size="100%"
                      strokeWidth={isActive ? 1.8 : undefined}
                      className={`aspect-square transition-opacity duration-300 ${isUsed ? 'opacity-40' : ''}`}
                      style={{ width: showName ? 'clamp(20px, 6.4vw, 36px)' : 'clamp(28px, 10vw, 54px)', height: 'auto' }}
                    />
                    {showName && (
                      <span
                        className={`block max-w-full truncate text-center leading-none font-light ${isActive ? 'text-background/75' : 'text-muted-foreground'}`}
                        style={{ fontSize: 'clamp(0.56rem, 2.3vw, 0.76rem)' }}
                      >
                        {item.l}
                      </span>
                    )}
                  </span>

                  <span className="flex h-[2px] gap-[2px]" aria-hidden="true">
                    {levels.map((lv, k) => <span key={k} className="h-full flex-1" style={{ background: levelColor(lv) }} />)}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {state.paused && (
              <motion.div
                key="veil"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute inset-0 z-[40] flex flex-col items-center justify-center gap-4 rounded-[2px] px-6 text-center backdrop-blur-md"
                style={{ background: 'hsl(var(--background) / 0.82)' }}
                role="dialog"
                aria-label="השעון עצור"
              >
                <p className="label-mono">השעון עצור</p>
                <p className="num-mono text-4xl font-light" dir="ltr">{formatTime(state.timeLeft)}</p>
                <button onClick={onResume} className="btn btn-primary h-12 px-10 text-base" autoFocus>המשך</button>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                  <button onClick={onFinish} className="btn btn-text h-9 text-sm">סיים עכשיו וראה תוצאות</button>
                  <button onClick={onMenu} className="btn btn-text h-9 text-sm">חזרה לדף הבית</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-2.5 h-5 text-center text-[0.8rem] text-muted-foreground">
          <AnimatePresence mode="wait" initial={false}>
            {chainToast ? (
              <motion.p
                key={`chain${chainToast.id}`}
                role="status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                style={{ color: 'hsl(var(--chain))' }}
              >
                {chainToast.count === 1 ? 'נחשף חיבור שרשרת' : `נחשפו ${chainToast.count} חיבורי שרשרת`}
              </motion.p>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                {daily
                  ? state.path.length === daily.links
                    ? <>הקשר האחרון חייב להגיע אל <span className="text-foreground">{ITEMS[daily.target].l}</span></>
                    : <>מ<span className="text-foreground">{ITEMS[state.currentCard].l}</span> אל <span className="text-foreground">{ITEMS[daily.target].l}</span>, נותרו <span className="num-mono" dir="ltr">{daily.links - state.directConns.length}</span> קשרים</>
                  : state.currentCard === -1
                    ? 'בחרו מילה ראשונה כדי לפתוח את השרשרת'
                    : <>מ<span className="text-foreground">{ITEMS[state.currentCard].l}</span> אל המילה הבאה <span className="num-mono mr-1" dir="ltr">{pad2(state.path.length)}/{TOTAL_CARDS}</span></>}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Reading, compact (phones and tablets) */}
      <section className="panel relative mb-[max(0.75rem,env(safe-area-inset-bottom))] flex-shrink-0 overflow-hidden lg:hidden" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          {lastEval ? (
            <motion.div
              key={lastEval.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 items-baseline gap-2.5">
                  <span className="text-lg font-light" style={{ color: levelColor(lastEval.ev.lv) }}>{LEVEL_NAMES[lastEval.ev.lv]}</span>
                  <span className="flex min-w-0 items-center gap-1.5 truncate text-base">
                    <Glyph i={lastEval.a} size={18} />{ITEMS[lastEval.a].l} <span className="text-muted-foreground">·</span> <Glyph i={lastEval.b} size={18} />{ITEMS[lastEval.b].l}
                  </span>
                </div>
                <span className="num-mono text-lg font-light" style={{ color: levelColor(lastEval.ev.lv) }} dir="ltr">+{lastEval.ev.sc}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="truncate text-[0.82rem]" style={{ color: levelColor(lastEval.ev.lv) }}>{lastEval.ev.sub.replace(/^[^—]*—\s*/, '')}</span>
                {isNewSecret && (
                  <span className="label-mono border px-1.5 py-px" style={{ color: levelColor('s'), borderColor: levelColor('s', 0.45) }}>
                    סוד חדש נחשף
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-[0.84rem] leading-relaxed text-foreground/85"><Rich text={lastEval.ev.insight ?? lastEval.ev.exp} /></p>
              <button type="button" onClick={() => setSheetOpen(true)} className="label-mono link-draw mt-1.5">
                קריאה מלאה{alternatives > 0 ? ` · עוד ${alternatives} קריאות` : ''}
              </button>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 py-4 text-center text-sm text-muted-foreground">
              בחרו <span className="text-foreground">שתי מילים</span> כדי לגלות את הקשר ביניהן
            </motion.div>
          )}
        </AnimatePresence>

        {recent.length > 0 && (
          <ul className="scrollbar-none flex gap-4 overflow-x-auto border-t border-border px-4 py-2" aria-label="קשרים אחרונים">
            {recent.map(c => (
              <motion.li
                key={c.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-shrink-0 items-baseline gap-1.5 whitespace-nowrap text-[0.75rem]"
              >
                <span className={c.isChain ? 'text-muted-foreground' : ''}>{ITEMS[c.a].l}·{ITEMS[c.b].l}</span>
                <span dir="ltr" className="num-mono text-[0.66rem]" style={{ color: c.isChain ? 'hsl(var(--chain))' : levelColor(c.ev.lv) }}>
                  +{c.isChain ? c.bonus : c.ev.sc}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </div>

      {/* Reading, full (desktop side panel) */}
      <aside className="panel hidden min-h-0 flex-col overflow-hidden lg:flex" aria-live="polite" aria-label="הקשר האחרון">
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait" initial={false}>
            {lastEval ? (
              <motion.div key={lastEval.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                {isNewSecret && (
                  <p className="label-mono mb-4 w-fit border px-1.5 py-px" style={{ color: levelColor('s'), borderColor: levelColor('s', 0.45) }}>סוד חדש נחשף</p>
                )}
                {panel}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="label-mono">קריאה</p>
                <h2 className="mt-2 text-[2rem] font-thin leading-tight">כאן יופיע הקשר</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  בחרו שתי מילים. לכל חיבור תופיע קריאה מלאה: הדרגה, ההסבר, למה זו הדרגה, וקריאות נוספות אם התכוונתם למשהו אחר.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {recent.length > 0 && (
          <div className="border-t border-border px-6 py-3">
            <p className="label-mono mb-1.5">קשרים אחרונים</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {recent.map(c => (
                <li key={c.key} className="flex items-baseline gap-1.5 whitespace-nowrap text-[0.75rem]">
                  <span className={c.isChain ? 'text-muted-foreground' : ''}>{ITEMS[c.a].l}·{ITEMS[c.b].l}</span>
                  <span dir="ltr" className="num-mono text-[0.66rem]" style={{ color: c.isChain ? 'hsl(var(--chain))' : levelColor(c.ev.lv) }}>+{c.isChain ? c.bonus : c.ev.sc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <Dialog open={sheetOpen && !!lastEval} onOpenChange={setSheetOpen}>
        <DialogContent
          dir="rtl"
          className="bottom-0 left-0 top-auto max-h-[88dvh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-x-0 border-b-0 bg-surface-1 p-5 pt-12 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-right data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:rounded-none"
        >
          <DialogTitle className="sr-only">קריאה מלאה של הקשר</DialogTitle>
          {panel}
        </DialogContent>
      </Dialog>

    </div>
  );
}

function Figure({ label, children, divider, role, ariaLabel }: { label: string; children: React.ReactNode; divider?: boolean; role?: string; ariaLabel?: string }) {
  return (
    <div role={role} aria-label={ariaLabel} className={`flex min-w-0 flex-col justify-between gap-1.5 px-3 py-2.5 sm:px-4 ${divider ? 'border-r border-border' : ''}`}>
      <span className="label-mono">{label}</span>
      {children}
    </div>
  );
}

function MilestoneTrack({ total, current, next }: { total: number; current: Milestone | undefined; next: Milestone | undefined }) {
  const pct = Math.min(100, (total / TRACK_MAX) * 100);
  return (
    <div className="px-3 pb-2.5 pt-2 sm:px-4">
      <div className="relative h-[3px] bg-surface-3" role="progressbar" aria-label="התקדמות באבני הדרך" aria-valuenow={total} aria-valuemin={0} aria-valuemax={TRACK_MAX}>
        <motion.div
          className="absolute inset-y-0 right-0 bg-foreground"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
        {MILESTONES.map(m => (
          <span
            key={m.pts}
            className={`absolute -top-[3px] h-[9px] w-px ${m.pts <= total ? 'bg-foreground' : 'bg-foreground/30'}`}
            style={{ right: `${(m.pts / TRACK_MAX) * 100}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="label-mono">{current?.lbl ?? 'התחלה'}</span>
        <span className="label-mono">{next ? <>הבא · {next.lbl} · <span dir="ltr">{next.pts}</span></> : 'מאסטר'}</span>
      </div>
    </div>
  );
}
