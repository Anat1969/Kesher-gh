import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { levelColor } from '../game/gameItems';
import type { Connection } from '../game/personality';

interface Point { x: number; y: number }

interface ConnectionLinesProps {
  directConns: Connection[];
  chainConns: Connection[];
  /** Id of the newest direct connection; the last line draws itself when it is > 0. */
  newestId: number;
  /**
   * Draw the whole map in order, one line after another (results screen, seen once per game),
   * instead of every line appearing at the same moment.
   */
  sequence?: boolean;
}

/** Strong ease-out (Emil Kowalski): entering lines start fast and settle. */
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** Gap between lines that enter together (chain links revealed by one move, or the results map). */
const STAGGER = 0.06;

/**
 * SVG overlay that drafts hairline connection curves between the centres of the
 * `[data-card]` elements inside its parent (which must be positioned).
 */
export default function ConnectionLines({ directConns, chainConns, newestId, sequence = false }: ConnectionLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // Chain lines already on the board: only the ones a move just revealed enter, one after another.
  const seenChains = useRef(chainConns.length);
  const firstNewChain = sequence ? 0 : seenChains.current;
  useLayoutEffect(() => { seenChains.current = chainConns.length; }, [chainConns.length]);
  // A long game still draws its whole map in about a second.
  const step = sequence ? Math.min(STAGGER, 1.2 / Math.max(1, directConns.length + chainConns.length)) : STAGGER;
  const [centers, setCenters] = useState<Record<number, Point>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    // Measure the parent via our own ref: a parent's ref isn't attached yet when a child's layout effect runs.
    const area = svgRef.current?.parentElement;
    if (!area) return;
    const measure = () => {
      const ar = area.getBoundingClientRect();
      const next: Record<number, Point> = {};
      area.querySelectorAll<HTMLElement>('[data-card]').forEach(el => {
        const r = el.getBoundingClientRect();
        next[Number(el.dataset.card)] = { x: r.left + r.width / 2 - ar.left, y: r.top + r.height / 2 - ar.top };
      });
      setCenters(next);
      setSize({ w: ar.width, h: ar.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(area);
    const t = setTimeout(measure, 600);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, []);

  const path = (c: Connection) => {
    const A = centers[c.a], B = centers[c.b];
    if (!A || !B) return null;
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
    const dx = B.x - A.x, dy = B.y - A.y;
    const len = Math.hypot(dx, dy) || 1;
    // Bow each curve sideways by a fraction of its length, so parallel lines separate.
    const bow = Math.min(18, len * 0.1);
    const cx = mx - (dy / len) * bow, cy = my + (dx / len) * bow;
    return { d: `M${A.x},${A.y} Q${cx},${cy} ${B.x},${B.y}`, px: (A.x + 2 * cx + B.x) / 4, py: (A.y + 2 * cy + B.y) / 4 };
  };

  return (
    <svg ref={svgRef} className="pointer-events-none absolute inset-0 z-[1] overflow-visible" width={size.w} height={size.h} aria-hidden="true">
      {chainConns.map((c, i) => {
        const p = path(c);
        // Chain lines follow the direct lines in sequence mode, and follow each other in play.
        const k = sequence ? directConns.length + i : i - firstNewChain;
        return p && (
          <motion.path key={`c${i}`} d={p.d} fill="none" strokeDasharray="2 4" strokeWidth={1}
            style={{ stroke: 'hsl(var(--chain) / 0.7)' }}
            initial={k >= 0 ? { opacity: 0 } : false} animate={{ opacity: 1 }}
            transition={{ delay: Math.max(0, k) * step + (sequence ? 0 : 0.2), duration: 0.2, ease: EASE_OUT }} />
        );
      })}
      {directConns.map((c, i) => {
        const p = path(c);
        if (!p) return null;
        const isNew = sequence || (i === directConns.length - 1 && newestId > 0);
        const delay = sequence ? i * step : 0;
        return (
          <g key={`d${i}`}>
            <motion.path d={p.d} fill="none" strokeWidth={1.4} strokeLinecap="round"
              style={{ stroke: levelColor(c.ev.lv) }}
              initial={isNew ? { pathLength: 0 } : false} animate={{ pathLength: 1 }}
              transition={{ delay, duration: 0.28, ease: EASE_OUT }} />
            <motion.circle cx={p.px} cy={p.py} r={2.6} strokeWidth={1}
              style={{ fill: 'hsl(var(--surface-1))', stroke: levelColor(c.ev.lv) }}
              initial={isNew ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: delay + (isNew ? 0.22 : 0), duration: 0.12 }} />
          </g>
        );
      })}
    </svg>
  );
}
