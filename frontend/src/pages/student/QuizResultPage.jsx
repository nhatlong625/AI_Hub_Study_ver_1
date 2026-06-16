import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPracticeTest, quizQuestions, quizResult } from '../../mocks/quizMock';

function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId = 'quiz-ml-01' } = useParams();
  const test = getPracticeTest(quizId);
  const questions = location.state?.questions || quizQuestions;
  const submittedAnswers = location.state?.answers;
  const [showReview, setShowReview] = useState(Boolean(submittedAnswers));

  const result = useMemo(() => {
    if (!submittedAnswers) {
      return { ...quizResult, total: quizResult.correct + quizResult.wrong };
    }
    const correct = questions.filter((question) => submittedAnswers[question.id] === question.answer).length;
    const total = questions.length;
    return {
      ...quizResult,
      score: Math.round((correct / total) * 100),
      correct,
      wrong: total - correct,
      total,
      timeSpent: location.state?.timeSpent || quizResult.timeSpent,
    };
  }, [location.state?.timeSpent, questions, submittedAnswers]);

  const title = location.state?.title || test.title;
  const scoreTone = result.score >= 80 ? 'great' : result.score >= 60 ? 'good' : 'review';

  return (
    <div className="practice-page-shell quiz-result-shell">
      <header className="quiz-result-hero">
        <span className={`quiz-score-ring ${scoreTone}`}><strong>{result.score}%</strong><small>Score</small></span>
        <div>
          <span className="practice-eyebrow">Practice test complete</span>
          <h1>{result.score >= 80 ? 'Excellent work!' : result.score >= 60 ? 'Nice progress!' : 'Keep practicing!'}</h1>
          <p>You completed <strong>{title}</strong>. Review the feedback below to strengthen your next attempt.</p>
          <div className="quiz-result-actions">
            <button className="practice-primary-button" type="button" onClick={() => setShowReview((current) => !current)}>
              {showReview ? 'Hide answer review' : 'Review answers'}
            </button>
            <button className="practice-secondary-button" type="button" onClick={() => navigate(`/student/quiz/${quizId}`)}>
              Retake test
            </button>
            <button className="practice-link-button" type="button" onClick={() => navigate('/student/practice-tests')}>
              Back to all tests
            </button>
          </div>
        </div>
      </header>

      <section className="quiz-result-stat-grid">
        <article><span>✓</span><strong>{result.correct}</strong><small>Correct answers</small></article>
        <article><span>×</span><strong>{result.wrong}</strong><small>Incorrect answers</small></article>
        <article><span>◷</span><strong>{result.timeSpent}</strong><small>Time spent</small></article>
        <article><span>↗</span><strong>{result.percentile}</strong><small>Class ranking</small></article>
      </section>

      <section className="quiz-insights-grid">
        <article className="quiz-insight-card strength">
          <div className="quiz-insight-heading"><span>✓</span><div><h2>Your strengths</h2><p>Topics you handled confidently.</p></div></div>
          <ul>{result.strengths.map((strength) => <li key={strength}>{strength}</li>)}</ul>
        </article>
        <article className="quiz-insight-card focus">
          <div className="quiz-insight-heading"><span>↗</span><div><h2>Focus next</h2><p>Suggested areas for your next session.</p></div></div>
          <ul>{result.focusAreas.map((area) => <li key={area}>{area}</li>)}</ul>
        </article>
      </section>

      {showReview && (
        <section className="quiz-review-section">
          <div className="practice-library-heading">
            <div><h2>Answer review</h2><p>Understand every answer before your next attempt.</p></div>
            <span className="practice-status practice-status-completed">{result.correct} / {result.total} correct</span>
          </div>
          <div className="quiz-review-list">
            {questions.map((question, index) => {
              const selectedIndex = submittedAnswers ? submittedAnswers[question.id] : question.answer;
              const isCorrect = selectedIndex === question.answer;
              return (
                <article className={`quiz-review-card ${isCorrect ? 'correct' : 'incorrect'}`} key={question.id}>
                  <div className="quiz-review-number">{index + 1}</div>
                  <div>
                    <div className="quiz-review-title">
                      <h3>{question.question}</h3>
                      <span>{isCorrect ? 'Correct' : 'Review needed'}</span>
                    </div>
                    <p className="quiz-review-answer">
                      Your answer: <strong>{selectedIndex === undefined ? 'Not answered' : question.options[selectedIndex]}</strong>
                    </p>
                    {!isCorrect && <p className="quiz-review-answer">Correct answer: <strong>{question.options[question.answer]}</strong></p>}
                    <p className="quiz-review-explanation">{question.explanation}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default QuizResultPage;
