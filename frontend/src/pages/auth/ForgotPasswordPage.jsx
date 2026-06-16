import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logoImg from '../../assets/images/logo.png';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isResetStep = searchParams.get('step') === 'reset';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Step 1: Request Password Reset Code
  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    
    // Navigate to Verify Email page with the email in query parameters
    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  // Step 3: Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword) {
      setPasswordError('Password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    
    alert('Your password has been reset successfully!');
    navigate('/login');
  };

  return (
    <div className="auth-shell">
      {!isResetStep ? (
        /* Step 1: Enter Email */
        <div className="login-modal-card">
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <Link to="/">
              <img
                src={logoImg}
                alt="FSTUDY"
                style={{
                  height: '56px',
                  objectFit: 'contain',
                  mixBlendMode: 'multiply',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </Link>
          </div>

          {/* Header */}
          <div className="login-modal-header" style={{ marginBottom: '20px' }}>
            <span className="login-modal-secure-label" style={{ letterSpacing: '0.12em' }}>SECURITY</span>
            <h2 className="login-modal-title" style={{ fontSize: '1.65rem' }}>Forgot Password?</h2>
            <p className="login-modal-subtitle" style={{ fontSize: '0.88rem', padding: '0 10px', lineHeight: '1.5' }}>
              Enter your email address and we'll send you a code to reset your password.
            </p>
          </div>

          {/* Form */}
          <form className="login-modal-form" onSubmit={handleSendEmail}>
            <div className="login-modal-field">
              <label className="login-modal-field-label">Email Address</label>
              <input
                type="email"
                className="login-modal-input"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {emailError && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                  {emailError}
                </p>
              )}
            </div>

            <button type="submit" className="login-modal-submit" style={{ marginTop: '8px' }}>
              Send
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>

          {/* Back to Login Footer */}
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.88rem', marginTop: '24px', transition: 'opacity 0.15s' }} className="hover-opacity-80">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Login
          </Link>
        </div>
      ) : (
        /* Step 3: Reset Password */
        <div className="login-modal-card" style={{ borderTop: '1px solid rgba(124, 58, 237, 0.08)' }}>
          {/* Override top border to remove shimmer bar */}
          <style>{`
            .login-modal-card::before { display: none !important; }
          `}</style>

          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <Link to="/">
              <img
                src={logoImg}
                alt="FSTUDY"
                style={{
                  height: '56px',
                  objectFit: 'contain',
                  mixBlendMode: 'multiply',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </Link>
          </div>

          {/* Header */}
          <div className="login-modal-header" style={{ marginBottom: '24px', marginTop: '10px' }}>
            <h2 className="login-modal-title" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Reset Password</h2>
            <p className="login-modal-subtitle" style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--color-text-soft)' }}>
              Set your new password below to regain access to your account.
            </p>
          </div>

          {/* Form */}
          <form className="login-modal-form" onSubmit={handleResetPassword}>
            {/* New Password */}
            <div className="login-modal-field">
              <label className="login-modal-field-label">New Password</label>
              <div className="register-input-icon-wrap" style={{ width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-modal-input"
                  placeholder="••••••••"
                  style={{ paddingRight: '48px', background: 'var(--color-primary-faint)' }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
            </div>

            {/* Confirm Password */}
            <div className="login-modal-field">
              <label className="login-modal-field-label">Confirm New Password</label>
              <div className="register-input-icon-wrap" style={{ width: '100%' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="login-modal-input"
                  placeholder="••••••••"
                  style={{ paddingRight: '48px', background: 'var(--color-primary-faint)' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-modal-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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
                <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                  {passwordError}
                </p>
              )}
            </div>

            <button type="submit" className="login-modal-submit" style={{ marginTop: '8px', background: 'var(--color-primary)' }}>
              Reset Password
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>

          {/* Back to Login */}
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--color-text-soft)', fontWeight: 600, fontSize: '0.88rem', marginTop: '28px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default ForgotPasswordPage;
