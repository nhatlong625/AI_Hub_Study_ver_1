import { useLocation, useNavigate, useParams } from "react-router-dom";

function StudentQuizResultPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="practice-page">
        <div className="practice-empty">No result is available for this session.</div>
        <button className="practice-primary" type="button" onClick={() => navigate(`/student/quiz/${quizId}`)}>
          Take quiz
        </button>
      </div>
    );
  }

  const score = Math.round(Number(result.score || 0));

  return (
    <div className="practice-page">
      <section className="quiz-result-hero">
        <div className={`quiz-score ${score >= 80 ? "great" : score >= 60 ? "good" : "review"}`}>
          <strong>{score}%</strong>
          <span>{result.grade}</span>
        </div>
        <div>
          <span>Practice test complete</span>
          <h1>{result.title}</h1>
          <p>{result.correct} correct, {result.wrong} needs review, {result.total} total questions.</p>
          <div className="quiz-result-actions">
            <button className="practice-primary" type="button" onClick={() => navigate(`/student/quiz/${quizId}`)}>
              Retake test
            </button>
            <button type="button" onClick={() => navigate("/student/practice-tests")}>
              Back to all tests
            </button>
          </div>
        </div>
      </section>

      <section className="practice-panel">
        <h2>Review questions</h2>
        <div className="quiz-review-list">
          {(result.questions || []).map((question, index) => (
            <article key={question.id} className="quiz-review-card">
              <strong>{index + 1}</strong>
              <div>
                <h3>{question.question}</h3>
                <p>Correct answer: {question.correctAnswer}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudentQuizResultPage;
