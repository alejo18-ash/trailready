// TrailReady mark: a peak with a trail climbing to the summit. Red on navy.
export default function Logo({ size = 40, rounded = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="TrailReady" style={{ flexShrink: 0, display: 'block' }}>
      <rect width="64" height="64" rx={rounded ? 16 : 0} fill="#121D29" />
      <path d="M8 50 26 18l8 13 5-7 17 26Z" fill="#EA2A30" />
      <path d="M26 18 21.5 26l5-1.5L30 28Z" fill="#FFFFFF" opacity="0.9" />
      <path d="M16 50c6-5 11-9 12-15s-3-9-2-14" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0.5 5" />
    </svg>
  );
}
