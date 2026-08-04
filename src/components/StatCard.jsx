export default function StatCard({ label, value, tone }) {
  return (
    <div className={`card stat-card ${tone ? `tone-${tone}` : ""}`}>
      <div className="card-label">{label}</div>
      <div className="big-number">{value}</div>
    </div>
  );
}
