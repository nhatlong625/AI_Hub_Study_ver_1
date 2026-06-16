import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizSources } from '../../mocks/quizMock';

function GeneratePracticeTestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    source: quizSources[0].id,
    questionCount: '10',
    difficulty: 'Intermediate',
    questionType: 'Multiple choice',
    duration: '20',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedSource = quizSources.find((source) => source.id === form.source);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const generateTest = (event) => {
    event.preventDefault();
    setIsGenerating(true);
    window.setTimeout(() => {
      navigate('/student/quiz/generated-practice-test', {
        state: {
          generatedTest: {
            ...form,
            title: form.title.trim() || `${selectedSource.name} Practice Test`,
            course: selectedSource.name,
          },
        },
      });
    }, 650);
  };

  return (
    <div className="practice-page-shell practice-generate-shell">
      <button className="practice-back-button" type="button" onClick={() => navigate('/student/practice-tests')}>
        <span aria-hidden="true">←</span> Back to practice tests
      </button>

      <header className="practice-simple-header">
        <span className="practice-eyebrow">AI quiz builder</span>
        <h1>Generate a Practice Test</h1>
        <p>Choose your source and learning goals. Your quiz will be ready in a few seconds.</p>
      </header>

      <form className="practice-generate-grid" onSubmit={generateTest}>
        <section className="practice-form-card">
          <div className="practice-section-title">
            <span>1</span>
            <div><h2>Test details</h2><p>Set a clear goal for this practice session.</p></div>
          </div>

          <label className="practice-field">
            <span>Test title <small>Optional</small></span>
            <input
              value={form.title}
              onChange={updateField('title')}
              placeholder={`${selectedSource.name} Practice Test`}
            />
          </label>

          <label className="practice-field">
            <span>Learning source</span>
            <select value={form.source} onChange={updateField('source')}>
              {quizSources.map((source) => (
                <option value={source.id} key={source.id}>
                  {source.name} ({source.documents} documents)
                </option>
              ))}
            </select>
          </label>

          <div className="practice-field-row">
            <label className="practice-field">
              <span>Number of questions</span>
              <select value={form.questionCount} onChange={updateField('questionCount')}>
                <option value="5">5 questions</option>
                <option value="10">10 questions</option>
                <option value="15">15 questions</option>
                <option value="20">20 questions</option>
              </select>
            </label>
            <label className="practice-field">
              <span>Time limit</span>
              <select value={form.duration} onChange={updateField('duration')}>
                <option value="10">10 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
              </select>
            </label>
          </div>
        </section>

        <section className="practice-form-card">
          <div className="practice-section-title">
            <span>2</span>
            <div><h2>Question settings</h2><p>Adjust the challenge level and format.</p></div>
          </div>

          <fieldset className="practice-choice-field">
            <legend>Difficulty</legend>
            <div className="practice-segmented">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <label key={level} className={form.difficulty === level ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={form.difficulty === level}
                    onChange={updateField('difficulty')}
                  />
                  <strong>{level}</strong>
                  <small>{level === 'Beginner' ? 'Core concepts' : level === 'Intermediate' ? 'Applied knowledge' : 'Deep reasoning'}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="practice-choice-field">
            <legend>Question type</legend>
            <div className="practice-type-options">
              {['Multiple choice', 'True or false', 'Mixed questions'].map((type) => (
                <label key={type} className={form.questionType === type ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="questionType"
                    value={type}
                    checked={form.questionType === type}
                    onChange={updateField('questionType')}
                  />
                  <span aria-hidden="true">{type === 'Multiple choice' ? 'AB' : type === 'True or false' ? 'TF' : 'MX'}</span>
                  <strong>{type}</strong>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <aside className="practice-preview-card">
          <span className="practice-preview-badge">Preview</span>
          <div className="practice-preview-icon" aria-hidden="true">AI</div>
          <h2>{form.title.trim() || `${selectedSource.name} Practice Test`}</h2>
          <p>Generated from {selectedSource.documents} approved learning documents.</p>
          <dl>
            <div><dt>Questions</dt><dd>{form.questionCount}</dd></div>
            <div><dt>Difficulty</dt><dd>{form.difficulty}</dd></div>
            <div><dt>Format</dt><dd>{form.questionType}</dd></div>
            <div><dt>Time limit</dt><dd>{form.duration} min</dd></div>
          </dl>
          <button className="practice-primary-button practice-generate-button" type="submit" disabled={isGenerating}>
            {isGenerating ? 'Generating test...' : 'Generate and start'}
          </button>
          <small>You can review all questions before submitting.</small>
        </aside>
      </form>
    </div>
  );
}

export default GeneratePracticeTestPage;
