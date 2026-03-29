import { useState } from 'react';
import { API_BASE_URL, SOIL_TYPES, CROP_TYPES } from '../config/constants';
import { useToast } from '../context/ToastContext';

export default function FertilizerRecommendPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ temp: '', humidity: '', moisture: '', nitrogen: '', phosphorous: '', potassium: '', ph: '', soil_type: '', crop_type: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const res = await fetch(`${API_BASE_URL}/fertilizer-recommend`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Failed to get recommendation');
      const data = await res.json();
      setResult(data.recommended_fertilizer || data.fertilizer || 'See result above');
      showToast('Fertilizer recommendation ready!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&hourly=soil_moisture_0_to_1cm`);
          if (!res.ok) throw new Error('API Error');
          const data = await res.json();
          
          let moistureVal = '';
          if (data.hourly && data.hourly.soil_moisture_0_to_1cm && data.hourly.soil_moisture_0_to_1cm.length > 0) {
            moistureVal = (data.hourly.soil_moisture_0_to_1cm[0] * 100).toFixed(1);
          }

          setForm(prev => ({
            ...prev,
            temp: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            moisture: moistureVal,
          }));
          showToast('Location detected! Weather and soil data filled.', 'success');
        } catch (err) {
          showToast('Failed to fetch data from Open-Meteo.', 'error');
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        showToast('Unable to retrieve your location.', 'error');
        setFetchingLocation(false);
      }
    );
  };

  const numFields = [
    { name: 'temp', label: 'Temperature (°C)' },
    { name: 'humidity', label: 'Humidity (%)', min: 0, max: 100 },
    { name: 'moisture', label: 'Moisture (%)', min: 0, max: 100 },
    { name: 'nitrogen', label: 'Nitrogen (N)', min: 0 },
    { name: 'phosphorous', label: 'Phosphorous (P)', min: 0 },
    { name: 'potassium', label: 'Potassium (K)', min: 0 },
    { name: 'ph', label: 'pH', min: 0, max: 14, step: 0.1 },
  ];

  return (
    <main className="page-main">
      <section className="page-header">
        <h1>🧪 Fertilizer Recommendation</h1>
        <p className="muted-text">Get an optimal fertilizer plan based on your soil and crop details.</p>
      </section>
      <section className="form-section">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleAutoFill} 
            disabled={fetchingLocation}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            {fetchingLocation ? '⏳ Detecting...' : '📍 Auto-fill Weather & Soil Data'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid-form">
          {numFields.map((f) => (
            <div className="form-group" key={f.name}>
              <label>{f.label}</label>
              <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} min={f.min} max={f.max} step={f.step ?? 0.1} required placeholder={f.label} />
            </div>
          ))}
          <div className="form-group">
            <label>Soil Type</label>
            <select name="soil_type" value={form.soil_type} onChange={handleChange} required>
              <option value="">Select soil type</option>
              {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Crop Type</label>
            <select name="crop_type" value={form.crop_type} onChange={handleChange} required>
              <option value="">Select crop</option>
              {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Analyzing…' : '🧪 Get Recommendation'}
            </button>
          </div>
        </form>
        {result && (
          <div className="result-card">
            <h3>✅ Recommended Fertilizer</h3>
            <p className="highlight" style={{ fontSize: '1.5rem' }}>{result}</p>
            <p className="muted-text">Apply as per recommended dosage for your soil conditions.</p>
          </div>
        )}
      </section>
    </main>
  );
}
