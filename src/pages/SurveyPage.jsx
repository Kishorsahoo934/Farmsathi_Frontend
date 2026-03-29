import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function SurveyPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', contact: '', rating: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const existing = JSON.parse(localStorage.getItem('farmsathi_survey') || '[]');
      existing.push({ ...form, createdAt: new Date().toISOString() });
      localStorage.setItem('farmsathi_survey', JSON.stringify(existing));
    } catch { /* ignore */ }
    setSubmitted(true);
    showToast('Survey submitted! Thank you for your feedback.', 'success');
    setForm({ name: '', contact: '', rating: '', message: '' });
  };

  return (
    <main className="page-main">
      <section className="page-header">
        <h1>📋 User Survey</h1>
        <p className="muted-text">Help us understand how FarmSathi can better support you.</p>
      </section>
      <section className="form-section">
        {submitted && (
          <div className="result-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#2e7d32' }}>✅ Thank you!</h3>
            <p>Your survey response has been recorded. We appreciate your time!</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="vertical-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Phone or Email</label>
            <input type="text" name="contact" value={form.contact} onChange={handleChange} required placeholder="Contact info" />
          </div>
          <div className="form-group">
            <label>Overall Experience</label>
            <select name="rating" value={form.rating} onChange={handleChange} required>
              <option value="">Select rating</option>
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Poor</option>
              <option value="1">⭐ Very Poor</option>
            </select>
          </div>
          <div className="form-group">
            <label>Comments</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={4} required placeholder="Share your thoughts…" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            Submit Survey
          </button>
        </form>
      </section>
    </main>
  );
}
