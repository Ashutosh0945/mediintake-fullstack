import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function RiskBadge({ level }) {
  return <span className={`risk-badge risk-${level}`}><span className="risk-dot"/>{level?.toUpperCase()}</span>;
}

function generateIntakePDF(intake, user) {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const level = intake.riskScore?.level || 'low';
  const prob  = ((intake.riskScore?.probability || 0) * 100).toFixed(1);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Intake Report - ${intake.intakeId}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', sans-serif; background:#f8fafc; color:#1e293b; padding:32px; }
  .header { background:linear-gradient(135deg,#0a0f1e,#1a2540); color:#fff; padding:28px 32px; border-radius:14px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:flex-start; }
  .logo { font-size:22px; font-weight:700; color:#3b82f6; margin-bottom:4px; }
  .sub  { font-size:11px; color:#94a3b8; letter-spacing:.1em; text-transform:uppercase; }
  .intake-id { font-family:monospace; font-size:13px; color:#60a5fa; background:rgba(59,130,246,.15); padding:6px 14px; border-radius:6px; margin-top:8px; display:inline-block; }
  .risk-box { text-align:right; }
  .risk-label { font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; }
  .risk-value { font-size:28px; font-weight:800; color:${colors[level]}; }
  .risk-level { font-size:12px; font-weight:700; color:${colors[level]}; border:1.5px solid ${colors[level]}; padding:3px 12px; border-radius:20px; display:inline-block; margin-top:4px; }
  .section { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px 24px; margin-bottom:16px; }
  .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#94a3b8; margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid #f1f5f9; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
  .field { }
  .field-label { font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:.08em; margin-bottom:3px; }
  .field-value { font-size:13px; font-weight:500; color:#1e293b; }
  .tags { display:flex; flex-wrap:wrap; gap:6px; }
  .tag { background:#f1f5f9; border:1px solid #e2e8f0; padding:3px 10px; border-radius:5px; font-size:11px; color:#64748b; }
  .factor { display:flex; align-items:center; gap:8px; margin-bottom:6px; font-size:12px; color:#475569; }
  .dot { width:6px; height:6px; border-radius:50%; background:${colors[level]}; flex-shrink:0; }
  .footer { text-align:center; margin-top:24px; font-size:10px; color:#94a3b8; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">⚕ MediIntake</div>
    <div class="sub">Digital Healthcare Intake Report</div>
    <div class="intake-id">#${intake.intakeId}</div>
  </div>
  <div class="risk-box">
    <div class="risk-label">AI Risk Score</div>
    <div class="risk-value">${prob}%</div>
    <div class="risk-level">${level.toUpperCase()} RISK</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Patient Information</div>
  <div class="grid2">
    <div class="field"><div class="field-label">Full Name</div><div class="field-value">${user?.name || '—'}</div></div>
    <div class="field"><div class="field-label">Patient ID</div><div class="field-value" style="font-family:monospace;color:#3b82f6">${user?.patientId || '—'}</div></div>
    <div class="field"><div class="field-label">Age</div><div class="field-value">${user?.age ? `${user.age} years` : '—'}</div></div>
    <div class="field"><div class="field-label">Gender</div><div class="field-value" style="text-transform:capitalize">${user?.gender || '—'}</div></div>
    <div class="field"><div class="field-label">Submitted On</div><div class="field-value">${new Date(intake.createdAt).toLocaleString('en-IN')}</div></div>
    <div class="field"><div class="field-label">Status</div><div class="field-value" style="text-transform:capitalize">${intake.status}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Symptoms & Severity</div>
  <div class="grid2" style="margin-bottom:14px">
    <div class="field"><div class="field-label">Severity</div><div class="field-value">${intake.severity} / 5</div></div>
    <div class="field"><div class="field-label">Duration</div><div class="field-value">${intake.duration}</div></div>
  </div>
  <div class="field-label" style="margin-bottom:8px">Reported Symptoms</div>
  <div class="tags">${(intake.symptoms || []).map(s => `<span class="tag">${s}</span>`).join('')}</div>
  ${intake.notes ? `<div style="margin-top:12px"><div class="field-label">Additional Notes</div><div class="field-value" style="margin-top:4px;line-height:1.6;color:#475569">${intake.notes}</div></div>` : ''}
</div>

<div class="section">
  <div class="section-title">Vitals</div>
  <div class="grid3">
    <div class="field"><div class="field-label">Temperature</div><div class="field-value">${intake.vitals?.temperature ? `${intake.vitals.temperature} °F` : '—'}</div></div>
    <div class="field"><div class="field-label">Heart Rate</div><div class="field-value">${intake.vitals?.heartRate ? `${intake.vitals.heartRate} bpm` : '—'}</div></div>
    <div class="field"><div class="field-label">O2 Saturation</div><div class="field-value">${intake.vitals?.oxygenSaturation ? `${intake.vitals.oxygenSaturation}%` : '—'}</div></div>
    <div class="field"><div class="field-label">BP Systolic</div><div class="field-value">${intake.vitals?.bloodPressureSystolic ? `${intake.vitals.bloodPressureSystolic} mmHg` : '—'}</div></div>
    <div class="field"><div class="field-label">BP Diastolic</div><div class="field-value">${intake.vitals?.bloodPressureDiastolic ? `${intake.vitals.bloodPressureDiastolic} mmHg` : '—'}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">AI Risk Analysis</div>
  <div class="grid2" style="margin-bottom:14px">
    <div class="field"><div class="field-label">Risk Probability</div><div class="field-value" style="color:${colors[level]};font-size:18px;font-weight:700">${prob}%</div></div>
    <div class="field"><div class="field-label">Classification</div><div class="field-value" style="color:${colors[level]};font-weight:700;text-transform:uppercase">${level} RISK</div></div>
  </div>
  ${intake.riskScore?.factors?.length ? `
  <div class="field-label" style="margin-bottom:8px">Contributing Factors</div>
  ${intake.riskScore.factors.map(f => `<div class="factor"><div class="dot"></div>${f}</div>`).join('')}
  ` : ''}
  <div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:8px;font-size:11px;color:#64748b;line-height:1.6">
    <strong>Note:</strong> This AI risk score is generated by a Logistic Regression model for triage prioritization only. It is not a medical diagnosis. Please consult a qualified healthcare professional.
  </div>
</div>

<div class="footer">
  Generated by MediIntake Digital Healthcare System &nbsp;•&nbsp; ${new Date().toLocaleString('en-IN')} &nbsp;•&nbsp; This report is for informational purposes only
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

export default function IntakeHistory() {
  const { user }  = useAuth();
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/intakes/mine')
      .then(r => setIntakes(r.data.intakes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.02em' }}>Intake History</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: 4 }}>{intakes.length} total submissions</p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="dots"><span/><span/><span/></span></div>
        ) : intakes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>No intakes submitted yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Intake ID</th><th>Date & Time</th><th>Symptoms</th><th>Severity</th><th>Temp</th><th>HR</th><th>AI Risk</th><th>Status</th><th>Report</th></tr>
              </thead>
              <tbody>
                {intakes.map(i => (
                  <tr key={i._id}>
                    <td style={{ fontFamily: 'var(--fm)', fontSize: '.72rem', color: 'var(--text3)' }}>#{i.intakeId}</td>
                    <td style={{ fontSize: '.82rem', whiteSpace: 'nowrap' }}>
                      {new Date(i.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}<br/>
                      <span style={{ color: 'var(--text3)', fontSize: '.72rem' }}>{new Date(i.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td style={{ maxWidth: 200, fontSize: '.85rem' }}>
                      {i.symptoms?.slice(0, 3).join(', ')}
                      {i.symptoms?.length > 3 && <span style={{ color: 'var(--text3)' }}> +{i.symptoms.length - 3}</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>{i.severity}/5</td>
                    <td style={{ fontFamily: 'var(--fm)', fontSize: '.8rem' }}>{i.vitals?.temperature ? `${i.vitals.temperature}°F` : '—'}</td>
                    <td style={{ fontFamily: 'var(--fm)', fontSize: '.8rem' }}>{i.vitals?.heartRate ? `${i.vitals.heartRate}bpm` : '—'}</td>
                    <td>
                      <div style={{ marginBottom: 4 }}><span className={`risk-badge risk-${i.riskScore?.level}`}><span className="risk-dot"/>{i.riskScore?.level?.toUpperCase()}</span></div>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: '.68rem', color: 'var(--text3)' }}>{(i.riskScore?.probability * 100).toFixed(1)}%</div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '.72rem', fontFamily: 'var(--fm)', padding: '3px 9px',
                        borderRadius: 4, textTransform: 'uppercase', letterSpacing: '.06em',
                        background: i.status === 'reviewed' ? 'rgba(16,185,129,.12)' : 'rgba(100,160,255,.08)',
                        color: i.status === 'reviewed' ? 'var(--green)' : 'var(--text3)',
                        border: `1px solid ${i.status === 'reviewed' ? 'rgba(16,185,129,.3)' : 'var(--border)'}`
                      }}>{i.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => generateIntakePDF(i, user)}
                        title="Download PDF Report"
                      >
                        📄 PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}