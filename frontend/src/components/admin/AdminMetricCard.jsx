import StatCard from '../common/StatCard';

function AdminMetricCard({ item }) {
  return <StatCard label={item.label} value={item.value} change={item.change} />;
}

export default AdminMetricCard;
