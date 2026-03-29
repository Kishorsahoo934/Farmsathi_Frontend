import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../config/constants';

async function sendEmail(params) {
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
  if (!res.ok) throw new Error('Failed to send message.');
}

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendEmail({
        from_name: form.name || 'Anonymous',
        from_email: form.email,
        phone: form.phone || 'Not provided',
        message: form.message,
        subject: 'New Contact Message from FarmSathi',
      });
      showToast('Message sent! We\'ll get back to you soon.', 'success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      showToast(err.message || 'Failed to send message.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-main">
      <section className="page-header">
        <h1>📞 Contact Us</h1>
        <p className="muted-text">Have any questions or need assistance? Send us a message.</p>
      </section>
      <section className="form-section">
        <form onSubmit={handleSubmit} className="vertical-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Phone (optional)</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={4} required placeholder="Describe your issue or question…" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? '⏳ Sending…' : '📨 Send Message'}
          </button>
        </form>
      </section>
    </main>
  );
}
