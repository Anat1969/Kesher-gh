import { useRef, useEffect, useCallback } from 'react';
import { ITEMS, LEVEL_COLORS, LEVEL_NAMES, LEVEL_CSS_CLASSES, LEVEL_BG_CLASSES, MILESTONES } from '../game/gameItems';
import type { Level } from '../game/gameItems';
import type { GameState } from '../hooks/useGameState';
import type { Connection } from '../game/personality';
import { suggestConnectionTypes } from '../game/evaluator';

interface GameScreenProps {
  state: GameState;
  totalScore: number;
  currentMilestone: typeof MILESTONES[number] | undefined;
  nextMilestone: typeof MILESTONES[number] | undefined;
  scorePopKey: number;
  scorePopRef: React.MutableRefObject<{ pts: number; lv: string; key: number } | null>;
  chainToast: { count: number; key: number } | null;
  onPick: (i: number) => void;
}

const LEVEL_LEGEND: { lv: Level; name: string; pts: string }[] = [
  { lv: 'p', name: 'פָּשָׁט', pts: '5' },
  { lv: 'r', name: 'רֶמֶז',  pts: '10' },
  { lv: 'd', name: 'דְּרָשׁ', pts: '18' },
  { lv: 's', name: 'סוֹד',   pts: '30' },
];

export default function GameScreen({ state, totalScore, currentMilestone, nextMilestone, scorePopKey, scorePopRef, chainToast, onPick }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef   = useRef<HTMLDivElement>(null);
  const areaRef   = useRef<HTMLDivElement>(null);

  const minutes  = Math.floor(state.timeLeft / 60);
  const seconds  = state.timeLeft % 60;
  const isUrgent = state.timeLeft <= 30;

  // Milestone progress
  let milestonePercent = 0;
  if (nextMilestone) {
    const prev = currentMilestone ? currentMilestone.pts : 0;
    milestonePercent = Math.min(100, Math.round(((totalScore - prev) / (nextMilestone.pts - prev)) * 100));
  } else {
    milestonePercent = 100;
  }

  const cardDots = useCallback((idx: number) =>
    state.directConns.filter(c => c.a === idx || c.b === idx).map(c => c.ev.lv),
    [state.directConns]
  );

  const redrawLines = useCallback(() => {
    const canvas = canvasRef.current;
    const area   = areaRef.current;
    if (!canvas || !area) return;
    canvas.width  = area.offsetWidth;
    canvas.height = area.offsetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cr = canvas.getBoundingClientRect();

    const drawLine = (a: number, b: number, lv: Level, isChain: boolean) => {
      const eA = document.getElementById('cd' + a);
      const eB = document.getElementById('cd' + b);
      if (!eA || !eB) return;
      const rA = eA.getBoundingClientRect();
      const rB = eB.getBoundingClientRect();
      const ax = rA.left + rA.width  / 2 - cr.left;
      const ay = rA.top  + rA.height / 2 - cr.top;
      const bx = rB.left + rB.width  / 2 - cr.left;
      const by = rB.top  + rB.height / 2 - cr.top;
      const mx = (ax + bx) / 2;
      const my = (ay + by) / 2 - 16;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(mx, my, bx, by);
      if (isChain) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(34,197,94,0.35)';
        ctx.lineWidth   = 1.3;
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = LEVEL_COLORS[lv] + '55';
        ctx.lineWidth   = 2;
      }
      ctx.stroke();
      ctx.setLineDash([]);
      if (!isChain) {
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fillStyle = LEVEL_COLORS[lv] + '80';
        ctx.fill();
      }
    };

    state.chainConns.forEach(c => drawLine(c.a, c.b, c.ev.lv, true));
    state.directConns.forEach(c => drawLine(c.a, c.b, c.ev.lv, false));
  }, [state.directConns, state.chainConns]);

  useEffect(() => {
    redrawLines();
    window.addEventListener('resize', redrawLines);
    return () => window.removeEventListener('resize', redrawLines);
  }, [redrawLines]);

  const allLogs = [
    ...state.directConns.map(c => ({ ...c, isChain: false as const })),
    ...state.chainConns.map(c => ({ ...c, isChain: true as const })),
  ].reverse();

  const sodSuggestions = state.lastEval?.ev.lv === 's'
    ? suggestConnectionTypes(state.lastEval.a, state.lastEval.b)
    : [];

  return (
    <div dir="rtl" className="flex flex-col h-screen bg-background overflow-hidden">

      {/* ── HEADER ── */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-border bg-surface-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="font-display text-xl font-bold text-gold-light tracking-widest">קֶשֶׁר</div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[0.52rem] text-muted-foreground uppercase tracking-widest">ניקוד</div>
              <div className="font-display text-2xl font-bold text-gold-light leading-none">{totalScore}</div>
            </div>
            <div className="text-center">
              <div className="text-[0.52rem] text-muted-foreground uppercase tracking-widest">שרשרת</div>
              <div className="font-display text-xl font-bold text-chain leading-none">+{state.chainScore}</div>
            </div>
            <div className="text-center">
              <div className="text-[0.52rem] text-muted-foreground uppercase tracking-widest">קשרים</div>
              <div className="font-display text-2xl font-bold text-gold-light leading-none">{state.directConns.length}</div>
            </div>
            <div className="text-center">
              <div className="text-[0.52rem] text-muted-foreground uppercase tracking-widest">זמן</div>
              <div className={`font-display text-2xl font-bold leading-none ${isUrgent ? 'text-destructive animate-blink' : 'text-muted-foreground'}`}>
                {minutes}:{seconds < 10 ? '0' : ''}{seconds}
              </div>
            </div>
          </div>
        </div>

        {/* Milestone progress */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[3px] bg-border rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${milestonePercent}%`, background: 'linear-gradient(90deg, hsl(var(--level-pshat)), hsl(var(--level-sod)))' }} />
          </div>
          <span className="font-display text-[0.65rem] font-bold text-gold-light whitespace-nowrap">
            {nextMilestone ? `${currentMilestone?.lbl || '—'} → ${nextMilestone.lbl}` : '🏆 מאסטר!'}
          </span>
        </div>
      </div>

      {/* ── LEVEL LEGEND BAR ── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 border-b border-border bg-surface-1/70">
        {LEVEL_LEGEND.map(l => (
          <div key={l.lv} className="flex items-center gap-1">
            <div className={`w-[6px] h-[6px] rounded-full ${LEVEL_BG_CLASSES[l.lv]}`} />
            <span className={`font-display text-[0.68rem] font-bold ${LEVEL_CSS_CLASSES[l.lv]}`}>{l.name}</span>
            <span className={`text-[0.6rem] font-bold ${LEVEL_CSS_CLASSES[l.lv]} opacity-70`}>{l.pts}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 mr-1">
          <div className="w-[6px] h-[6px] rounded-full bg-chain" />
          <span className="font-display text-[0.68rem] font-bold text-chain">שרשרת</span>
          <span className="text-[0.6rem] font-bold text-chain opacity-70">×40%</span>
        </div>
      </div>

      {/* ── GRID ── */}
      <div ref={areaRef} className="flex-1 relative flex flex-col items-center justify-center overflow-hidden px-2 py-1 min-h-0">
        <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none z-[1]" />

        {/* Hint */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-[5] text-[0.67rem] text-muted-foreground whitespace-nowrap">
          <span dangerouslySetInnerHTML={{ __html: state.hintText.replace(/(\p{Emoji_Presentation})/gu, '<strong class="text-gold-light">$1</strong>') }} />
        </div>

        <div ref={gridRef} className="grid grid-cols-5 relative z-[2] w-full max-w-[480px]"
          style={{ gap: 'clamp(4px, 1.5vw, 8px)' }}>
          {ITEMS.map((item, i) => {
            const isActive = state.currentCard === i;
            const isUsed   = state.usedCards.has(i) && !isActive;
            const isDup    = state.dupCard === i;
            const dots     = cardDots(i);
            const chainNum = (() => {
              if (!state.usedCards.has(i)) return null;
              if (i === state.currentCard) return state.chainOrder;
              for (let ci = 0; ci < state.directConns.length; ci++) {
                if (state.directConns[ci].a === i) return ci + 1;
              }
              return 1;
            })();

            return (
              <div
                key={i}
                id={'cd' + i}
                onClick={() => onPick(i)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-150 relative select-none border
                  ${isActive
                    ? 'border-gold-light bg-gold-light/[0.13] scale-[1.07] shadow-[0_0_14px_hsl(var(--gold-light)/0.22)] cursor-default'
                    : isUsed
                      ? 'bg-background/60 border-border/25 opacity-55 cursor-not-allowed'
                      : 'bg-surface-2 border-border active:scale-95'
                  }
                  ${isDup ? 'animate-dup-flash' : ''}
                `}
              >
                {/* Dots */}
                <div className="absolute top-[2px] right-[2px] flex gap-[2px] flex-wrap max-w-[14px]">
                  {dots.map((lv, di) => (
                    <div key={di} className={`w-[4px] h-[4px] rounded-full ${LEVEL_BG_CLASSES[lv]}`} />
                  ))}
                </div>
                <span style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.65rem)' }} className="leading-none">{item.e}</span>
                <span style={{ fontSize: 'clamp(0.42rem, 1.5vw, 0.54rem)' }} className="text-muted-foreground font-medium mt-[2px] truncate max-w-full px-0.5">{item.l}</span>
                {chainNum && (
                  <span className={`absolute bottom-0.5 left-0.5 font-display leading-none font-bold ${isActive ? 'text-gold-light' : 'text-primary'}`}
                    style={{ fontSize: 'clamp(0.45rem, 1.2vw, 0.6rem)' }}>
                    {chainNum}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── EVAL PANEL ── */}
      <div className="flex-shrink-0 border-t border-border bg-surface-1">
        {state.lastEval ? (() => {
          const ev    = state.lastEval!.ev;
          const color = LEVEL_COLORS[ev.lv];
          return (
            <div className="px-3 py-2">
              <div className="flex items-start gap-3">
                {/* Left: emojis + score */}
                <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                  <div className="text-2xl leading-none mb-0.5">
                    {ITEMS[state.lastEval!.a].e}{ITEMS[state.lastEval!.b].e}
                  </div>
                  <div className="font-display text-xl font-black" style={{ color }}>
                    +{ev.sc}
                  </div>
                </div>
                {/* Right: badge + explanation */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-display text-[0.72rem] font-bold border"
                      style={{ background: color + '22', color, borderColor: color + '44' }}
                    >
                      {LEVEL_NAMES[ev.lv]}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground truncate">{ev.sub}</span>
                  </div>
                  {/* Secret suggestions */}
                  {sodSuggestions.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-1">
                      <span className="text-[0.58rem] text-muted-foreground">אולי חשבת על:</span>
                      {sodSuggestions.map((s, i) => (
                        <span key={i} className="text-[0.58rem] px-1.5 py-0.5 rounded-full border"
                          style={{ borderColor: color + '40', color: color + 'cc', background: color + '0d' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[0.68rem] leading-relaxed text-foreground line-clamp-2">{ev.exp}</p>
                </div>
              </div>
            </div>
          );
        })() : (
          <div className="px-3 py-3 text-center text-muted-foreground text-sm">
            <span dangerouslySetInnerHTML={{ __html: state.hintText.replace(/(\p{Emoji_Presentation})/gu, '<strong class="text-gold-light">$1</strong>') }} />
          </div>
        )}

        {/* Recent log row */}
        {allLogs.length > 0 && (
          <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto">
            {allLogs.slice(0, 6).map((c, i) => (
              <div key={i} className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-surface-2 border ${c.isChain ? 'border-chain/30' : 'border-border'}`}>
                <span className="text-[0.8rem]">{ITEMS[c.a].e}{ITEMS[c.b].e}</span>
                <span className={`font-display text-[0.6rem] font-bold ${c.isChain ? 'text-chain' : LEVEL_CSS_CLASSES[c.ev.lv]}`}>
                  +{c.isChain ? c.bonus : c.ev.sc}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CHAIN TOAST ── */}
      {chainToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-chain/10 border border-chain/30 rounded-full px-4 py-1.5 text-sm text-chain z-[300] backdrop-blur-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-3 duration-300">
          ⛓ {chainToast.count} חיבורי שרשרת!
        </div>
      )}

      {/* ── SCORE POPUP ── */}
      {scorePopRef.current && (
        <div
          key={scorePopKey}
          className="fixed z-[2000] pointer-events-none font-display text-4xl font-black animate-score-float"
          style={{
            left: '50%', top: '38%',
            transform: 'translateX(-50%)',
            color: LEVEL_COLORS[scorePopRef.current.lv as Level] || 'hsl(var(--gold))',
            textShadow: '0 2px 18px rgba(0,0,0,0.6)',
          }}
        >
          +{scorePopRef.current.pts}
        </div>
      )}
    </div>
  );
}
