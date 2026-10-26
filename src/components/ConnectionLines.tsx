import { useLayoutEffect, useRef, useState } from 'react';
import { levelColor } from '../game/gameItems';
import type { Connection } from '../game/personality';

interface Point { x: number; y: number }

interface ConnectionLinesProps {
  directConns: Connection[];
  chainConns: Connection[];
  /** Index of the newest direct connection, drawn with an animated stroke. */
  newestId: number;
}

/**
 * SVG overlay that draws curved connection lines between the centres of the
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
    // Cards animate in; re-measure once they've settled.
    const t = setTimeout(measure, 500);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, []);

  const path = (c: Connection) => {
    const A = centers[c.a], B = centers[c.b];
    if (!A || !B) return null;
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
    // Control point lifted 16px; the curve's midpoint therefore sits 8px above the chord.
    return { d: `M${A.x},${A.y} Q${mx},${my - 16} ${B.x},${B.y}`, cx: mx, cy: my - 8 };
  };

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none z-[1]"
      width={size.w}
      height={size.h}
      aria-hidden="true"
    >
      {chainConns.map((c, i) => {
        const p = path(c);
        return p && (
          <path key={`c${i}`} d={p.d} fill="none" strokeDasharray="4 4" strokeWidth={1.3}
            style={{ stroke: 'hsl(var(--chain) / 0.4)' }} className="animate-in fade-in duration-700" />
        );
      })}
      {directConns.map((c, i) => {
        const p = path(c);
        if (!p) return null;
        const isNew = i === directConns.length - 1 && newestId > 0;
        return (
          <g key={`d${i}`}>
            <path d={p.d} fill="none" strokeWidth={2.2} strokeLinecap="round" pathLength={1}
              className={isNew ? 'animate-draw-line' : undefined}
              style={{ stroke: levelColor(c.ev.lv, 0.6) }} />
            <circle cx={p.cx} cy={p.cy} r={3} style={{ fill: levelColor(c.ev.lv, 0.85) }} />
          </g>
        );
      })}
    </svg>
  );
}
