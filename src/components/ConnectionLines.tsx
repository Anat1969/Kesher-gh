import { useId, useLayoutEffect, useRef, useState } from 'react';
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
 * SVG overlay that draws curved, glowing connection lines between the centres of the
 * `[data-card]` elements inside its parent (which must be positioned).
 */
export default function ConnectionLines({ directConns, chainConns, newestId }: ConnectionLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const glowId = useId().replace(/:/g, '');
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
        // offset* ignores transforms, so lifted or pressed cards don't move their anchor.
        let x = el.offsetWidth / 2, y = el.offsetHeight / 2;
        let node: HTMLElement | null = el;
        while (node && node !== area) {
          x += node.offsetLeft; y += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        if (node !== area) {
          const r = el.getBoundingClientRect();
          x = r.left + r.width / 2 - ar.left; y = r.top + r.height / 2 - ar.top;
        }
        next[Number(el.dataset.card)] = { x, y };
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
    const bow = Math.min(22, len * 0.12);
    const cx = mx - (dy / len) * bow, cy = my + (dx / len) * bow;
    return { d: `M${A.x},${A.y} Q${cx},${cy} ${B.x},${B.y}`, px: (A.x + 2 * cx + B.x) / 4, py: (A.y + 2 * cy + B.y) / 4 };
  };

  return (
    <svg ref={svgRef} className="pointer-events-none absolute inset-0 z-[1] overflow-visible" width={size.w} height={size.h} aria-hidden="true">
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>
      {chainConns.map((c, i) => {
        const p = path(c);
        return p && (
          <motion.path key={`c${i}`} d={p.d} fill="none" strokeDasharray="3 5" strokeWidth={1.4} strokeLinecap="round"
            style={{ stroke: 'hsl(var(--chain) / 0.55)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} />
        );
      })}
      {directConns.map((c, i) => {
        const p = path(c);
        if (!p) return null;
        const isNew = i === directConns.length - 1 && newestId > 0;
        const draw = isNew ? { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.55, ease: 'easeOut' as const } } : {};
        return (
          <g key={`d${i}`}>
            <motion.path d={p.d} fill="none" strokeWidth={7} strokeLinecap="round" filter={`url(#${glowId})`}
              style={{ stroke: levelColor(c.ev.lv, 0.35) }} {...draw} />
            <motion.path d={p.d} fill="none" strokeWidth={2.2} strokeLinecap="round"
              style={{ stroke: levelColor(c.ev.lv, 0.9) }} {...draw} />
            <motion.circle cx={p.px} cy={p.py} r={3.2} style={{ fill: levelColor(c.ev.lv) }}
              initial={isNew ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ delay: isNew ? 0.45 : 0, type: 'spring', stiffness: 500, damping: 18 }} />
          </g>
        );
      })}
    </svg>
  );
}
