import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../config/constants';

async function sendSurveyEmail(params) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    throw new Error('EmailJS keys are missing from environment variables (VITE_EMAILJS_SERVICE_ID, etc.).');
  }
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: params,
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to submit survey.');
  }
}

export default function SurveyPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', contact: '', rating: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendSurveyEmail({
        user_name: form.name || 'Anonymous',
        user_email: form.contact,
        subject: 'New User Survey Response',
        title: 'New User Survey Response',
        message: `Experience Rating: ${form.rating}/5 Stars\n\nComments: ${form.message}`,
      });

      // 2. Also save locally in localStorage as fallback
      try {
        const existing = JSON.parse(localStorage.getItem('farmsathi_survey') || '[]');
        existing.push({ ...form, createdAt: new Date().toISOString() });
        localStorage.setItem('farmsathi_survey', JSON.stringify(existing));
      } catch { /* ignore localstorage error */ }

      setSubmitted(true);
      showToast('Survey submitted! Thank you for your feedback.', 'success');
      setForm({ name: '', contact: '', rating: '', message: '' });
    } catch (err) {
      showToast(err.message || 'Failed to submit survey.', 'error');
    } finally {
      setLoading(false);
    }
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
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? '⏳ Submitting…' : 'Submit Survey'}
          </button>
        </form>
      </section>
    </main>
  );
}
