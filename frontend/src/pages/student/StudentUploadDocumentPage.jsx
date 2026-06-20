import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { documentApi, semesterApi } from "../../services/libraryApi";

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.userId || user.id || 1;
  } catch {
    return 1;
  }
}

function StudentUploadDocumentPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    semesterApi
      .getAll()
      .then((data) => {
        if (!cancelled) setSemesters(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Cannot load courses. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSubjects(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const subjects = useMemo(
    () =>
      semesters.flatMap((semester) =>
        (semester.subjects || []).map((subject) => ({
          ...subject,
          semesterName: semester.semesterName,
        })),
      ),
    [semesters],
  );

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    if (!title.trim()) {
      setTitle(selectedFile.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim() || !subjectId) {
      setError("Please choose a file, title, and course before uploading.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const newDoc = await documentApi.upload(
        file,
        title.trim(),
        Number(subjectId),
        getCurrentUserId(),
        "PRIVATE",
      );
      navigate("/student/documents/" + newDoc.documentId, {
        state: { doc: newDoc },
      });
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Upload"
        title="Add new study documents"
        description="Prepare files for summaries, AI tutoring, and quiz generation."
      />
      <section className="split-panel">
        <Card
          title="Document details"
          description="Choose a course and save this file to your library."
        >
          <div className="section-stack">
            <Input
              label="Title"
              placeholder="Neural Networks Revision Pack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="input-group">
              <span className="input-label">Course</span>
              <select
                className="input"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={loadingSubjects}
              >
                <option value="">
                  {loadingSubjects ? "Loading courses..." : "Select a course"}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    {subject.subjectName} - {subject.semesterName}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Description"
              as="textarea"
              placeholder="Add a short summary of the material"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload document"}
            </Button>
          </div>
        </Card>
        <Card
          title="Drop zone"
          description="Upload notes, PDFs, slide decks, and study summaries."
        >
          <div
            className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelect(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="empty-illustration">UP</div>
            <h3 className="card-title">
              {file ? file.name : "Drag and drop files here"}
            </h3>
            <p className="card-description">
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected`
                : "Supports notes, PDFs, slide decks, and study summaries."}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.txt"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
            <Button
              variant="secondary"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose files
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default StudentUploadDocumentPage;
