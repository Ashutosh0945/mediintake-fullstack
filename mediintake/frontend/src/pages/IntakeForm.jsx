import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SYMPTOM_LIST = [
  '💔 Chest Pain', '😮‍💨 Breathlessness', '🫀 Palpitations',
  '💧 Sweating', '😵 Dizziness', '🤒 Fever',
  '🤕 Headache', '🤢 Nausea', '🤮 Vomiting',
  '😴 Fatigue', '🦴 Body Pain', '🤧 Cough',
  '👁 Vision Changes', '🗣 Slurred Speech', '🦵 Limb Weakness'
];

const DURATION_OPTS = [
  { val: '<6h',   label: 'Less than 6 hours' },
  { val: '6-24h', label: '6 – 24 hours' },
  { val: '1-3d',  label: '1 – 3 days' },
  { val: '>3d',   label: 'More than 3 days' }
];

export default function IntakeForm() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms]   = useState([]);
  const [severity, setSeverity]   = useState(3);
  const [duration, setDuration]   = useState('6-24h');
  const [notes, setNotes]         = useState('');
  const [vitals, setVitals]       = useState({ temperature: '', heartRate: '', bloodPressureSystolic: '', bloodPressureDiastolic: '', oxygenSaturation: '' });
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const toggleSymptom = s => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const onVitalChange = e => setVitals(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    if (symptoms.length === 0) { setError('Please select at least one symptom.'); return; }
    setError('');
    setLoading(true);
    try {
      const payload = {
        symptoms,
        severity,
        duration,
        notes,
        vitals: {
          temperature:  vitals.temperature  ? parseFloat(vitals.temperature)  : undefined,
          heartRate:    vitals.heartRate    ? parseInt(vitals.heartRate)      : undefined,
          bloodPressureSystolic:  vitals.bloodPressureSystolic  ? parseInt(vitals.bloodPressureSystolic)  : undefined,
          bloodPressureDiastolic: vitals.bloodPressureDiastolic ? parseInt(vitals.bloodPressureDiastolic) : undefined,
          oxygenSaturation: vitals.oxygenSaturation ? parseInt(vitals.oxygenSaturation) : undefined
        }
      };
      const res = await api.post('/intakes', payload);
      setResult(res.data.intake);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Result view ──────────────────────────────────────────
  if (result) {
    const { level, probability, factors } = result.riskScore;
    const colors = { low: 'var(--green)', medium: 'var(--amber)', high: 'var(--red)' };
    const messages = {
      low: 'No immediate danger detected. Monitor your symptoms and follow up with your doctor if they persist.',
      medium: 'Moderate risk identified. Please seek medical attention within the next 30–60 minutes.',
      high: 'HIGH RISK DETECTED. Please go to emergency immediately or call for help.'
    };

    return (
      <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card" style={{
          textAlign: 'center', padding: '48px 40px',
          border: `1px solid ${colors[level]}44`,
          background: `${colors[level]}0a`
        }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '.68rem', color: colors[level], textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 12 }}>
            AI Risk Assessment Complete
          </div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: '4.5rem', color: colors[level], lineHeight: 1, marginBottom: 8 }}>
            {(probability * 100).toFixed(1)}%
          </div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: '1.6rem', marginBottom: 12 }}>
            {level === 'high' ? '⚠ HIGH RISK' : level === 'medium' ? 'MEDIUM RISK' : 'LOW RISK'}
          </div>
          <p style={{ color: 'var(--text2)', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6, fontSize: '.9rem' }}>
            {messages[level]}
          </p>

          {factors?.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: '.68rem', color: 'var(--text3)', fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Contributing Factors</div>
              {factors.map((f, i) => (
                <div key={i} style={{ fontSize: '.82rem', color: 'var(--text2)', marginBottom: 4, display: 'flex', gap: 7, alignItems: 'center' }}>
                  <span style={{ color: colors[level], fontSize: '.6rem' }}>●</span>{f}
                </div>
              ))}
            </div>
          )}

          <div style={{ fontFamily: 'var(--fm)', fontSize: '.7rem', color: 'var(--text3)', marginBottom: 28 }}>
            Intake ID: {result.intakeId} · {new Date(result.createdAt).toLocaleString()} · Model: Logistic Regression
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/patient/history')}>View History</button>
            <button className="btn btn-outline btn-sm" onClick={() => { setResult(null); setSymptoms([]); setVitals({ temperature: '', heartRate: '', bloodPressureSystolic: '', bloodPressureDiastolic: '', oxygenSaturation: '' }); setSeverity(3); setNotes(''); }}>New Intake</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form view ────────────────────────────────────────────
  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.02em' }}>New Intake Form</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: 4 }}>Describe your symptoms for AI-powered risk assessment</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '11px 14px', marginBottom: 20, fontSize: '.85rem', color: 'var(--red)' }}>
          ✕  {error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="card" style={{ maxWidth: 760 }}>

          {/* SYMPTOMS */}
          <div style={{ marginBottom: 28 }}>
            <div className="form-label">Select Symptoms <span style={{ color: 'var(--red)' }}>*</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {SYMPTOM_LIST.map(s => (
                <div key={s}
                  onClick={() => toggleSymptom(s)}
                  style={{
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${symptoms.includes(s) ? 'var(--accent)' : 'var(--border)'}`,
                    background: symptoms.includes(s) ? 'rgba(59,130,246,.12)' : 'var(--bg3)',
                    color: symptoms.includes(s) ? 'var(--a2)' : 'var(--text2)',
                    fontSize: '.82rem', textAlign: 'center', transition: 'all .15s',
                    fontWeight: symptoms.includes(s) ? 500 : 400,
                    userSelect: 'none'
                  }}
                >{s}</div>
              ))}
            </div>
          </div>

          <div className="divider"/>

          {/* SEVERITY + DURATION */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <div className="form-label">Severity (1 = mild, 5 = severe)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button"
                    onClick={() => setSeverity(n)}
                    style={{
                      width: 44, height: 38, borderRadius: 7, border: `1px solid ${n === severity ? 'var(--accent)' : 'var(--border)'}`,
                      background: n === severity ? 'var(--accent)' : 'var(--bg3)',
                      color: n === severity ? '#fff' : 'var(--text2)',
                      fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', transition: 'all .15s'
                    }}>{n}</button>
                ))}
              </div>
              <div className="form-hint">Currently selected: {severity}</div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Duration</label>
              <select className="form-select" value={duration} onChange={e => setDuration(e.target.value)}>
                {DURATION_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="divider"/>

          {/* VITALS */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label" style={{ marginBottom: 12 }}>Vitals <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional but improves accuracy)</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Temperature (°F)</label>
                <input name="temperature" type="number" className="form-input" value={vitals.temperature} onChange={onVitalChange} placeholder="98.6" step="0.1" min="90" max="115"/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Heart Rate (bpm)</label>
                <input name="heartRate" type="number" className="form-input" value={vitals.heartRate} onChange={onVitalChange} placeholder="75" min="30" max="250"/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">O₂ Saturation (%)</label>
                <input name="oxygenSaturation" type="number" className="form-input" value={vitals.oxygenSaturation} onChange={onVitalChange} placeholder="98" min="60" max="100"/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">BP Systolic</label>
                <input name="bloodPressureSystolic" type="number" className="form-input" value={vitals.bloodPressureSystolic} onChange={onVitalChange} placeholder="120"/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">BP Diastolic</label>
                <input name="bloodPressureDiastolic" type="number" className="form-input" value={vitals.bloodPressureDiastolic} onChange={onVitalChange} placeholder="80"/>
              </div>
            </div>
          </div>

          {/* NOTES */}
          <div className="form-group">
            <label className="form-label">Additional Notes (optional)</label>
            <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any other information the doctor should know..."/>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="dots"><span/><span/><span/></span> Analyzing...</> : '🧠 Analyze & Submit'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/patient/dashboard')}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
