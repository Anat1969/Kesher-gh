import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ITEMS, LEVEL_NAMES, LEVEL_BG_CLASSES, LEVEL_ORDER, SCORE_VALUES, CHAIN_RATIO, MILESTONES,
  levelColor, type Milestone,
} from '../game/gameItems';
import type { GameState } from '../game/engine';
import { GAME_DURATION, TOTAL_CARDS } from '../game/engine';
import { isHandCraftedSecret, pairKey, suggestConnectionTypes } from '../game/evaluator';
import type { Settings } from '../lib/storage';
import ConnectionLines from './ConnectionLines';
import PauseDialog from './PauseDialog';
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
}

const COLS = 5;
const TRACK_MAX = MILESTONES[MILESTONES.length - 1].pts;

function formatTime(t: number) {
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

export default function GameScreen({
  state, totalScore, currentMilestone, nextMilestone, settings, knownSecrets,
  onPick, onPause, onResume, onFinish, onMenu, onSettings,
}: GameScreenProps) {
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [chainToast, setChainToast] = useState<{ count: number; id: number } | null>(null);

  const { lastEval } = state;
  const isUrgent = state.timeLeft <= 30;
  const timeFraction = state.timeLeft / GAME_DURATION;

  // Collapse the explanation and surface chain discoveries on every new connection.
  useEffect(() => {
    if (!lastEval) return;
    setExpanded(false);
    if (state.pendingChains.length === 0) return;
    setChainToast({ count: state.pendingChains.length, id: lastEval.id });
    const t = setTimeout(() => setChainToast(null), 2400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per connection
  }, [lastEval?.id]);

  const dotsFor = (idx: number) => state.directConns.filter(c => c.a === idx || c.b === idx).map(c => c.ev.lv);

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

  const sodSuggestions = lastEval?.ev.lv === 's' ? suggestConnectionTypes(lastEval.a, lastEval.b) : [];
  const isNewSecret = !!lastEval && isHandCraftedSecret(lastEval.a, lastEval.b) && !knownSecrets.has(pairKey(lastEval.a, lastEval.b));

  const recent = [
    ...state.directConns.map((c, i) => ({ ...c, key: `d${i}` })),
    ...state.chainConns.map((c, i) => ({ ...c, key: `c${i}` })),
  ].reverse().slice(0, 10);

  return (
    <div
      className="mx-auto flex w-full max-w-[680px] flex-col gap-2.5 overflow-hidden px-3 pt-3"
      style={{ height: 'calc(100dvh - var(--bar-h) - env(safe-area-inset-top))' }}
    >
      {/* HUD */}
      <section className="panel flex-shrink-0 px-3 py-2.5 sm:px-4" aria-label="מצב המשחק">
        <div className="flex items-center gap-3">
          <Timer timeLeft={state.timeLeft} fraction={timeFraction} urgent={isUrgent} />

          <div className="min-w-0 flex-1">
            <div className="label-mono">ניקוד</div>
            <AnimatedNumber value={totalScore} className="display-num block text-[2.6rem] text-foreground" />
          </div>

          <dl className="flex gap-4 text-center">
            <div>
              <dt className="label-mono">קשרים</dt>
              <dd className="display-num mt-1 text-2xl" dir="ltr">{state.directConns.length}</dd>
            </div>
            <div>
              <dt className="label-mono">שרשרת</dt>
              <dd className="display-num mt-1 text-2xl text-chain" dir="ltr">+{state.chainScore}</dd>
            </div>
          </dl>

          <button onClick={onPause} className="btn btn-ghost h-10 px-3 text-sm" aria-label="השהיה ותפריט">השהיה</button>
        </div>

        <MilestoneTrack total={totalScore} current={currentMilestone} next={nextMilestone} />
      </section>

      {/* Legend */}
      <div className="flex flex-shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1" aria-label="רמות קשר וניקוד">
        {LEVEL_ORDER.map(lv => (
          <span key={lv} className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_BG_CLASSES[lv]}`} />
            <span className="text-[0.78rem] font-medium" style={{ color: levelColor(lv) }}>{LEVEL_NAMES[lv]}</span>
            <span className="font-mono text-[0.68rem] text-muted-foreground">{SCORE_VALUES[lv]}</span>
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-[2px] w-3 border-t border-dashed border-chain" />
          <span className="text-[0.78rem] font-medium text-chain">שרשרת</span>
          <span className="font-mono text-[0.68rem] text-muted-foreground" dir="ltr">{Math.round(CHAIN_RATIO * 100)}%</span>
        </span>
      </div>

      {/* Board */}
      <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        <div
          className="well relative w-full p-[clamp(6px,2vw,12px)]"
          style={{ maxWidth: 'min(540px, calc((100dvh - var(--bar-h) - 23rem) * 1.02))', minWidth: '268px' }}
        >
          <ConnectionLines directConns={state.directConns} chainConns={state.chainConns} newestId={lastEval?.id ?? 0} />

          <div
            role="group"
            aria-label="כרטיסי המשחק"
            onKeyDown={onGridKey}
            className="relative z-[2] grid grid-cols-5"
            style={{ gap: 'clamp(5px, 1.6vw, 10px)' }}
          >
            {ITEMS.map((item, i) => {
              const isActive = state.currentCard === i;
              const inChain = state.path.includes(i);
              const isUsed = inChain && !isActive;
              const isDup = state.dupCard === i;
              const order = inChain ? state.path.indexOf(i) + 1 : null;
              const dots = dotsFor(i);

              return (
                <motion.button
                  key={i}
                  ref={el => (cardRefs.current[i] = el)}
                  data-card={i}
                  type="button"
                  onClick={() => onPick(i)}
                  aria-pressed={isActive}
                  aria-disabled={isUsed}
                  aria-label={`${item.l}${order ? `, מקום ${order} בשרשרת` : ''}${isActive ? ', הכרטיס הנוכחי' : ''}`}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: isActive ? -4 : isUsed ? 2 : 0, scale: isActive ? 1.07 : 1 }}
                  whileHover={isUsed || isActive ? undefined : { y: -3 }}
                  whileTap={isUsed ? undefined : { scale: 0.94, y: 1 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 30, opacity: { delay: i * 0.015 }, y: { delay: 0 } }}
                  className={`relative flex aspect-square select-none flex-col items-center justify-center rounded-[6px] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isActive ? 'animate-head-pulse z-[3] cursor-default border-foreground' : isUsed ? 'cursor-not-allowed border-transparent' : 'cursor-pointer border-border'
                  }`}
                  style={{
                    background: isUsed
                      ? 'linear-gradient(180deg, hsl(var(--surface-3) / 0.55), hsl(var(--surface-2) / 0.35))'
                      : 'linear-gradient(160deg, hsl(var(--surface-1)), hsl(var(--surface-2)))',
                    boxShadow: isActive
                      ? '0 1px 0 hsl(var(--hi) / 0.9) inset, 0 4px 0 hsl(var(--edge)), 0 18px 30px -10px hsl(var(--shade) / 0.45)'
                      : isUsed
                        ? 'inset 0 1px 3px hsl(var(--shade) / 0.12)'
                        : '0 1px 0 hsl(var(--hi) / 0.9) inset, 0 3px 0 hsl(var(--edge)), 0 6px 12px -6px hsl(var(--shade) / 0.25)',
                  }}
                >
                  {isDup && <span key={state.dupId} className="animate-dup-flash absolute inset-0 rounded-[6px] border-2 border-foreground/60" aria-hidden="true" />}
                  <span className="absolute right-[4px] top-[4px] flex max-w-[18px] flex-wrap gap-[2px]" aria-hidden="true">
                    {dots.map((lv, di) => <span key={di} className={`h-[4px] w-[4px] rounded-full ${LEVEL_BG_CLASSES[lv]}`} />)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="leading-none transition-[filter,opacity] duration-300"
                    style={{ fontSize: 'clamp(1.2rem, 5vw, 1.9rem)', filter: isUsed ? 'grayscale(0.75)' : undefined, opacity: isUsed ? 0.5 : 1 }}
                  >
                    {item.e}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`mt-[4px] max-w-full truncate px-0.5 font-medium ${isUsed ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}
                    style={{ fontSize: 'clamp(0.52rem, 1.7vw, 0.68rem)' }}
                  >
                    {item.l}
                  </span>
                  {order && (
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-[3px] left-[5px] font-mono leading-none ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
                      style={{ fontSize: 'clamp(0.5rem, 1.3vw, 0.62rem)' }}
                    >
                      {order}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {chainToast && (
              <motion.div
                key={chainToast.id}
                role="status"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute left-1/2 top-2 z-[30] -translate-x-1/2 whitespace-nowrap rounded-full border border-chain/40 px-4 py-1.5 text-sm font-medium text-chain backdrop-blur-md"
                style={{ background: 'hsl(var(--surface-1) / 0.85)', boxShadow: 'var(--shadow-md)' }}
              >
                {chainToast.count === 1 ? 'נחשף חיבור שרשרת' : `נחשפו ${chainToast.count} חיבורי שרשרת`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-2 text-center text-[0.78rem] text-muted-foreground">
          {state.currentCard === -1
            ? 'בחרו כרטיס ראשון כדי לפתוח את השרשרת'
            : <>הכרטיס הנוכחי: <span className="font-medium text-foreground">{ITEMS[state.currentCard].l}</span>. בחרו את הבא <span className="font-mono" dir="ltr">{state.path.length}/{TOTAL_CARDS}</span></>}
        </p>
      </main>

      {/* Evaluation sheet */}
      <section
        className="panel relative mb-[max(0.75rem,env(safe-area-inset-bottom))] flex-shrink-0 overflow-hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait" initial={false}>
          {lastEval ? (
            <motion.div
              key={lastEval.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative px-4 py-3"
            >
              <span className="absolute inset-y-0 right-0 w-1" style={{ background: levelColor(lastEval.ev.lv) }} />
              <div className="flex items-start gap-3">
                <div className="flex flex-shrink-0 flex-col items-center gap-1 pt-0.5">
                  <div className="flex items-center gap-1 text-[1.6rem] leading-none" aria-hidden="true">
                    <span>{ITEMS[lastEval.a].e}</span>
                    <span className="h-px w-3" style={{ background: levelColor(lastEval.ev.lv) }} />
                    <span>{ITEMS[lastEval.b].e}</span>
                  </div>
                  <div className="display-num text-3xl" style={{ color: levelColor(lastEval.ev.lv) }} dir="ltr">+{lastEval.ev.sc}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-xl font-light" style={{ color: levelColor(lastEval.ev.lv) }}>{LEVEL_NAMES[lastEval.ev.lv]}</span>
                    {isNewSecret && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-full border px-2 py-0.5 text-[0.7rem] font-medium"
                        style={{ color: levelColor('s'), borderColor: levelColor('s', 0.4), background: levelColor('s', 0.08) }}
                      >
                        סוד חדש נחשף
                      </motion.span>
                    )}
                    <span className="sr-only">{ITEMS[lastEval.a].l} ו{ITEMS[lastEval.b].l}:</span>
                    <span className="truncate text-[0.78rem] text-muted-foreground">{lastEval.ev.sub}</span>
                  </div>
                  {sodSuggestions.length > 0 && (
                    <div className="mb-1 flex flex-wrap items-center gap-1">
                      <span className="label-mono">אולי חשבתם על</span>
                      {sodSuggestions.map(s => (
                        <span key={s} className="rounded-full border px-1.5 py-0.5 text-[0.65rem]"
                          style={{ borderColor: levelColor('s', 0.25), color: levelColor('s'), background: levelColor('s', 0.06) }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpanded(v => !v)}
                    aria-expanded={expanded}
                    className="w-full rounded text-right text-[0.82rem] leading-relaxed text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className={expanded ? '' : 'line-clamp-2'}>{lastEval.ev.exp}</span>
                    <span className="label-mono mt-0.5 block">{expanded ? 'צמצום' : 'קריאה מלאה'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 py-4 text-center text-sm text-muted-foreground">
              לחצו על <span className="font-medium text-foreground">שני כרטיסים</span> כדי לגלות את הקשר ביניהם
            </motion.div>
          )}
        </AnimatePresence>

        {recent.length > 0 && (
          <ul className="scrollbar-none flex gap-1.5 overflow-x-auto border-t border-border px-3 py-2" aria-label="קשרים אחרונים">
            {recent.map(c => (
              <motion.li
                key={c.key}
                layout
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-shrink-0 items-center gap-1 rounded border bg-surface-1 px-2 py-0.5 ${c.isChain ? 'border-dashed border-chain/50' : 'border-border'}`}
              >
                <span className="text-[0.9rem]" aria-label={`${ITEMS[c.a].l} ו${ITEMS[c.b].l}`}>{ITEMS[c.a].e}{ITEMS[c.b].e}</span>
                <span dir="ltr" className="font-mono text-[0.66rem]" style={{ color: c.isChain ? 'hsl(var(--chain))' : levelColor(c.ev.lv) }}>
                  +{c.isChain ? c.bonus : c.ev.sc}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      {/* Score popup */}
      <AnimatePresence>
        {lastEval && (
          <motion.div
            key={`pop${lastEval.id}`}
            aria-hidden="true"
            className="display-num pointer-events-none fixed left-1/2 top-[42%] z-[60] text-6xl"
            style={{ color: levelColor(lastEval.ev.lv), textShadow: `0 0 28px ${levelColor(lastEval.ev.lv, 0.55)}`, x: '-50%' }}
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: [0, -16, -60, -90], scale: [0.7, 1.15, 1, 0.9] }}
            transition={{ duration: 1.3, times: [0, 0.15, 0.8, 1], ease: 'easeOut' }}
            dir="ltr"
          >
            +{lastEval.ev.sc}
          </motion.div>
        )}
      </AnimatePresence>

      <PauseDialog open={state.paused} settings={settings} onResume={onResume} onFinish={onFinish} onMenu={onMenu} onSettings={onSettings} />
    </div>
  );
}

function Timer({ timeLeft, fraction, urgent }: { timeLeft: number; fraction: number; urgent: boolean }) {
  return (
    <div className="relative grid h-[58px] w-[58px] flex-shrink-0 place-items-center" role="timer" aria-label={`זמן שנותר ${formatTime(timeLeft)}`}>
      <div className="well absolute inset-[5px] rounded-full" />
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden="true">
        {Array.from({ length: 30 }, (_, k) => {
          const a = (k / 30) * Math.PI * 2;
          return <line key={k} x1={20 + Math.cos(a) * 18.6} y1={20 + Math.sin(a) * 18.6} x2={20 + Math.cos(a) * 19.6} y2={20 + Math.sin(a) * 19.6} strokeWidth={0.6} style={{ stroke: 'hsl(var(--border))' }} />;
        })}
        <circle cx="20" cy="20" r="17" fill="none" strokeWidth="1.6" style={{ stroke: 'hsl(var(--border))' }} />
        <circle
          cx="20" cy="20" r="17" fill="none" strokeWidth={urgent ? 2.6 : 1.8} strokeLinecap="round"
          pathLength={100} strokeDasharray={`${fraction * 100} 100`}
          className="transition-[stroke-dasharray] duration-1000 ease-linear"
          style={{ stroke: 'hsl(var(--foreground))' }}
        />
      </svg>
      <span dir="ltr" className={`relative font-mono text-[0.82rem] font-medium tabular-nums text-foreground ${urgent ? 'animate-blink' : ''}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}

function MilestoneTrack({ total, current, next }: { total: number; current: Milestone | undefined; next: Milestone | undefined }) {
  const pct = Math.min(100, (total / TRACK_MAX) * 100);
  return (
    <div className="mt-2.5">
      <div
        className="well relative h-2 overflow-visible rounded-full"
        role="progressbar"
        aria-label="התקדמות באבני הדרך"
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={TRACK_MAX}
      >
        <motion.div
          className="absolute inset-y-0 right-0 rounded-full"
          style={{ background: 'linear-gradient(270deg, hsl(var(--foreground) / 0.55), hsl(var(--foreground)))' }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        {MILESTONES.map(m => (
          <span
            key={m.pts}
            className={`absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full ${m.pts <= total ? 'bg-background' : 'bg-foreground/25'}`}
            style={{ right: `${(m.pts / TRACK_MAX) * 100}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="label-mono">{current?.lbl ?? 'התחלה'}</span>
        <span className="label-mono">{next ? <>הבא: {next.lbl} <span dir="ltr">{next.pts}</span></> : 'מאסטר'}</span>
      </div>
    </div>
  );
}
