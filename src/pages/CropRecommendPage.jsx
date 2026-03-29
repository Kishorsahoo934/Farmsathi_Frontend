import { useState } from 'react';
import { API_BASE_URL } from '../config/constants';
import { useToast } from '../context/ToastContext';

export default function CropRecommendPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ nitrogen: '', phosphorus: '', potassium: '', temperature: '', humidity: '', ph: '', rainfall: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const res = await fetch(`${API_BASE_URL}/crop-recommend`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Failed to get recommendation');
      const data = await res.json();
      setResult(data.recommended_crop || data.crop || 'See result above');
      showToast('Crop recommendation ready!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'nitrogen', label: 'Nitrogen (N)', min: 0 },
    { name: 'phosphorus', label: 'Phosphorus (P)', min: 0 },
    { name: 'potassium', label: 'Potassium (K)', min: 0 },
    { name: 'temperature', label: 'Temperature (°C)' },
    { name: 'humidity', label: 'Humidity (%)', min: 0, max: 100 },
    { name: 'ph', label: 'pH', min: 0, max: 14, step: 0.1 },
    { name: 'rainfall', label: 'Rainfall (mm)', min: 0 },
  ];

  return (
    <main className="page-main">
      <section className="page-header">
        <h1>🌱 Crop Recommendation</h1>
        <p className="muted-text">Enter your soil and weather parameters to get the best crop suggestion.</p>
      </section>
      <section className="form-section">
        <form onSubmit={handleSubmit} className="grid-form">
          {fields.map((f) => (
            <div className="form-group" key={f.name}>
              <label>{f.label}</label>
              <input
                type="number"
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                min={f.min}
                max={f.max}
                step={f.step ?? 0.1}
                required
                placeholder={f.label}
              />
            </div>
          ))}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Analyzing…' : '🌾 Get Recommendation'}
            </button>
          </div>
        </form>
        {result && (
          <div className="result-card">
            <h3>✅ Recommended Crop</h3>
            <p className="highlight" style={{ fontSize: '1.5rem' }}>{result}</p>
            <p className="muted-text">Based on your soil profile and climate conditions.</p>
          </div>
        )}
      </section>
    </main>
  );
}
