import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast('Signed out successfully.', 'info');
    navigate('/');
  };

  const protectedLinks = [
    { to: '/dashboard', label: '🏠 Home' },
    { to: '/crop-recommend', label: '🌱 Crop Rec.' },
    { to: '/disease-detect', label: '🔬 Disease' },
    { to: '/fertilizer-recommend', label: '🧪 Fertilizer' },
    { to: '/survey', label: 'Survey' },
    { to: '/feedback', label: 'Feedback' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className="top-nav">
        <div className="nav-left">
          <img src="/logo.jpg" alt="FarmSathi Logo" className="logo" />
          <span className="brand-name">FarmSathi</span>
        </div>

        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>
            About
          </NavLink>
          {user && protectedLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-right">
          {user ? (
            <div className="nav-user-section">
              <span className="nav-username">
                👤 {user.displayName || user.email?.split('@')[0]}
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>Sign Out</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Get Started
            </button>
          )}
        </div>
      </header>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
