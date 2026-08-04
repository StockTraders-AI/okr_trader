export default function Donut({ value, color }) {
  const radius = 66;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value));

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
      <svg width="168" height="168" viewBox="0 0 168 168" role="img" aria-label={`Hoàn thành ${(pct * 100).toFixed(0)}%`}>
        <circle cx="84" cy="84" r={radius + stroke / 2 + 4} fill="none" stroke="var(--surface2)" strokeWidth="1" />
        <circle cx="84" cy="84" r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx="84"
          cy="84"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * pct} ${circumference}`}
          transform="rotate(-90 84 84)"
          style={{ transition: "stroke-dasharray .6s ease" }}
        />
        <text x="84" y="80" textAnchor="middle" fontFamily="var(--mono)" fontSize="30" fontWeight="700" fill="var(--text)">{(pct * 100).toFixed(0)}%</text>
        <text x="84" y="102" textAnchor="middle" fontFamily="var(--body)" fontSize="11" fill="var(--dim)">hoàn thành</text>
      </svg>
    </div>
  );
}
