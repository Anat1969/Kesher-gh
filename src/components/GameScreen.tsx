import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Pause, Volume2, VolumeX } from 'lucide-react';
import {
  ITEMS, LEVEL_NAMES, LEVEL_CSS_CLASSES, LEVEL_BG_CLASSES, LEVEL_ORDER, SCORE_VALUES, CHAIN_RATIO,
  levelColor, type Milestone,
} from '../game/gameItems';
import type { GameState } from '../game/engine';
import { GAME_DURATION, TOTAL_CARDS } from '../game/engine';
import { isHandCraftedSecret, pairKey, suggestConnectionTypes } from '../game/evaluator';
import type { Settings } from '../lib/storage';
import ConnectionLines from './ConnectionLines';
import PauseDialog from './PauseDialog';

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

function formatTime(t: number) {
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function Stat({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className="text-center min-w-[2.75rem]">
      <div className="text-[0.6rem] text-muted-foreground tracking-wider">{label}</div>
      <div className={`font-display font-bold leading-none tabular-nums ${className}`} dir="ltr">{children}</div>
    </div>
  );
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
    const t = setTimeout(() => setChainToast(null), 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per connection
  }, [lastEval?.id]);

  const prevPts = currentMilestone?.pts ?? 0;
  const milestonePercent = nextMilestone
    ? Math.min(100, Math.round(((totalScore - prevPts) / (nextMilestone.pts - prevPts)) * 100))
    : 100;

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

  const hint = state.currentCard === -1
    ? 'בחרו כרטיס ראשון לפתיחת השרשרת'
    : `${ITEMS[state.currentCard].e} ${ITEMS[state.currentCard].l} — בחרו את הכרטיס הבא · ${state.path.length}/${TOTAL_CARDS}`;

  const sodSuggestions = lastEval?.ev.lv === 's' ? suggestConnectionTypes(lastEval.a, lastEval.b) : [];
  const isNewSecret = !!lastEval && isHandCraftedSecret(lastEval.a, lastEval.b) && !knownSecrets.has(pairKey(lastEval.a, lastEval.b));

  const recent = [
    ...state.directConns.map((c, i) => ({ ...c, key: `d${i}` })),
    ...state.chainConns.map((c, i) => ({ ...c, key: `c${i}` })),
  ].reverse().slice(0, 8);

  return (
    <div dir="rtl" className="flex flex-col h-[100dvh] w-full max-w-[640px] mx-auto bg-background overflow-hidden sm:border-x sm:border-border">

      {/* ── HEADER ── */}
      <header className="flex-shrink-0 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 border-b border-border bg-surface-1">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={onPause}
              className="p-2 -m-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              aria-label="השהיה ותפריט"
            >
              <Pause className="w-5 h-5" />
            </button>
            <button
              onClick={() => onSettings({ sound: !settings.sound })}
              className="p-2 -m-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              aria-label={settings.sound ? 'השתקת צלילים' : 'הפעלת צלילים'}
              aria-pressed={settings.sound}
            >
              {settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="font-display text-xl font-bold text-gold-light tracking-widest mr-1 hidden min-[360px]:block">קֶשֶׁר</div>
          </div>
          <div className="flex items-center gap-3" aria-live="off">
            <Stat label="ניקוד" className="text-2xl text-gold-light">
              <span key={totalScore} className="inline-block animate-score-bump">{totalScore}</span>
            </Stat>
            <Stat label="שרשרת" className="text-xl text-chain">+{state.chainScore}</Stat>
            <Stat label="קשרים" className="text-2xl text-gold-light">{state.directConns.length}</Stat>
            <div
              className="relative w-11 h-11 grid place-items-center"
              role="timer"
              aria-label={`זמן שנותר ${formatTime(state.timeLeft)}`}
            >
              <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="16" fill="none" strokeWidth="2.5" style={{ stroke: 'hsl(var(--border))' }} />
                <circle
                  cx="18" cy="18" r="16" fill="none" strokeWidth="2.5" strokeLinecap="round"
                  pathLength={100} strokeDasharray={`${timeFraction * 100} 100`}
                  className="transition-[stroke-dasharray] duration-1000 ease-linear"
                  style={{ stroke: isUrgent ? 'hsl(var(--destructive))' : 'hsl(var(--gold))' }}
                />
              </svg>
              <span
                dir="ltr"
                className={`font-display text-[0.8rem] font-bold tabular-nums ${isUrgent ? 'text-destructive animate-blink' : 'text-foreground'}`}
              >
                {formatTime(state.timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Milestone progress */}
        <div className="flex items-center gap-2">
          <div
            className="flex-1 h-1 bg-border rounded-full overflow-hidden"
            role="progressbar"
            aria-label="התקדמות לאבן הדרך הבאה"
            aria-valuenow={milestonePercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${milestonePercent}%`, background: 'linear-gradient(270deg, hsl(var(--level-pshat)), hsl(var(--level-sod)))' }}
            />
          </div>
          <span className="font-display text-[0.7rem] font-bold text-gold-light whitespace-nowrap">
            {nextMilestone ? `${currentMilestone?.lbl ?? 'התחלה'} ← ${nextMilestone.lbl}` : '🏆 מאסטר!'}
          </span>
        </div>
      </header>

      {/* ── LEVEL LEGEND ── */}
      <div className="flex-shrink-0 flex items-center justify-center flex-wrap gap-x-3 gap-y-1 px-3 py-1.5 border-b border-border bg-surface-1/70" aria-label="רמות קשר וניקוד">
        {LEVEL_ORDER.map(lv => (
          <div key={lv} className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${LEVEL_BG_CLASSES[lv]}`} />
            <span className={`font-display text-[0.72rem] font-bold ${LEVEL_CSS_CLASSES[lv]}`}>{LEVEL_NAMES[lv]}</span>
            <span className={`text-[0.65rem] font-bold ${LEVEL_CSS_CLASSES[lv]} opacity-70`}>{SCORE_VALUES[lv]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-chain" />
          <span className="font-display text-[0.72rem] font-bold text-chain">שרשרת</span>
          <span className="text-[0.65rem] font-bold text-chain opacity-70" dir="ltr">×{Math.round(CHAIN_RATIO * 100)}%</span>
        </div>
      </div>

      {/* ── GRID ── */}
      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden px-2 py-2 min-h-0">
        <ConnectionLines
          directConns={state.directConns}
          chainConns={state.chainConns}
          newestId={lastEval?.id ?? 0}
        />

        <div
          role="group"
          aria-label="כרטיסי המשחק"
          onKeyDown={onGridKey}
          className="grid grid-cols-5 relative z-[2] w-full max-w-[min(480px,calc((100dvh-22rem)*1.05))] min-w-[260px]"
          style={{ gap: 'clamp(4px, 1.5vw, 8px)' }}
        >
          {ITEMS.map((item, i) => {
            const isActive = state.currentCard === i;
            const inChain = state.path.includes(i);
            const isUsed = inChain && !isActive;
            const isDup = state.dupCard === i;
            const order = inChain ? state.path.indexOf(i) + 1 : null;
            const dots = dotsFor(i);

            return (
              <button
                key={i}
                ref={el => (cardRefs.current[i] = el)}
                data-card={i}
                type="button"
                onClick={() => onPick(i)}
                aria-pressed={isActive}
                aria-disabled={isUsed}
                aria-label={`${item.l}${order ? `, מקום ${order} בשרשרת` : ''}${isActive ? ', הכרטיס הנוכחי' : ''}`}
                style={{ animationDelay: `${i * 18}ms` }}
                className={`card-enter aspect-square rounded-xl flex flex-col items-center justify-center relative select-none border
                  transition-[transform,background-color,border-color,opacity,box-shadow] duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  ${isActive
                    ? 'border-gold-light bg-gold-light/[0.13] scale-[1.07] shadow-[0_0_18px_hsl(var(--gold-light)/0.3)] cursor-default'
                    : isUsed
                      ? 'bg-background/60 border-border/25 opacity-50 cursor-not-allowed'
                      : 'bg-surface-2 border-border hover:border-gold/50 hover:bg-surface-3 hover:-translate-y-0.5 active:scale-95 cursor-pointer'
                  }
                `}
              >
                {/* Keyed by dupId so the flash replays on every repeated tap. */}
                {isDup && <span key={state.dupId} className="absolute inset-0 rounded-xl border border-transparent animate-dup-flash" aria-hidden="true" />}
                <span className="absolute top-[3px] right-[3px] flex gap-[2px] flex-wrap max-w-[16px]" aria-hidden="true">
                  {dots.map((lv, di) => (
                    <span key={di} className={`w-[4px] h-[4px] rounded-full ${LEVEL_BG_CLASSES[lv]}`} />
                  ))}
                </span>
                <span style={{ fontSize: 'clamp(1.15rem, 4.8vw, 1.75rem)' }} className="leading-none" aria-hidden="true">{item.e}</span>
                <span style={{ fontSize: 'clamp(0.5rem, 1.7vw, 0.62rem)' }} className="text-muted-foreground font-medium mt-[3px] truncate max-w-full px-0.5" aria-hidden="true">
                  {item.l}
                </span>
                {order && (
                  <span
                    className={`absolute bottom-0.5 left-1 font-display leading-none font-bold ${isActive ? 'text-gold-light' : 'text-primary'}`}
                    style={{ fontSize: 'clamp(0.5rem, 1.3vw, 0.65rem)' }}
                    aria-hidden="true"
                  >
                    {order}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {chainToast && (
          <div
            key={chainToast.id}
            role="status"
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-chain/15 border border-chain/40 rounded-full px-4 py-1.5 text-sm font-bold text-chain z-[300] backdrop-blur-md whitespace-nowrap animate-in fade-in slide-in-from-top-3 duration-300"
          >
            ⛓ {chainToast.count === 1 ? 'חיבור שרשרת חדש!' : `${chainToast.count} חיבורי שרשרת!`}
          </div>
        )}

        <p className="mt-2 z-[5] text-[0.72rem] text-muted-foreground text-center px-2">{hint}</p>
      </main>

      {/* ── EVALUATION PANEL ── */}
      <section
        className="flex-shrink-0 border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)]"
        aria-live="polite"
        aria-atomic="true"
      >
        {lastEval ? (
          <div key={lastEval.id} className="px-3 py-2 animate-eval-in">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                <div className="text-2xl leading-none mb-0.5" aria-hidden="true">
                  {ITEMS[lastEval.a].e}{ITEMS[lastEval.b].e}
                </div>
                <div className="font-display text-xl font-black" style={{ color: levelColor(lastEval.ev.lv) }} dir="ltr">
                  +{lastEval.ev.sc}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full font-display text-[0.75rem] font-bold border"
                    style={{
                      background: levelColor(lastEval.ev.lv, 0.13),
                      color: levelColor(lastEval.ev.lv),
                      borderColor: levelColor(lastEval.ev.lv, 0.3),
                    }}
                  >
                    {LEVEL_NAMES[lastEval.ev.lv]}
                  </span>
                  {isNewSecret && (
                    <span className="text-[0.68rem] font-bold text-level-sod animate-in zoom-in duration-300">✨ סוד חדש נחשף!</span>
                  )}
                  <span className="sr-only">{ITEMS[lastEval.a].l} ו{ITEMS[lastEval.b].l}:</span>
                  <span className="text-[0.7rem] text-muted-foreground truncate">{lastEval.ev.sub}</span>
                </div>
                {sodSuggestions.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-1 items-center">
                    <span className="text-[0.62rem] text-muted-foreground">אולי חשבתם על:</span>
                    {sodSuggestions.map(s => (
                      <span
                        key={s}
                        className="text-[0.62rem] px-1.5 py-0.5 rounded-full border"
                        style={{ borderColor: levelColor('s', 0.25), color: levelColor('s', 0.85), background: levelColor('s', 0.06) }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded(v => !v)}
                  aria-expanded={expanded}
                  className="text-right w-full text-[0.74rem] leading-relaxed text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className={expanded ? '' : 'line-clamp-2'}>{lastEval.ev.exp}</span>
                  {!expanded && <span className="text-[0.65rem] text-gold-light/80"> הרחבה ▾</span>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 py-3 text-center text-muted-foreground text-sm">
            לחצו על <strong className="text-gold-light">שני כרטיסים</strong> כדי לגלות את הקשר ביניהם
          </div>
        )}

        {recent.length > 0 && (
          <ul className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-none" aria-label="קשרים אחרונים">
            {recent.map(c => (
              <li
                key={c.key}
                className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 border animate-log-in ${c.isChain ? 'border-chain/30' : 'border-border'}`}
              >
                <span className="text-[0.85rem]" aria-label={`${ITEMS[c.a].l} ו${ITEMS[c.b].l}`}>{ITEMS[c.a].e}{ITEMS[c.b].e}</span>
                <span dir="ltr" className={`font-display text-[0.65rem] font-bold ${c.isChain ? 'text-chain' : LEVEL_CSS_CLASSES[c.ev.lv]}`}>
                  +{c.isChain ? c.bonus : c.ev.sc}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── SCORE POPUP ── */}
      {lastEval && (
        <div
          key={`pop${lastEval.id}`}
          aria-hidden="true"
          className="fixed z-[2000] pointer-events-none font-display text-5xl font-black animate-score-float left-1/2 top-[38%]"
          style={{ color: levelColor(lastEval.ev.lv), textShadow: `0 0 24px ${levelColor(lastEval.ev.lv, 0.5)}, 0 2px 12px rgba(0,0,0,0.6)` }}
          dir="ltr"
        >
          +{lastEval.ev.sc}
        </div>
      )}

      <PauseDialog
        open={state.paused}
        settings={settings}
        onResume={onResume}
        onFinish={onFinish}
        onMenu={onMenu}
        onSettings={onSettings}
      />
    </div>
  );
}
