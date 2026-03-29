import { useState, useRef } from 'react';
import { API_BASE_URL } from '../config/constants';
import { useToast } from '../context/ToastContext';

export default function DiseaseDetectPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setPdfUrl(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Pure onClick — NO form submit, guaranteed no page refresh
  const handleDetect = async () => {
    if (!selectedFile) {
      showToast('Please select a leaf image first.', 'error');
      return;
    }
    setLoading(true);
    setResult(null);
    setPdfUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      const res = await fetch(`${API_BASE_URL}/predict-disease`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      if (data.status === 'error' || data.leaf_detected === false) {
        setResult({ error: data.message || 'No leaf detected. Please upload a clear leaf photo.' });
        showToast('No leaf detected.', 'error');
        return;
      }

      const conf = data.confidence ? `${parseFloat(data.confidence).toFixed(1)}%` : null;
      setResult({ disease: data.predicted_disease || 'Unknown', confidence: conf, summary: data.summary || data.recommendation });

      if (data.report_pdf_url) {
        const url = data.report_pdf_url.startsWith('http')
          ? data.report_pdf_url
          : `${API_BASE_URL}${data.report_pdf_url.startsWith('/') ? '' : '/'}${data.report_pdf_url}`;
        setPdfUrl(url);
      }

      showToast(`Disease detected: ${data.predicted_disease}`, 'success');
    } catch (err) {
      setResult({ error: err.message });
      showToast(err.message || 'Detection failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-main">
      <section className="page-header">
        <h1>🔬 Crop Disease Detection</h1>
        <p className="muted-text">Upload a clear leaf image to detect disease and download a treatment report.</p>
      </section>

      <section className="form-section">
        <div className="vertical-form">
          <div className="form-group">
            <label>Leaf Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {preview && (
            <div className="image-preview-wrapper">
              <img src={preview} alt="Preview" className="image-preview" />
            </div>
          )}

          {/* type="button" ensures NO form submission ever happens */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDetect}
            disabled={loading || !selectedFile}
            style={{ alignSelf: 'flex-start' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="detect-spinner-sm" /> Analyzing…
              </span>
            ) : '🔍 Detect Disease'}
          </button>
        </div>

        {loading && (
          <div className="result-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="detect-spinner" />
            <p style={{ marginTop: '1rem', color: '#555' }}>Analyzing your leaf image… This may take a moment.</p>
          </div>
        )}

        {result && !loading && (
          <div className="result-card" style={{ marginTop: '1.5rem' }}>
            {result.error ? (
              <>
                <h3 style={{ color: '#e53935' }}>⚠️ {result.error.includes('leaf') ? 'No Leaf Detected' : 'Error'}</h3>
                <p>{result.error}</p>
              </>
            ) : (
              <>
                <h3 style={{ color: '#2e7d32' }}>✅ Disease Detected</h3>
                <p><strong>Disease:</strong> {result.disease}</p>
                {result.confidence && <p><strong>Confidence:</strong> {result.confidence}</p>}
                {result.summary && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <strong>Quick Actions:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      {result.summary.split('\n').filter(Boolean).map((line, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem', color: '#444', fontSize: '0.92rem' }}>
                          <span style={{ color: '#4caf50', fontWeight: 700 }}>•</span>
                          <span>{line.replace(/^[-•*]\s*/, '')}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>📄 Download the full report below for complete treatment details.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {pdfUrl && !loading && (
          <a
            href={pdfUrl}
            className="btn btn-secondary"
            download="Disease_Report.pdf"
            target="_blank"
            rel="noreferrer"
            style={{ marginTop: '1rem', display: 'inline-block' }}
          >
            📄 Download Disease Report (PDF)
          </a>
        )}
      </section>
    </main>
  );
}
