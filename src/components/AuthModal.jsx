import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// OTP 6-box input
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.split('');

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/, '');
    const arr = digits.slice();
    arr[i] = val;
    onChange(arr.join('').slice(0, 6));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="otp-boxes">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          className="otp-box"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

export default function AuthModal({ onClose }) {
  const { login, signup, loginWithGoogle, sendOtp, verifyOtp, getFirebaseErrorMessage } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('login'); // 'login' | 'signup' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRequest = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await sendOtp(email);
      setPendingEmail(email);
      setPendingPassword(password);
      setTab('otp');
      setResendCooldown(60);
      showToast('OTP sent to your email!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setError('');
    setLoading(true);
    try {
      await verifyOtp(pendingEmail, otp);
      await signup(pendingEmail, pendingPassword);
      showToast('Account created! Welcome to FarmSathi 🌾', 'success');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await sendOtp(pendingEmail);
      setResendCooldown(60);
      showToast('New OTP sent!', 'success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
      showToast('Signed in with Google!', 'success');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    }
  };

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-dialog" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose}>✕</button>

        {tab !== 'otp' && (
          <div className="modal-header">
            <button className={`tab-button ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
              Login
            </button>
            <button className={`tab-button ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>
              Sign Up
            </button>
          </div>
        )}

        <div className="modal-body">
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
              </div>
              {error && <div className="form-error">{error}</div>}
              <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                {loading ? '⏳ Logging in…' : 'Login'}
              </button>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignupRequest} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" />
              </div>
              {error && <div className="form-error">{error}</div>}
              <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                {loading ? '⏳ Sending OTP…' : '📧 Send Verification Code'}
              </button>
            </form>
          )}

          {tab === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="otp-header">
                <div className="otp-icon">✉️</div>
                <h3>Check your inbox</h3>
                <p>We sent a 6-digit code to <strong>{pendingEmail}</strong></p>
              </div>
              <OtpInput value={otp} onChange={setOtp} />
              {error && <div className="form-error">{error}</div>}
              <button type="submit" className="btn btn-primary full-width" disabled={loading || otp.length !== 6}>
                {loading ? '⏳ Verifying…' : '✅ Verify & Create Account'}
              </button>
              <div className="otp-resend">
                {resendCooldown > 0 ? (
                  <span className="resend-cooldown">Resend in {resendCooldown}s</span>
                ) : (
                  <button type="button" className="resend-btn" onClick={handleResendOtp} disabled={loading}>
                    Resend Code
                  </button>
                )}
                <button type="button" className="resend-btn" onClick={() => { setTab('signup'); setError(''); setOtp(''); }}>
                  ← Change Email
                </button>
              </div>
            </form>
          )}

          {tab !== 'otp' && (
            <>
              <div className="divider"><span>OR</span></div>
              <button type="button" className="btn btn-google full-width" onClick={handleGoogle}>
                <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 8, verticalAlign: 'middle' }}>
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712 0-.595.102-1.173.282-1.712V4.956H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.044l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.956L3.964 7.288C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
