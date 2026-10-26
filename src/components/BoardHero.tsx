import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ITEMS, LEVEL_NAMES, levelColor } from '../game/gameItems';
import { evaluate } from '../game/evaluator';

/** A real chain through the board, mostly hand-crafted secrets, replayed as the hero drawing. */
const DEMO_PATH = [9, 0, 10, 2, 18, 22, 13, 6, 20, 12, 8, 24, 11, 23];
const STEP = 1.6;
const HOLD = 4;

const W = 520, H = 420, PAD_X = 52, PAD_Y = 40;
const pos = (i: number) => {
  // RTL reading order: index 0 sits top-right.
  const col = i % 5, row = Math.floor(i / 5);
  return { x: W - PAD_X - col * ((W - PAD_X * 2) / 4), y: PAD_Y + row * ((H - PAD_Y * 2) / 4) };
};

/**
 * The 25 words laid out like a drawing sheet. A chain of real connections is drafted
 * line by line, with a caption naming each link as it is drawn.
 */
export default function BoardHero() {
  const [cycle, setCycle] = useState(0);
  const [step, setStep] = useState(0);
  const links = useMemo(
    () => DEMO_PATH.slice(1).map((b, i) => {
      const a = DEMO_PATH[i];
      return { a, b, ev: evaluate(a, b) };
    }),
    [],
  );

  useEffect(() => {
    setStep(0);
    const ticks = links.map((_, i) => setTimeout(() => setStep(i + 1), (i * STEP + STEP * 0.5) * 1000));
    const loop = setTimeout(() => setCycle(c => c + 1), (links.length * STEP + HOLD) * 1000);
    return () => { ticks.forEach(clearTimeout); clearTimeout(loop); };
  }, [cycle, links]);

  const reached = new Set(DEMO_PATH.slice(0, step + 1));
  const current = step > 0 ? links[step - 1] : null;

  return (
    <figure className="relative mx-auto w-full max-w-[560px] select-none" aria-hidden="true">
      <div className="panel relative p-3 sm:p-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="label-mono">גיליון 01 · שרשרת לדוגמה</span>
          <span className="label-mono num-mono" dir="ltr">{String(step).padStart(2, '0')}/{links.length}</span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 block w-full">
          {/* Construction grid */}
          {[0, 1, 2, 3, 4].map(k => {
            const x = pos(k).x, y = pos(k * 5).y;
            return (
              <g key={k}>
                <line x1={x} y1={PAD_Y - 22} x2={x} y2={H - PAD_Y + 22} stroke="hsl(var(--hairline))" strokeWidth={1} />
                <line x1={PAD_X - 30} y1={y} x2={W - PAD_X + 30} y2={y} stroke="hsl(var(--hairline))" strokeWidth={1} />
              </g>
            );
          })}

          {links.map((l, i) => {
            const A = pos(l.a), B = pos(l.b);
            return (
              <motion.line
                key={`${cycle}-${i}`}
                x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                stroke={levelColor(l.ev.lv)} strokeWidth={1.25}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: i * STEP, duration: STEP * 0.7, ease: [0.4, 0, 0.2, 1] }}
              />
            );
          })}

          {ITEMS.map((item, i) => {
            const p = pos(i);
            const on = reached.has(i);
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={on ? 3.2 : 2} fill={on ? 'hsl(var(--foreground))' : 'hsl(var(--surface-1))'} stroke="hsl(var(--foreground) / 0.55)" strokeWidth={1}
                  style={{ transition: 'r 0.6s, fill 0.6s' }} />
                <text
                  x={p.x} y={p.y + 19} textAnchor="middle" fontSize="13"
                  fontWeight={on ? 400 : 300}
                  fill={on ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'}
                  stroke="hsl(var(--surface-1))" strokeWidth={5} strokeLinejoin="round" paintOrder="stroke"
                  style={{ transition: 'fill 0.6s', fontFamily: 'IBM Plex Sans Hebrew' }}
                >
                  {item.l}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="relative h-12 border-t border-border pt-2">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={`${cycle}-${step}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-baseline gap-3"
              >
                <span className="text-sm" style={{ color: levelColor(current.ev.lv) }}>{LEVEL_NAMES[current.ev.lv]}</span>
                <span className="truncate text-sm text-foreground">
                  {ITEMS[current.a].l} <span className="text-muted-foreground">·</span> {ITEMS[current.b].l}
                  <span className="text-muted-foreground"> — {current.ev.sub.replace(/^[^—]*—\s*/, '')}</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </figure>
  );
}
