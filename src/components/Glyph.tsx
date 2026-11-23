import type { SVGProps } from 'react';

import { D, DOTS } from './glyphPaths';




/** A soft, irregular wash behind each drawing, turned differently per card. */
const WASH = 'M16 4.2C22.8 3.6 28.2 9.1 27.8 16.1C27.4 22.9 21.9 28.1 15.2 27.8C8.6 27.5 3.9 22.2 4.3 15.5C4.7 9.1 9.5 4.8 16 4.2Z';

interface GlyphProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  i: number;
  size?: number | string;
  strokeWidth?: number;
  /** gold: the soft hand-drawn gold drawing with a wash (default). ink: currentColor, no wash. */
  tone?: 'gold' | 'ink';
}

/** Hidden filter that gives every gold drawing a slight hand-drawn waver. Render once. */
export function GlyphDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="hand-drawn" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

export default function Glyph({ i, size = 24, strokeWidth, tone = 'gold', ...rest }: GlyphProps) {
  const gold = tone === 'gold';
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke={gold ? 'hsl(var(--gold))' : 'currentColor'}
      strokeWidth={strokeWidth ?? (gold ? 1.55 : 1.25)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {gold && <path d={WASH} transform={`rotate(${(i * 47) % 360} 16 16)`} fill="hsl(var(--gold) / 0.13)" stroke="none" />}
      <g filter={gold ? 'url(#hand-drawn)' : undefined}>
        <path d={D[i]} />
        {DOTS[i]?.map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={gold ? 'hsl(var(--gold))' : 'currentColor'} stroke="none" />)}
      </g>
    </svg>
  );
}
