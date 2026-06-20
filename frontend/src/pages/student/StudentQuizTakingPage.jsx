import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { practiceTestApi } from "../../services/practiceTestApi";

const USER_ID = 1;

function StudentQuizTakingPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    practiceTestApi
      .get(quizId)
      .then((data) => {
        setTest(data);
        setSecondsLeft(Number(data.timeLimit || 20) * 60);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [quizId]);

  useEffect(() => {
    if (!test || secondsLeft <= 0 || submitting) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft, submitting, test]);

  const questions = test?.questions || [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const timeSpent = useMemo(() => Math.max(0, Number(test?.timeLimit || 20) * 60 - secondsLeft), [secondsLeft, test]);

  const chooseAnswer = (questionId, optionId) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      setError("");
      const result = await practiceTestApi.submit(quizId, {
        userId: USER_ID,
        timeSpentSeconds: timeSpent,
        answers,
      });
      navigate(`/student/quiz/${quizId}/result`, { state: { result } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="practice-page"><div className="practice-empty">Loading quiz...</div></div>;

  if (error && !test) {
    return (
      <div className="practice-page">
        <div className="practice-error">{error}</div>
        <button className="practice-primary" type="button" onClick={() => navigate("/student/practice-tests")}>Back to tests</button>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="practice-page"><div className="practice-empty">This quiz has no questions.</div></div>;
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="practice-page">
      <header className="quiz-header">
        <button type="button" onClick={() => navigate("/student/practice-tests")}>Exit quiz</button>
        <div>
          <span>{test.course}</span>
          <h1>{test.title}</h1>
        </div>
        <strong className={secondsLeft < 120 ? "urgent" : ""}>{minutes}:{seconds}</strong>
      </header>

      <div className="quiz-progress"><span style={{ width: `${progress}%` }} /></div>
      {error && <div className="practice-error">{error}</div>}

      <main className="quiz-layout">
        <section className="quiz-card">
          <div className="quiz-kicker">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{currentQuestion.difficulty}</span>
          </div>
          <h2>{currentQuestion.question}</h2>
          <div className="quiz-options">
            {currentQuestion.options.map((option, index) => {
              const selected = answers[currentQuestion.id] === option.id;
              return (
                <button
                  className={selected ? "selected" : ""}
                  key={option.id}
                  type="button"
                  onClick={() => chooseAnswer(currentQuestion.id, option.id)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option.content}
                </button>
              );
            })}
          </div>
          <footer className="quiz-actions">
            <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => value - 1)}>Previous</button>
            {currentIndex === questions.length - 1 ? (
              <button className="practice-primary" type="button" onClick={submitQuiz} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit quiz"}
              </button>
            ) : (
              <button className="practice-primary" type="button" onClick={() => setCurrentIndex((value) => value + 1)}>Next</button>
            )}
          </footer>
        </section>

        <aside className="quiz-nav">
          <h2>Question navigator</h2>
          <p>{answeredCount} of {questions.length} answered</p>
          <div>
            {questions.map((question, index) => (
              <button
                className={`${index === currentIndex ? "current" : ""} ${answers[question.id] ? "answered" : ""}`}
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default StudentQuizTakingPage;
