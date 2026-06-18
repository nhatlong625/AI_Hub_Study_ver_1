import { Link } from 'react-router-dom';
import Button from '../../components/common/common/Button';
import desktopMockup from '../../assets/landingImages/desktop_mockup.png';
import studentsIllustration from '../../assets/landingImages/students_illustration.png'
import '../../styles/landing.css';
function LandingPage() {
  return (
    <div className="page-shell" style={{ maxWidth: '100%', padding: 0 }}>
      {/* ── Hero Section ── */}
      <section className="landing-hero-section">
        <span className="landing-hero-badge">Powered by advanced AI technology</span>
        <h1 className="landing-hero-title">
          FSTUDY : The AI Document<br />Assistant for <span>Modern Students</span>
        </h1>
        <p className="landing-hero-subtitle">
          Store, manage, and extract insights from your study materials with the power of artificial intelligence.
        </p>

        <div className="landing-hero-actions">
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
          <button className="landing-btn-demo" type="button" onClick={() => alert('FSTUDY Demo video starting soon!')}>
            Watch Demo
          </button>
        </div>

        {/* Mockup Computer Screen with Floating Badges */}
        <div className="landing-mockup-container">
          {/* Left Floating Badge: Summary Ready */}
          <div className="landing-float-badge left">
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.65rem', color: '#655B7A', fontWeight: 650 }}>Summary Ready</span>
              <span style={{ fontSize: '0.78rem', color: '#1F1637', fontWeight: 750 }}>Philosophy_Notes.pdf</span>
            </div>
          </div>

          {/* Computer Mockup Image */}
          <img src={desktopMockup} alt="FSTUDY Dashboard Mockup" className="landing-mockup-img" />

          {/* Right Floating Badge: Analyzing 90+ docs */}
          <div className="landing-float-badge right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin" style={{ animationDuration: '4s' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span style={{ fontSize: '0.8rem', fontWeight: 750 }}>Analyzing 90+ documents...</span>
          </div>
        </div>
      </section>

      {/* ── Features Section (Academic Ecosystem) ── */}
      <section className="landing-features-section">
        <div className="landing-features-header">
          <h2 className="landing-features-title">Comprehensive Academic Ecosystem</h2>
          <p className="landing-features-sub">Core modules designed for efficiency and results</p>
        </div>

        {/* Features Row 1 (Chatbot & Security) */}
        <div className="landing-features-grid">
          {/* Card 1: AI Chatbot Integration */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon-box purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2a10 10 0 0 1 7.54 16.59l-1.42-1.42A8 8 0 1 0 12 20a7.92 7.92 0 0 0 4.9-1.69l1.42 1.42A10 10 0 1 1 12 2z"/>
                <path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <h3 className="landing-feature-title">AI Chatbot Integration</h3>
            <p className="landing-feature-desc">
              Query your documents directly. Our intelligent assistant extracts key concepts, generates summaries, and answers specific questions from your library.
            </p>
            <div className="landing-feature-tags">
              <span className="landing-feature-tag">#SmartQuery</span>
              <span className="landing-feature-tag">#AutoSummary</span>
            </div>
            {/* Abstract vector illustration placement */}
            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, pointerEvents: 'none' }}>
              <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
          </div>

          {/* Card 2: Identity & Access */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon-box blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className="landing-feature-title">Identity & Access</h3>
            <p className="landing-feature-desc">
              Secure authentication and granular access controls. Keep your private research data protected with industry-standard encryption.
            </p>
          </div>
        </div>

        {/* Features Row 2 (Document Management & Storage) */}
        <div className="landing-features-grid-alt">
          {/* Card 3: Document Management */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon-box green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h3 className="landing-feature-title">Document Management</h3>
            <p className="landing-feature-desc">
              Organize PDF, DOCX, and slides with smart tagging and instant full-text search across your entire academic collection.
            </p>
          </div>

          {/* Card 4: Cloud Storage & Preview */}
          <div className="landing-feature-card" style={{ paddingBottom: '20px' }}>
            <div className="landing-feature-icon-box purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
              </svg>
            </div>
            <h3 className="landing-feature-title">Cloud Storage & Preview</h3>
            <p className="landing-feature-desc" style={{ marginBottom: '14px' }}>
              Access your library from any device. Seamless in-browser previews ensure you never need to download a file just to check its content.
            </p>
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', marginBottom: '20px' }} className="hover-opacity-80">
              Learn more <span>&rarr;</span>
            </Link>
            
            {/* Student Study Vector Illustration inside card */}
            <div className="landing-feature-illustration">
              <img src={studentsIllustration} alt="Students studying with laptops" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>
        </div>

        {/* ── CTA Banner ── */}
        <div className="landing-cta-banner">
          <h2 className="landing-cta-title">Elevate your learning experience today.</h2>
          <p className="landing-cta-sub">
            Join thousands of students who are transforming how they manage knowledge.
          </p>
          <div className="landing-cta-actions">
            <Link to="/register">
              <button className="landing-btn-cta-white" type="button">Start Free Trial</button>
            </Link>
            <button className="landing-btn-cta-outline" type="button" onClick={() => alert('Sales inquiry form coming soon!')}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
