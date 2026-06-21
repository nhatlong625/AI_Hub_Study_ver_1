import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/register.css';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [agreeError, setAgreeError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    let hasError = false;

    // Validate Name
    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      hasError = true;
    } else {
      setFullNameError('');
    }

    // Validate Email
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!email.includes('@')) {
      setEmailError('Email is not valid (missing @)');
      hasError = true;
    } else {
      setEmailError('');
    }

    // Validate Password
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      hasError = true;
    } else {
      setPasswordError('');
    }

    // Validate Agreement
    if (!agree) {
      setAgreeError('You must agree to the Terms and Privacy Policy');
      hasError = true;
    } else {
      setAgreeError('');
    }

    if (hasError) return;

    alert(`Account created successfully for: ${fullName} (${email})`);
  };

  return (
    <div className="register-split-container">
      {/* Left Column - Marketing Panel */}
      <div className="register-left-panel">
        <div className="register-left-content">
          <h1 className="register-left-title">
            Revolutionize your learning with AI.
          </h1>
          <p className="register-left-sub">
            Join thousands of students using AI to summarize, analyze, and master their study materials in seconds. Your personal academic co-pilot awaits.
          </p>
        </div>

        <div className="register-left-bottom">
          <span className="register-trusted-label">Trusted by students from</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '12px', width: 'fit-content' }}>
            <div style={{ width: '26px', height: '26px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#FF7A00', letterSpacing: '-0.5px' }}>FPT</span>
            </div>
            <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>FPT University</span>
          </div>
        </div>
      </div>

      {/* Right Column - Registration Form Panel */}
      <div className="register-right-panel">
        <div className="register-form-container">
          <div className="register-form-header">
            <h2 className="register-form-title">Create your account</h2>
            <p className="register-form-subtitle">Start your journey to smarter learning today.</p>
          </div>

          <form className="login-modal-form" onSubmit={handleRegister}>
            {/* Full Name */}
            <div className="login-modal-field">
              <label className="login-modal-field-label">Full Name</label>
              <div className="register-input-icon-wrap">
                <span className="register-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  className="login-modal-input"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              {fullNameError && (
                <p className="error-message" style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                  {fullNameError}
                </p>
              )}
            </div>

            {/* Student Email */}
            <div className="login-modal-field">
              <label className="login-modal-field-label">Student Email</label>
              <div className="register-input-icon-wrap">
                <span className="register-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  className="login-modal-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {emailError && (
                <p className="error-message" style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="login-modal-field">
              <label className="login-modal-field-label">Password</label>
              <div className="register-input-icon-wrap">
                <span className="register-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-modal-input"
                  placeholder="Min. 8 characters"
                  style={{ paddingRight: '48px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-modal-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="error-message" style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                  {passwordError}
                </p>
              )}
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="login-modal-field">
              <label className="login-modal-remember" style={{ alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  className="login-modal-checkbox"
                  style={{ marginTop: '3px' }}
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
                  I agree to the <Link to="/terms" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Privacy Policy</Link>.
                </span>
              </label>
              {agreeError && (
                <p className="error-message" style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                  {agreeError}
                </p>
              )}
            </div>

            {/* Create Account Submit button */}
            <button type="submit" className="login-modal-submit" style={{ marginTop: '8px' }}>
              Create Account
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>

          {/* Divider */}
          <div className="login-modal-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          {/* Social buttons */}
          <div className="login-modal-socials">
            <button className="login-modal-social-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="login-modal-social-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
          </div>

          {/* Footer */}
          <p className="login-modal-footer">
            Already have an account?{' '}
            <Link to="/login" className="login-modal-create-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
