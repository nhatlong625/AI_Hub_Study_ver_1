import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import CourseCard from '../../components/student/CourseCard';

// TODO: thay bằng API thật
const courses = [];
const myCourseMilestones = [];


function StudentMyCoursesPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="My courses"
        title="Your active learning stack"
        description="Track progress, revisit milestones, and continue the lessons that matter most right now."
      />
      <section className="grid-2">
        <Card title="Upcoming milestones" description="Small goals for this week.">
          <div className="simple-list">
            {myCourseMilestones.map((item) => (
              <div className="list-item" key={item.id}>
                <span className="list-icon">UP</span>
                <div>
                  <strong>{item.title}</strong>
                  <div className="muted">{item.due} - {item.status}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Weekly focus" description="Aim to complete 2 lessons and 1 timed quiz.">
          <div className="metric-value">76%</div>
          <p className="card-description">You are ahead of last week's pace and close to your next streak reward.</p>
        </Card>
      </section>
      <section className="course-grid">
        {courses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} cta="Continue learning" />)}
      </section>
    </div>
  );
}

export default StudentMyCoursesPage;
