import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { practiceTests } from '../../mocks/quizMock';

const statusOptions = ['All', 'Ready', 'Completed', 'Draft'];

function PracticeTestsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  const filteredTests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return practiceTests.filter((test) => {
      const matchesStatus = status === 'All' || test.status === status;
      const matchesQuery =
        !normalizedQuery ||
        test.title.toLowerCase().includes(normalizedQuery) ||
        test.course.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const completedTests = practiceTests.filter((test) => test.status === 'Completed');
  const averageScore = completedTests.length
    ? Math.round(completedTests.reduce((sum, test) => sum + test.score, 0) / completedTests.length)
    : 0;

  const openTest = (test) => {
    const path = test.status === 'Completed'
      ? `/student/quiz/${test.id}/result`
      : `/student/quiz/${test.id}`;
    navigate(path);
  };

  return (
    <div className="practice-page-shell">
      <header className="practice-hero">
        <div>
          <span className="practice-eyebrow">Knowledge checks</span>
          <h1>Practice Tests</h1>
          <p>Turn your learning materials into focused quizzes and track what to review next.</p>
        </div>
        <button
          className="practice-primary-button"
          type="button"
          onClick={() => navigate('/student/practice-tests/generate')}
        >
          <span aria-hidden="true">+</span>
          Generate practice test
        </button>
      </header>

      <section className="practice-stat-grid" aria-label="Practice test summary">
        <article className="practice-stat-card">
          <span className="practice-stat-icon practice-stat-icon-purple">PT</span>
          <div><strong>{practiceTests.length}</strong><span>Total tests</span></div>
        </article>
        <article className="practice-stat-card">
          <span className="practice-stat-icon practice-stat-icon-green">OK</span>
          <div><strong>{completedTests.length}</strong><span>Completed</span></div>
        </article>
        <article className="practice-stat-card">
          <span className="practice-stat-icon practice-stat-icon-orange">%</span>
          <div><strong>{averageScore}%</strong><span>Average score</span></div>
        </article>
      </section>

      <section className="practice-library">
        <div className="practice-library-heading">
          <div>
            <h2>Your tests</h2>
            <p>{filteredTests.length} test{filteredTests.length === 1 ? '' : 's'} available</p>
          </div>
          <div className="practice-filters">
            <label className="practice-search">
              <span className="practice-visually-hidden">Search tests</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search tests or courses"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
        </div>

        {filteredTests.length ? (
          <div className="practice-test-grid">
            {filteredTests.map((test) => (
              <article className="practice-test-card" key={test.id}>
                <div className="practice-test-card-top">
                  <span className={`practice-status practice-status-${test.status.toLowerCase()}`}>
                    {test.status}
                  </span>
                  <span className="practice-test-menu" aria-hidden="true">•••</span>
                </div>
                <div className="practice-test-symbol" aria-hidden="true">✓</div>
                <h3>{test.title}</h3>
                <p>{test.course}</p>
                <dl className="practice-test-meta">
                  <div><dt>Questions</dt><dd>{test.questions}</dd></div>
                  <div><dt>Difficulty</dt><dd>{test.difficulty}</dd></div>
                  <div><dt>Duration</dt><dd>{test.duration}</dd></div>
                </dl>
                <div className="practice-test-footer">
                  <span>{test.score === null ? test.updatedAt : `${test.score}% last score`}</span>
                  <button type="button" onClick={() => openTest(test)}>
                    {test.status === 'Completed' ? 'View result' : test.status === 'Draft' ? 'Continue' : 'Start quiz'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="practice-empty-state">
            <div aria-hidden="true">?</div>
            <h3>No matching tests</h3>
            <p>Try another search term or reset the status filter.</p>
            <button type="button" onClick={() => { setQuery(''); setStatus('All'); }}>Clear filters</button>
          </div>
        )}
      </section>
    </div>
  );
}

export default PracticeTestsPage;
