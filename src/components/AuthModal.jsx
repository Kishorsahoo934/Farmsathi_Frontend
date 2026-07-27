import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal({ onClose }) {
  const { login, signup, getFirebaseErrorMessage } = useAuth();
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
        </div>
      </div>
    </div>
  );
}
