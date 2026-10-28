/** The app mark: three gold nodes joined by hand-drawn links on ink, as in the app icon. */
export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true" className="flex-shrink-0">
      <rect width="512" height="512" rx="112" fill="#121212" />
      <path d="M262 92C362 84 436 162 430 262C424 360 346 430 250 426C156 422 88 346 94 252C100 160 168 98 262 92Z" fill="#C9A24A" opacity="0.14" />
      <g fill="none" stroke="#D2AE5C" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round">
        <path d="M150 300C178 236 214 196 256 178" />
        <path d="M256 178C300 196 336 236 362 300" />
        <path d="M150 300C214 352 298 352 362 300" strokeDasharray="4 34" />
        <circle cx="150" cy="300" r="30" fill="#121212" />
        <circle cx="256" cy="178" r="30" fill="#121212" />
        <circle cx="362" cy="300" r="30" fill="#121212" />
      </g>
    </svg>
  );
}
