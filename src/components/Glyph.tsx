import type { SVGProps } from 'react';

/**
 * Hairline drawings of the 25 cards, in the drafting language of the app:
 * a 32-unit grid, one stroke weight, round ends, no fill except tiny details.
 * Index matches ITEMS.
 */
const D: string[] = [
  // 0 נבט — sprout
  'M16 28V15 M16 19C11 19 8 16 8 11C13 11 16 14 16 19Z M16 15.5C16 10.5 19 7.5 24 7.5C24 12.5 21 15.5 16 15.5Z M10 28H22',
  // 1 ורד — rose
  'M9 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0 M16 12c0-2 2.2-2.5 3.2-1c1.2 2-.7 4.2-3.2 4.2c-3.2 0-5-3.2-3.4-6 M16 19V29 M16 25c3.4 0 5.8-2.3 5.8-4.8c-3.4 0-5.8 2.3-5.8 4.8Z',
  // 2 פרפר — butterfly
  'M16 10V24 M16 10L13 5.5 M16 10L19 5.5 M16 12.5C10.5 6 4.5 7.5 5 12.5C5.5 16.5 12 16.5 16 15.5 M16 12.5C21.5 6 27.5 7.5 27 12.5C26.5 16.5 20 16.5 16 15.5 M16 16.5C11.5 17 8.5 21 10.2 23.8C11.8 26 15 22.5 16 19.5 M16 16.5C20.5 17 23.5 21 21.8 23.8C20.2 26 17 22.5 16 19.5',
  // 3 מערבולת — whirlpool
  'M16 16c0-1.4 1.6-2.3 2.9-1.4c1.9 1.3 1.3 4.3-1 5.2c-3.3 1.3-6.6-1.4-6.6-4.8c0-4.3 4.3-7.2 8.6-6.2c5.2 1.2 7.6 6.8 5.7 11.5c-2.4 5.8-9.6 7.7-14.8 4.4',
  // 4 גל — wave
  'M4 21C4 13.5 9.5 8.5 16 8.5C21 8.5 24 12.5 22.2 15.6C21 17.8 17.6 17.6 17.8 14.8 M4 21H28 M4 25.5C8.5 23.8 12.5 27.2 17 25.5C21.5 23.8 24.5 27 28 25.5',
  // 5 דג — fish
  'M5 16C9 10 17 9.5 23 16C17 22.5 9 22 5 16Z M23 16L28 11V21Z M18 12.5C19.2 14.6 19.2 17.4 18 19.5',
  // 6 מפתח — key
  'M4 16a5 5 0 1 0 10 0a5 5 0 1 0-10 0 M14 16H28 M24 16V20 M27.5 16V19 M7 16a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  // 7 יהלום — diamond
  'M8 12L12 7H20L24 12L16 26Z M8 12H24 M12 7L14 12L16 26 M20 7L18 12L16 26 M14 12L16 7L18 12',
  // 8 שמש — sun
  'M11 16a5 5 0 1 0 10 0a5 5 0 1 0-10 0 M16 3.5V7 M16 25V28.5 M3.5 16H7 M25 16H28.5 M7.2 7.2L9.6 9.6 M22.4 22.4L24.8 24.8 M7.2 24.8L9.6 22.4 M22.4 9.6L24.8 7.2',
  // 9 אש — flame
  'M16 28C10.5 28 8.5 23.5 9.2 19.5C10 15.3 13.3 14 13.2 8.5C17 11.3 18.2 14.4 18 17C19.2 15.6 20.2 14.6 21.2 13.2C23.3 17 24.2 20.2 23.2 23C22.2 26 19.4 28 16 28Z M16 28C13.8 28 13.2 25.4 14 23.4C14.8 21.4 16 20.4 16 18.4C18 20.2 19 22.4 18.6 24.6C18.2 26.6 17.2 28 16 28Z',
  // 10 ברק — lightning
  'M18.5 4L9 18H15.5L13 28L23 13.5H16.5Z',
  // 11 הר — mountain
  'M3 26L12 9L18 19.5L21 15L29 26Z M12 9L10.2 15.5 M21 15L20 20',
  // 12 ירח — crescent moon
  'M19.5 5A11 11 0 1 0 27 21A9 9 0 0 1 19.5 5Z',
  // 13 טלסקופ — telescope
  'M6 15.5L21.5 8.5L23.6 13L8.1 20Z M21.5 8.5L25.6 6.7L27.4 10.6L23.6 13 M15 16.5L11 28 M15 16.5L19 28 M15 16.5V28',
  // 14 עולם — globe
  'M5 16a11 11 0 1 0 22 0a11 11 0 1 0-22 0 M11 16a5 11 0 1 0 10 0a5 11 0 1 0-10 0 M5 16H27 M6.2 11H25.8 M6.2 21H25.8',
  // 15 פאזל — puzzle piece
  'M8 10H13C13 6.5 19 6.5 19 10H24V15C27.5 15 27.5 21 24 21V26H8V21C11.5 21 11.5 15 8 15Z',
  // 16 מטרה — target
  'M5 16a11 11 0 1 0 22 0a11 11 0 1 0-22 0 M9 16a7 7 0 1 0 14 0a7 7 0 1 0-14 0 M13 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M16 16L27 5 M23.5 5H27V8.5',
  // 17 מאזניים — scales
  'M16 7V26 M11 26H21 M6 10H26 M6 10L3.5 18 M6 10L8.5 18 M26 10L23.5 18 M26 10L28.5 18 M3 18C3.5 21 8.5 21 9 18Z M23 18C23.5 21 28.5 21 29 18Z M15 6a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
  // 18 מסכה — theatre mask
  'M7 8C11 6.5 21 6.5 25 8C25 18 21 25.5 16 25.5C11 25.5 7 18 7 8Z M10.5 13.5C11.5 12.3 13 12.3 14 13.5 M18 13.5C19 12.3 20.5 12.3 21.5 13.5 M12 19C14 21.6 18 21.6 20 19',
  // 19 ספר — open book
  'M16 9C13 7 8 7 4 8V24C8 23 13 23 16 25C19 23 24 23 28 24V8C24 7 19 7 16 9Z M16 9V25',
  // 20 תו — musical note
  'M7.8 23a3.4 2.4-20 1 0 6.6 0a3.4 2.4-20 1 0-6.6 0 M14.2 22V5.5 M14.2 5.5C17 8.5 22 8.8 21 15',
  // 21 רעיון — light bulb
  'M12 20.5C9.6 18.8 8 16 8 13A8 8 0 0 1 24 13C24 16 22.4 18.8 20 20.5V22.5H12Z M12 25H20 M13.5 27.5H18.5 M14 20.5V16.5L16 14.5L18 16.5V20.5',
  // 22 בדולח — crystal ball
  'M7 14a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M12 22.5H20L22 26.5H10Z M11.5 11A5 5 0 0 1 15 8',
  // 23 שעון — clock
  'M5 16a11 11 0 1 0 22 0a11 11 0 1 0-22 0 M16 16V9 M16 16L21 19 M16 5.5V7 M26.5 16H25 M16 26.5V25 M5.5 16H7',
  // 24 אריה — lion
  'M16.00 6.30A2.9 2.9 0 0 1 21.10 7.67A2.9 2.9 0 0 1 24.83 11.40A2.9 2.9 0 0 1 26.20 16.50A2.9 2.9 0 0 1 24.83 21.60A2.9 2.9 0 0 1 21.10 25.33A2.9 2.9 0 0 1 16.00 26.70A2.9 2.9 0 0 1 10.90 25.33A2.9 2.9 0 0 1 7.17 21.60A2.9 2.9 0 0 1 5.80 16.50A2.9 2.9 0 0 1 7.17 11.40A2.9 2.9 0 0 1 10.90 7.67A2.9 2.9 0 0 1 16.00 6.30Z M10.5 17a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0 M14.6 18.6H17.4L16 20Z M16 20V21.2 M14.3 21.9C15.1 22.5 16.9 22.5 17.7 21.9',
];

/** Small solid details (eyes) drawn as filled dots: [cx, cy, r]. */
const DOTS: Record<number, [number, number, number][]> = {
  5: [[10, 15, 0.9]],
  24: [[14, 15.8, 0.7], [18, 15.8, 0.7]],
};

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
