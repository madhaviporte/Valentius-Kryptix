export default function SummaryCard({ label, value, hint }) {
  return (
    <div className="summary-card card">
      <p className="summary-label">{label}</p>
      <p className="summary-value">{value}</p>
      {hint && <p className="summary-hint">{hint}</p>}
    </div>
  );
}
