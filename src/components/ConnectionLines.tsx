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
}

/**
 * SVG overlay that drafts hairline connection curves between the centres of the
 * `[data-card]` elements inside its parent (which must be positioned).
 */
export default function ConnectionLines({ directConns, chainConns, newestId }: ConnectionLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null);
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
        return p && (
          <motion.path key={`c${i}`} d={p.d} fill="none" strokeDasharray="2 4" strokeWidth={1}
            style={{ stroke: 'hsl(var(--chain) / 0.7)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        );
      })}
      {directConns.map((c, i) => {
        const p = path(c);
        if (!p) return null;
        const isNew = i === directConns.length - 1 && newestId > 0;
        return (
          <g key={`d${i}`}>
            <motion.path d={p.d} fill="none" strokeWidth={1.4} strokeLinecap="round"
              style={{ stroke: levelColor(c.ev.lv) }}
              initial={isNew ? { pathLength: 0 } : false} animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }} />
            <motion.circle cx={p.px} cy={p.py} r={2.6} strokeWidth={1}
              style={{ fill: 'hsl(var(--surface-1))', stroke: levelColor(c.ev.lv) }}
              initial={isNew ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: isNew ? 0.6 : 0, duration: 0.3 }} />
          </g>
        );
      })}
    </svg>
  );
}
