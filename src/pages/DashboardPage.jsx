import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { to: '/crop-recommend', icon: '🌱', title: 'Crop Recommendation', desc: 'AI-powered crop suggestions based on soil & weather parameters.', color: '#2e7d32' },
  { to: '/fertilizer-recommend', icon: '🧪', title: 'Fertilizer Recommendation', desc: 'Optimal fertilizer mix tailored to your soil and crop type.', color: '#1565c0' },
  { to: '/disease-detect', icon: '🔬', title: 'Crop Disease Detection', desc: 'Upload leaf images to identify diseases and get a treatment PDF.', color: '#e53935' },
];

const stats = [
  { label: 'Crops Supported', value: '22+', icon: '🌾' },
  { label: 'Disease Classes', value: '38+', icon: '🦠' },
  { label: 'Fertilizers', value: '7', icon: '🧪' },
  { label: 'AI Models', value: '3', icon: '🤖' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Farmer';

  return (
    <div className="db-wrapper">
      {/* Hero greeting */}
      <div className="db-hero">
        <div className="db-hero-content">
          <p className="db-greeting">Welcome back,</p>
          <h1 className="db-name">{firstName} 👋</h1>
          <p className="db-subtitle">Your smart farming dashboard — powered by AI</p>
        </div>
        <div className="db-hero-badge">🌾</div>
      </div>

      {/* Stats row */}
      <div className="db-stats-row">
        {stats.map((s) => (
          <div className="db-stat-card" key={s.label}>
            <span className="db-stat-icon">{s.icon}</span>
            <span className="db-stat-value">{s.value}</span>
            <span className="db-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <h2 className="db-section-title">🚀 Tools</h2>
      <div className="db-feature-grid">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="db-feature-card" style={{ '--card-accent': f.color }}>
            <div className="db-feature-icon">{f.icon}</div>
            <div className="db-feature-content">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
            <span className="db-feature-arrow">→</span>
          </Link>
        ))}
      </div>

      {/* Quick tip */}
      <div className="db-tip-banner">
        <span className="db-tip-icon">💡</span>
        <div>
          <strong>Pro Tip:</strong> Use the Disease Detection tool after every monsoon season to catch infections early and protect your yield.
        </div>
      </div>
    </div>
  );
}
