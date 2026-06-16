function PublicFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong>AI StudyHub</strong>
          <p className="muted" style={{ margin: '8px 0 0' }}>
            A modern study platform for students and admins.
          </p>
        </div>
        <div className="footer-links">
          <span className="muted">Documents</span>
          <span className="muted">Quizzes</span>
          <span className="muted">AI Tutor</span>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
