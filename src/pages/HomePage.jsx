import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleGetStarted = () => {
    if (user) navigate('/dashboard');
    else setShowModal(true);
  };

  return (
    <>
      <main>
        <section className="hero-section" style={{ backgroundImage: "url('/background.jpg')" }}>
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1>New path in agriculture,<br />new hope for development</h1>
            <p>A unified AI-powered platform for all farmers</p>
            <button className="btn btn-accent" onClick={handleGetStarted}>
              🌾 Get Started
            </button>
          </div>
        </section>

        <section id="about" className="content-section">
          <h2>About FarmSathi</h2>
          <p>
            FarmSathi empowers farmers with smart AI tools for crop recommendations,
            fertilizer management, and early disease detection. Backed by modern
            machine learning models and expert insights, it helps increase yield
            and reduce risk across Odisha and beyond.
          </p>
          <div className="card-grid" style={{ marginTop: '2rem' }}>
            {[
              { icon: '🌱', title: 'Crop Recommendation', desc: 'AI-powered suggestions for the best crop based on your soil and conditions.' },
              { icon: '🧪', title: 'Fertilizer Guide', desc: 'Get optimal fertilizer plans tailored to your specific soil and crop type.' },
              { icon: '🔬', title: 'Disease Detection', desc: 'Upload leaf images to detect diseases early and get treatment plans.' },
              { icon: '💬', title: 'AI Chatbot', desc: 'Ask any farming question and get expert responses instantly.' },
            ].map((c) => (
              <div key={c.title} className="feature-card" onClick={handleGetStarted} style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
