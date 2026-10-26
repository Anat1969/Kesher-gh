import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ITEMS, levelColor } from '../game/gameItems';
import { evaluate } from '../game/evaluator';

/** A real chain through the board, mostly hand-crafted secrets, replayed as the hero animation. */
const DEMO_PATH = [9, 0, 10, 2, 18, 22, 13, 6, 20, 12, 8, 24, 11, 23];
const STEP = 0.55;
const HOLD = 2.6;

const CELL = 64;
const GAP = 10;
const SIZE = CELL * 5 + GAP * 4;
const center = (i: number) => {
  const col = i % 5, row = Math.floor(i / 5);
  return { x: col * (CELL + GAP) + CELL / 2, y: row * (CELL + GAP) + CELL / 2 };
};

/**
 * The 25 cards laid on a tilted plane, with a chain of connections drawing itself in a loop.
 * Pieces stand up from the board (billboarded emoji) so the scene reads as a real table.
 */
export default function BoardHero() {
  const [cycle, setCycle] = useState(0);
  const links = useMemo(
    () => DEMO_PATH.slice(1).map((b, i) => ({ a: DEMO_PATH[i], b, lv: evaluate(DEMO_PATH[i], b).lv })),
    [],
  );
  const total = links.length * STEP + HOLD;

  useEffect(() => {
    const t = setInterval(() => setCycle(c => c + 1), total * 1000);
    return () => clearInterval(t);
  }, [total]);

  const reachedAt = (i: number) => {
    const k = DEMO_PATH.indexOf(i);
    return k < 0 ? null : Math.max(0, k - 1) * STEP + (k === 0 ? 0 : STEP * 0.6);
  };

  return (
    <div className="relative mx-auto h-[300px] sm:h-[380px] w-full select-none" aria-hidden="true" style={{ perspective: '1100px', overflowX: 'clip' }}>
      {/* Floor glow */}
      <div className="absolute inset-x-0 bottom-4 mx-auto h-24 w-[70%] rounded-[50%] blur-2xl" style={{ background: 'hsl(var(--shade) / 0.18)' }} />

      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: 'min(360px, 70vw)',
          aspectRatio: '1',
          transform: 'translate(-50%, -54%) rotateX(52deg) rotateZ(-28deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Plate */}
        <div
          className="absolute -inset-4 rounded-md border border-border"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--surface-1)), hsl(var(--surface-3)))',
            boxShadow: '0 1px 0 hsl(var(--hi) / 0.8) inset, 0 40px 60px -20px hsl(var(--shade) / 0.45), 10px 10px 0 -2px hsl(var(--edge))',
          }}
        />

        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full overflow-visible" style={{ transform: 'translateZ(1px)' }}>
          <defs>
            <filter id="hero-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {links.map((l, i) => {
            const A = center(l.a), B = center(l.b);
            return (
              <g key={`${cycle}-${i}`}>
                <motion.line
                  x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                  stroke={levelColor(l.lv, 0.55)} strokeWidth={7} strokeLinecap="round" filter="url(#hero-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: i * STEP, duration: STEP * 0.9, ease: 'easeOut' }}
                />
                <motion.line
                  x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                  stroke={levelColor(l.lv)} strokeWidth={2.5} strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: i * STEP, duration: STEP * 0.9, ease: 'easeOut' }}
                />
              </g>
            );
          })}
        </svg>

        {ITEMS.map((item, i) => {
          const c = center(i);
          const at = reachedAt(i);
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${((c.x - CELL / 2) / SIZE) * 100}%`,
                top: `${((c.y - CELL / 2) / SIZE) * 100}%`,
                width: `${(CELL / SIZE) * 100}%`,
                height: `${(CELL / SIZE) * 100}%`,
                transformStyle: 'preserve-3d',
              }}
            >
              <motion.div
                key={`${cycle}-${i}`}
                className="absolute inset-0 rounded-[5px] border border-border"
                style={{
                  background: 'linear-gradient(145deg, hsl(var(--surface-1)), hsl(var(--surface-2)))',
                  boxShadow: '3px 3px 0 hsl(var(--edge)), 0 1px 0 hsl(var(--hi) / 0.9) inset',
                  transformStyle: 'preserve-3d',
                }}
                initial={{ z: 0 }}
                animate={at === null ? { z: 0 } : { z: [0, 0, 14] }}
                transition={at === null ? undefined : { delay: at, duration: 0.5, times: [0, 0.01, 1], ease: 'easeOut' }}
              >
                <span
                  className="absolute left-1/2 top-1/2 text-[clamp(1.1rem,5vw,1.7rem)] leading-none"
                  style={{ transform: 'translate(-50%, -80%) rotateZ(28deg) rotateX(-52deg)', transformOrigin: 'center bottom' }}
                >
                  {item.e}
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
