import Card from './Card';

function StatCard({ label, value, change }) {
  return (
    <Card className="metric-card">
      <span className="muted">{label}</span>
      <div className="metric-value">{value}</div>
      <span className="badge badge-primary">{change}</span>
    </Card>
  );
}

export default StatCard;
