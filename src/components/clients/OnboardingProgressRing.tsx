/**
 * Pure SVG progress ring (no client JS needed). Used on the admin client detail
 * and the client portal onboarding header.
 */
export function OnboardingProgressRing({
  pct,
  size = 132,
  stroke = 12,
  caption,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  caption?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          style={{ stroke: 'var(--cl-gray-200, #E5E7EB)' }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: 'var(--cl-teal, #0D9488)', transition: 'stroke-dashoffset 500ms ease' }}
        />
      </svg>
      <div className="-mt-[88px] mb-[44px] text-center">
        <span className="block text-2xl font-bold text-cl-navy leading-none">{clamped}%</span>
        {caption ? <span className="block text-[11px] text-cl-gray-500 mt-1">{caption}</span> : null}
      </div>
    </div>
  );
}
