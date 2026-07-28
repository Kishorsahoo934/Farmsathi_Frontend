import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal({ onClose }) {
  const { login, signup, loginWithGoogle, getFirebaseErrorMessage } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { 
      setError('Password must be at least 6 characters.'); 
      return; 
    }
    setLoading(true);
    try {
      await signup(email, password);
      showToast('Account created! Welcome to FarmSathi 🌾', 'success');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast('Welcome to FarmSathi 🌾', 'success');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-dialog" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <button className={`tab-button ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
            Login
          </button>
          <button className={`tab-button ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>
            Sign Up
          </button>
        </div>

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
            <form onSubmit={handleSignup} className="auth-form">
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
                {loading ? '⏳ Signing up…' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="divider">or</div>
          <button 
            type="button" 
            onClick={handleGoogleSignIn} 
            className="btn btn-google full-width"
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.13h3.94c2.31-2.13 3.6-5.27 3.6-8.75z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.94-3.13c-1.1.74-2.5 1.18-4.02 1.18-3.09 0-5.71-2.09-6.64-4.9H1.36v3.23A11.996 11.996 0 0 0 12 24z"/>
              <path fill="#FBBC05" d="M5.36 14.34A7.16 7.16 0 0 1 5 12c0-.82.14-1.62.4-2.38V6.39H1.36A11.996 11.996 0 0 0 0 12c0 2.24.62 4.33 1.69 6.13l3.67-1.79z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44A11.93 11.93 0 0 0 12 0C7.26 0 3.2 2.65 1.36 6.39l4 .02c.93-2.81 3.55-4.9 6.64-4.9z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
