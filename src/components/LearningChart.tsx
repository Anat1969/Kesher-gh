import { useEffect, useRef, useState } from 'react';
import type { GameRecord } from '../lib/storage';
import { levelColor } from '../game/gameItems';
import { WINDOW, rolling } from '../lib/learning';

function niceMax(v: number): number {
  if (v <= 0) return 50;
  const step = v > 400 ? 100 : v > 150 ? 50 : 25;
  return Math.ceil((v * 1.08) / step) * step;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/**
 * Personal learning graph: every classic game as a dot, the 5-game rolling mean as a line,
 * and below it a strip for depth (share of drash and sod links). Oldest game on the left.
 */
export default function LearningChart({ history, compact = false }: { history: GameRecord[]; compact?: boolean }) {
  const games = [...history].reverse(); // stored newest first
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const totals = games.map(g => g.total);
  const mean = rolling(totals);
  const yMax = niceMax(Math.max(...totals, 0));
  const H = compact ? 170 : 230;
  const pad = { t: 14, r: 64, b: 22, l: 34 };
  const iw = width - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const n = games.length;
  const x = (i: number) => pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / yMax) * ih;
  const ticks = [0, yMax / 2, yMax];
  const linePath = mean.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const deepH = 34;
  const hasDeep = games.some(g => typeof g.deep === 'number');
  const barW = Math.max(2, Math.min(10, (iw / Math.max(1, n)) * 0.55));

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - box.left;
    if (n === 0) return;
    const i = n === 1 ? 0 : Math.round(((px - pad.l) / iw) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const h = hover !== null ? games[hover] : null;
  const last = n - 1;

  return (
    <div ref={ref} className="relative w-full" dir="ltr">
      <div className="mb-3 flex flex-wrap items-center justify-end gap-x-5 gap-y-1" dir="rtl">
        <span className="label-mono flex items-center gap-2"><span className="inline-block h-[7px] w-[7px] rounded-full bg-muted-foreground/60" />ציון משחק</span>
        <span className="label-mono flex items-center gap-2"><span className="inline-block h-[2px] w-5 bg-foreground" />ממוצע {WINDOW} משחקים</span>
      </div>
      <svg
        width={width}
        height={H}
        role="img"
        aria-label={`גרף למידה: ${n} משחקים, ציון אחרון ${totals[last] ?? 0}, ממוצע נע ${Math.round(mean[last] ?? 0)}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        className="block touch-pan-y"
      >
        {ticks.map(t => (
          <g key={t}>
            <line x1={pad.l} x2={pad.l + iw} y1={y(t)} y2={y(t)} stroke="hsl(var(--border))" strokeWidth={t === 0 ? 1 : 0.6} />
            <text x={pad.l - 8} y={y(t) + 3.5} textAnchor="end" className="num-mono" fontSize={10} fill="hsl(var(--muted-foreground))">{t}</text>
          </g>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="hsl(var(--foreground) / 0.25)" strokeWidth={1} />}
        {games.map((g, i) => (
          <circle key={g.date + i} cx={x(i)} cy={y(g.total)} r={i === hover ? 4.5 : 3}
            fill={i === last ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.55)'} />
        ))}
        {n > 1 && <path d={linePath} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />}
        {n > 0 && (
          <>
            <circle cx={x(last)} cy={y(mean[last])} r={3} fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth={1.5} />
            <text x={x(last) + 9} y={y(mean[last]) + 3.5} fontSize={11} className="num-mono" fill="hsl(var(--foreground))">{Math.round(mean[last])}</text>
            <text x={x(last) + 9} y={y(mean[last]) + 16} fontSize={9.5} fill="hsl(var(--muted-foreground))">ממוצע</text>
          </>
        )}
        <text x={pad.l} y={H - 5} fontSize={9.5} fill="hsl(var(--muted-foreground))">משחק 1</text>
        <text x={pad.l + iw} y={H - 5} fontSize={9.5} textAnchor="end" fill="hsl(var(--muted-foreground))">{`משחק ${n}`}</text>
      </svg>

      {hasDeep && !compact && (
        <div className="mt-4">
          <p className="label-mono mb-1.5" dir="rtl">עומק · שיעור קשרי דרש וסוד בכל משחק</p>
          <svg width={width} height={deepH} aria-hidden="true" className="block">
            <line x1={pad.l} x2={pad.l + iw} y1={deepH - 1} y2={deepH - 1} stroke="hsl(var(--border))" />
            {games.map((g, i) => typeof g.deep === 'number' && (
              <rect key={g.date + i} x={x(i) - barW / 2} y={deepH - 1 - Math.max(1, g.deep * (deepH - 4))} width={barW}
                height={Math.max(1, g.deep * (deepH - 4))} rx={1}
                fill={levelColor('d', i === hover ? 1 : 0.7)} />
            ))}
          </svg>
        </div>
      )}

      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-8 z-10 -translate-x-1/2 whitespace-nowrap border border-border bg-popover px-3 py-2 text-xs shadow-md"
          style={{ left: Math.min(Math.max(x(hover), 70), width - 70) }}
          dir="rtl"
        >
          <div className="label-mono">משחק {hover + 1} · {new Date(h.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}</div>
          <div className="mt-1"><span className="num-mono text-base" dir="ltr">{h.total}</span> נקודות · {h.connections} קשרים</div>
          {typeof h.deep === 'number' && <div className="text-muted-foreground">{Math.round(h.deep * 100)}% דרש וסוד</div>}
        </div>
      )}
    </div>
  );
}
