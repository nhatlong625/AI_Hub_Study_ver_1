import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { practiceTestApi } from "../../services/practiceTestApi";

const USER_ID = 1;

function StudentPracticeTestsPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    practiceTestApi
      .list(USER_ID)
      .then(setTests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tests.filter((test) => {
      const matchesStatus = status === "All" || test.status === status;
      const matchesQuery =
        !normalized ||
        String(test.title || "").toLowerCase().includes(normalized) ||
        String(test.course || "").toLowerCase().includes(normalized) ||
        String(test.source || "").toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [query, status, tests]);

  const completed = tests.filter((test) => test.status === "Completed");
  const average = completed.length
    ? Math.round(completed.reduce((sum, test) => sum + Number(test.score || 0), 0) / completed.length)
    : 0;

  return (
    <div className="practice-page">
      <section className="practice-hero-card">
        <div>
          <span>Practice Tests</span>
          <h1>Turn your documents into focused quizzes.</h1>
          <p>Generate questions from uploaded files, take the quiz, and save your score back to the existing test tables.</p>
        </div>
        <button type="button" onClick={() => navigate("/student/practice-tests/generate")}>
          Generate test
        </button>
      </section>

      <section className="practice-stat-row">
        <article><strong>{tests.length}</strong><span>Total tests</span></article>
        <article><strong>{completed.length}</strong><span>Completed</span></article>
        <article><strong>{average}%</strong><span>Average score</span></article>
      </section>

      <section className="practice-panel">
        <div className="practice-toolbar">
          <div>
            <h2>Your tests</h2>
            <p>{filtered.length} available</p>
          </div>
          <div className="practice-controls">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tests" />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>All</option>
              <option>Ready</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {error && <div className="practice-error">{error}</div>}
        {loading && <div className="practice-empty">Loading practice tests...</div>}
        {!loading && filtered.length === 0 && <div className="practice-empty">No practice tests found.</div>}

        <div className="practice-card-grid">
          {filtered.map((test) => (
            <article className="practice-test-card" key={test.id}>
              <div className="practice-card-top">
                <span className={`practice-status ${test.status === "Completed" ? "done" : "ready"}`}>{test.status}</span>
                <small>{test.questions || test.totalQuestions || 0} questions</small>
              </div>
              <h3>{test.title}</h3>
              <p>{test.course} - {test.source}</p>
              <dl>
                <div><dt>Time</dt><dd>{test.timeLimit || 20} min</dd></div>
                <div><dt>Score</dt><dd>{test.score == null ? "-" : `${Math.round(Number(test.score))}%`}</dd></div>
              </dl>
              <button type="button" onClick={() => navigate(`/student/quiz/${test.id}`)}>
                {test.status === "Completed" ? "Retake" : "Start quiz"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudentPracticeTestsPage;
