import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { documentApi } from "../../services/libraryApi";
import { practiceTestApi } from "../../services/practiceTestApi";

const USER_ID = 1;

function StudentGeneratePracticeTestPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({
    documentId: "",
    title: "",
    totalQuestions: 10,
    timeLimit: 20,
    difficulty: "Medium",
    questionType: "Multiple Choice",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    documentApi
      .getByUser(USER_ID)
      .then((items) => {
        setDocuments(items);
        if (items[0]) {
          setForm((current) => ({
            ...current,
            documentId: items[0].documentId,
            title: `${items[0].title || items[0].documentName} Practice Test`,
          }));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedDocument = useMemo(
    () => documents.find((doc) => String(doc.documentId) === String(form.documentId)),
    [documents, form.documentId],
  );

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.documentId) {
      setError("Please choose a document first.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const test = await practiceTestApi.generate({
        ...form,
        userId: USER_ID,
        documentId: Number(form.documentId),
        totalQuestions: Number(form.totalQuestions),
        timeLimit: Number(form.timeLimit),
      });
      navigate(`/student/quiz/${test.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="practice-page">
      <button className="practice-back" type="button" onClick={() => navigate("/student/practice-tests")}>
        Back to tests
      </button>

      <form className="practice-generate-layout" onSubmit={submit}>
        <section className="practice-panel">
          <h1>Generate a Practice Test</h1>
          <p>Select one uploaded file. Spring Boot extracts its text, Python AI generates questions, then the result is saved into the existing quiz tables.</p>

          {error && <div className="practice-error">{error}</div>}
          {loading ? (
            <div className="practice-empty">Loading your documents...</div>
          ) : (
            <>
              <label className="practice-field">
                <span>Source document</span>
                <select value={form.documentId} onChange={(event) => update("documentId", event.target.value)}>
                  {documents.map((doc) => (
                    <option key={doc.documentId} value={doc.documentId}>
                      {doc.title || doc.documentName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="practice-field">
                <span>Test title</span>
                <input value={form.title} onChange={(event) => update("title", event.target.value)} />
              </label>

              <div className="practice-field-row">
                <label className="practice-field">
                  <span>Questions</span>
                  <input min="1" max="30" type="number" value={form.totalQuestions} onChange={(event) => update("totalQuestions", event.target.value)} />
                </label>
                <label className="practice-field">
                  <span>Time limit</span>
                  <input min="5" max="180" type="number" value={form.timeLimit} onChange={(event) => update("timeLimit", event.target.value)} />
                </label>
              </div>

              <div className="practice-field-row">
                <label className="practice-field">
                  <span>Difficulty</span>
                  <select value={form.difficulty} onChange={(event) => update("difficulty", event.target.value)}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </label>
                <label className="practice-field">
                  <span>Question type</span>
                  <select value={form.questionType} onChange={(event) => update("questionType", event.target.value)}>
                    <option>Multiple Choice</option>
                  </select>
                </label>
              </div>

              <button className="practice-primary" type="submit" disabled={saving || !documents.length}>
                {saving ? "Generating..." : "Generate with AI"}
              </button>
            </>
          )}
        </section>

        <aside className="practice-preview">
          <span>Preview</span>
          <h2>{form.title || "Practice Test"}</h2>
          <p>{selectedDocument?.documentName || "Choose a document to generate questions."}</p>
          <dl>
            <div><dt>Questions</dt><dd>{form.totalQuestions}</dd></div>
            <div><dt>Difficulty</dt><dd>{form.difficulty}</dd></div>
            <div><dt>Time</dt><dd>{form.timeLimit} min</dd></div>
          </dl>
        </aside>
      </form>
    </div>
  );
}

export default StudentGeneratePracticeTestPage;
