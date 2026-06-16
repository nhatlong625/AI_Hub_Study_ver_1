import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPracticeTest, quizQuestions } from '../../mocks/quizMock';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function QuizTakingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId = 'quiz-ml-01' } = useParams();
  const generatedTest = location.state?.generatedTest;
  const test = getPracticeTest(quizId);
  const title = generatedTest?.title || test.title;
  const durationMinutes = Number.parseInt(generatedTest?.duration || test.duration, 10) || 20;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const currentQuestion = quizQuestions[currentIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(((currentIndex + 1) / quizQuestions.length) * 100);
  const isLastQuestion = currentIndex === quizQuestions.length - 1;

  const questionStatus = useMemo(() => quizQuestions.map((question, index) => ({
    id: question.id,
    index,
    answered: answers[question.id] !== undefined,
    flagged: flagged.includes(question.id),
  })), [answers, flagged]);

  const toggleFlag = () => {
    setFlagged((current) => current.includes(currentQuestion.id)
      ? current.filter((id) => id !== currentQuestion.id)
      : [...current, currentQuestion.id]);
  };

  const submitQuiz = () => {
    const spentSeconds = durationMinutes * 60 - secondsLeft;
    navigate(`/student/quiz/${quizId}/result`, {
      state: {
        answers,
        questions: quizQuestions,
        title,
        timeSpent: `${Math.max(1, Math.ceil(spentSeconds / 60))} min`,
      },
    });
  };

  return (
    <div className="quiz-taking-shell">
      <header className="quiz-taking-header">
        <div>
          <button type="button" onClick={() => navigate('/student/practice-tests')}>Exit quiz</button>
          <span>{generatedTest?.course || test.course}</span>
          <h1>{title}</h1>
        </div>
        <div className={`quiz-timer ${secondsLeft < 120 ? 'urgent' : ''}`}>
          <span>Time remaining</span>
          <strong>{formatTime(secondsLeft)}</strong>
        </div>
      </header>

      <div className="quiz-progress-track"><span style={{ width: `${progress}%` }} /></div>

      <div className="quiz-taking-grid">
        <main className="quiz-question-card">
          <div className="quiz-question-kicker">
            <span>Question {currentIndex + 1} of {quizQuestions.length}</span>
            <button className={flagged.includes(currentQuestion.id) ? 'active' : ''} type="button" onClick={toggleFlag}>
              {flagged.includes(currentQuestion.id) ? 'Flagged for review' : 'Flag for review'}
            </button>
          </div>
          <h2>{currentQuestion.question}</h2>
          <div className="quiz-answer-list">
            {currentQuestion.options.map((option, optionIndex) => {
              const selected = answers[currentQuestion.id] === optionIndex;
              return (
                <button
                  className={selected ? 'selected' : ''}
                  type="button"
                  key={option}
                  onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: optionIndex }))}
                >
                  <span>{String.fromCharCode(65 + optionIndex)}</span>
                  <strong>{option}</strong>
                  <i aria-hidden="true">{selected ? '✓' : ''}</i>
                </button>
              );
            })}
          </div>
          <footer className="quiz-question-actions">
            <button
              className="practice-secondary-button"
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((current) => current - 1)}
            >
              Previous
            </button>
            {isLastQuestion ? (
              <button className="practice-primary-button" type="button" onClick={submitQuiz}>Submit quiz</button>
            ) : (
              <button className="practice-primary-button" type="button" onClick={() => setCurrentIndex((current) => current + 1)}>
                Next question
              </button>
            )}
          </footer>
        </main>

        <aside className="quiz-navigator-card">
          <div>
            <h2>Question navigator</h2>
            <p>{answeredCount} of {quizQuestions.length} answered</p>
          </div>
          <div className="quiz-number-grid">
            {questionStatus.map((question) => (
              <button
                className={[
                  question.index === currentIndex ? 'current' : '',
                  question.answered ? 'answered' : '',
                  question.flagged ? 'flagged' : '',
                ].filter(Boolean).join(' ')}
                type="button"
                key={question.id}
                onClick={() => setCurrentIndex(question.index)}
              >
                {question.index + 1}
              </button>
            ))}
          </div>
          <div className="quiz-legend">
            <span><i className="current" /> Current</span>
            <span><i className="answered" /> Answered</span>
            <span><i className="flagged" /> Flagged</span>
          </div>
          <button className="practice-secondary-button" type="button" onClick={submitQuiz}>Finish and submit</button>
        </aside>
      </div>
    </div>
  );
}

export default QuizTakingPage;
