import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logoImg from '../../assets/images/logo.png';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [codeError, setCodeError] = useState('');

  const handleCodeChange = (value, index) => {
    if (value !== '' && isNaN(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleCodeKeyDown = (e, index) => {
    // Backspace on empty field moves focus backward
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length < 6) {
      setCodeError('Please enter the full 6-digit code');
      return;
    }
    setCodeError('');
    
    // Successfully verified -> Navigate back to forgot password to reset password
    navigate(`/forgot-password?step=reset&email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="auth-shell">
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
          <span className="login-modal-secure-label" style={{ letterSpacing: '0.08em' }}>IDENTITY VERIFICATION</span>
          <h2 className="login-modal-title" style={{ fontSize: '1.65rem' }}>Verify your email</h2>
          <p className="login-modal-subtitle" style={{ fontSize: '0.88rem', padding: '0 10px', lineHeight: '1.5' }}>
            We've sent a 6-digit code to <br />
            <strong style={{ color: 'var(--color-text)' }}>{email || 'alex@example.com'}</strong>
          </p>
        </div>

        {/* 6-Digit input boxes */}
        <form className="login-modal-form" onSubmit={handleVerifyCode}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '8px 0' }}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(e.target.value, idx)}
                onKeyDown={(e) => handleCodeKeyDown(e, idx)}
                id={`code-${idx}`}
                className="login-modal-input"
                style={{ width: '48px', height: '54px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', padding: 0 }}
                autoComplete="one-time-code"
              />
            ))}
          </div>
          {codeError && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', textAlign: 'center', margin: '-4px 0 4px' }}>
              {codeError}
            </p>
          )}

          <button type="submit" className="login-modal-submit" style={{ marginTop: '8px' }}>
            Verify Code
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </form>

        {/* Didn't receive code footer */}
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-soft)', marginTop: '20px', marginBottom: 0 }}>
          Didn't receive the code?{' '}
          <button
            type="button"
            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => alert('Verification code resent!')}
          >
            Resend
          </button>
        </p>

        {/* Back to Login Link */}
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--color-text-soft)', fontWeight: 600, fontSize: '0.88rem', marginTop: '24px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
