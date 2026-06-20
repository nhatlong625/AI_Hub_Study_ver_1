import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { reviewQueue } from '../../mocks/adminMock';

function QuestionReviewQueuePage() {
  return (
    <div className="page-shell">
      <PageHeader eyebrow="Review queue" title="Question review queue" description="Flagged question sets awaiting moderation." />
      <Card title="Queued reviews" description="Prioritize by severity and owner.">
        <Table
          columns={['Batch', 'Owner', 'Flagged', 'Priority']}
          data={reviewQueue}
          renderRow={(item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.owner}</td>
              <td>{item.flagged}</td>
              <td><Badge tone={item.priority === 'High' ? 'danger' : item.priority === 'Medium' ? 'warning' : 'success'}>{item.priority}</Badge></td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}

export default QuestionReviewQueuePage;
