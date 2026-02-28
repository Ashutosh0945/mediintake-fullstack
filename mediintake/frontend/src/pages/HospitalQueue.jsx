import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';

function RiskBadge({ level }) {
  return <span className={`risk-badge risk-${level}`}><span className="risk-dot"/>{level?.toUpperCase()}</span>;
}

function EmergencyModal({ patient, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/patients/${patient._id}/emergency`)
      .then(r => setData(r.data.emergency))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [patient._id]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', color: 'var(--text2)' }}>✕</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: '1.3rem' }}>🚨</span>
          <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', letterSpacing: '-.02em' }}>{patient.name}</h3>
        </div>
        <div style={{ fontFamily: 'var(--fm)', fontSize: '.68rem', color: 'var(--red)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 22 }}>Emergency Medical Profile</div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 30 }}><span className="dots"><span/><span/><span/></span></div>
        ) : !data ? (
          <p style={{ color: 'var(--text3)' }}>No medical profile found for this patient.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { k: 'Blood Group', v: data.bloodGroup, color: 'var(--a2)', mono: true, big: true },
              { k: 'Patient ID', v: data.patientId, mono: true },
              { k: '⚠ Allergies', v: data.allergies?.join(', ') || 'None known', color: data.allergies?.length ? 'var(--amber)' : undefined, full: true },
              { k: 'Chronic Conditions', v: data.chronicConditions?.join(', ') || 'None', full: true },
              { k: 'Current Medications', v: data.currentMedications?.map(m => m.name).join(', ') || 'None', full: true },
              { k: '📞 Emergency Contact', v: `${data.emergencyContact?.name} (${data.emergencyContact?.relationship}) — ${data.emergencyContact?.phone}`, color: 'var(--teal)', full: true }
            ].map(f => (
              <div key={f.k} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 16px', gridColumn: f.full ? '1/-1' : undefined }}>
                <div style={{ fontSize: '.66rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--fm)', marginBottom: 4 }}>{f.k}</div>
                <div style={{ fontWeight: 500, color: f.color || 'var(--text)', fontFamily: f.mono ? 'var(--fm)' : undefined, fontSize: f.big ? '1.2rem' : '.9rem' }}>{f.v}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button className="btn btn-danger btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function HospitalQueue() {
  const [intakes, setIntakes]   = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [riskFilter, setRisk]   = useState('');
  const [emrPatient, setEmrPatient] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/intakes/queue', { params: { riskLevel: riskFilter, search } }),
      api.get('/intakes/stats')
    ]).then(([qr, sr]) => {
      setIntakes(qr.data.intakes || []);
      setStats(sr.data.stats || {});
    }).catch(console.error).finally(() => setLoading(false));
  }, [riskFilter, search]);

  useEffect(() => { load(); }, [load]);

  const markReviewed = async (id) => {
  try {
    await api.patch(`/intakes/${id}/review`, { status: 'reviewed' });
    load();
  } catch (err) { console.error(err); }
};

const generateDischarge = (intake) => {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Discharge Summary - ${intake.intakeId}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',sans-serif; color:#1e293b; padding:40px; background:#fff; }
  .header { text-align:center; border-bottom:3px double #0a0f1e; padding-bottom:20px; margin-bottom:28px; }
  .logo   { font-size:20px; font-weight:800; color:#3b82f6; margin-bottom:4px; }
  .title  { font-size:18px; font-weight:700; letter-spacing:.05em; margin-bottom:2px; }
  .date   { font-size:11px; color:#64748b; }
  .section { margin-bottom:22px; }
  .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#64748b; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:12px; }
  .grid2  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .field  { }
  .fl     { font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:.08em; margin-bottom:2px; }
  .fv     { font-size:13px; font-weight:500; }
  .risk-chip { display:inline-block; padding:2px 12px; border-radius:20px; font-size:11px; font-weight:700; margin-left:8px; }
  .high   { background:#fef2f2; color:#ef4444; border:1px solid #fca5a5; }
  .medium { background:#fffbeb; color:#f59e0b; border:1px solid #fcd34d; }
  .low    { background:#f0fdf4; color:#16a34a; border:1px solid #86efac; }
  .tags   { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }
  .tag    { background:#f8fafc; border:1px solid #e2e8f0; padding:3px 10px; border-radius:4px; font-size:11px; color:#475569; }
  .sign-area { margin-top:48px; display:grid; grid-template-columns:1fr 1fr; gap:40px; }
  .sign-line { border-top:1px solid #1e293b; padding-top:6px; font-size:11px; color:#64748b; text-align:center; margin-top:40px; }
  .footer { text-align:center; margin-top:32px; font-size:10px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:12px; }
  @media print { body { padding:20px; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo">⚕ MediIntake Hospital</div>
  <div class="title">DISCHARGE SUMMARY</div>
  <div class="date">Generated: ${new Date().toLocaleString('en-IN')} &nbsp;•&nbsp; Intake Ref: #${intake.intakeId}</div>
</div>

<div class="section">
  <div class="section-title">Patient Information</div>
  <div class="grid2">
    <div class="field"><div class="fl">Patient Name</div><div class="fv">${intake.patient?.name || '—'}</div></div>
    <div class="field"><div class="fl">Patient ID</div><div class="fv">${intake.patient?.patientId || '—'}</div></div>
    <div class="field"><div class="fl">Age</div><div class="fv">${intake.patient?.age ? `${intake.patient.age} years` : '—'}</div></div>
    <div class="field"><div class="fl">Gender</div><div class="fv" style="text-transform:capitalize">${intake.patient?.gender || '—'}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Admission Details</div>
  <div class="grid2">
    <div class="field"><div class="fl">Intake Date & Time</div><div class="fv">${new Date(intake.createdAt).toLocaleString('en-IN')}</div></div>
    <div class="field"><div class="fl">Discharge Date</div><div class="fv">${new Date().toLocaleDateString('en-IN')}</div></div>
    <div class="field"><div class="fl">Chief Complaints</div><div class="fv" style="margin-top:4px"><div class="tags">${(intake.symptoms||[]).map(s=>`<span class="tag">${s}</span>`).join('')}</div></div></div>
    <div class="field"><div class="fl">AI Risk Score</div><div class="fv">${((intake.riskScore?.probability||0)*100).toFixed(1)}% <span class="risk-chip ${intake.riskScore?.level}">${(intake.riskScore?.level||'').toUpperCase()}</span></div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Vitals on Admission</div>
  <div class="grid2">
    <div class="field"><div class="fl">Temperature</div><div class="fv">${intake.vitals?.temperature ? `${intake.vitals.temperature} °F` : 'Not recorded'}</div></div>
    <div class="field"><div class="fl">Heart Rate</div><div class="fv">${intake.vitals?.heartRate ? `${intake.vitals.heartRate} bpm` : 'Not recorded'}</div></div>
    <div class="field"><div class="fl">O2 Saturation</div><div class="fv">${intake.vitals?.oxygenSaturation ? `${intake.vitals.oxygenSaturation}%` : 'Not recorded'}</div></div>
    <div class="field"><div class="fl">Blood Pressure</div><div class="fv">${intake.vitals?.bloodPressureSystolic ? `${intake.vitals.bloodPressureSystolic}/${intake.vitals.bloodPressureDiastolic} mmHg` : 'Not recorded'}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Clinical Notes</div>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;min-height:80px;font-size:12px;color:#475569;line-height:1.7">
    ${intake.reviewNotes || 'No clinical notes added. Please add discharge notes before printing.'}
  </div>
</div>

<div class="sign-area">
  <div><div class="sign-line">Doctor's Signature & Stamp</div></div>
  <div><div class="sign-line">Patient / Guardian Signature</div></div>
</div>

<div class="footer">
  MediIntake Digital Healthcare System &nbsp;•&nbsp; This is a computer-generated discharge summary &nbsp;•&nbsp; Ref: #${intake.intakeId}
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.onload = () => win.print();
};

  return (
    <div className="animate-in">
      {emrPatient && <EmergencyModal patient={emrPatient} onClose={() => setEmrPatient(null)}/>}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.02em' }}>Intake Queue</h1>
          <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: 4 }}>Sorted by AI risk score · highest priority first</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '.72rem', color: 'var(--green)' }}>● Live</span>
          <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '🔴', val: stats.high ?? 0, label: 'High Risk', color: 'var(--red)', border: 'var(--red)' },
          { icon: '🟡', val: stats.medium ?? 0, label: 'Medium Risk', color: 'var(--amber)', border: 'var(--amber)' },
          { icon: '🟢', val: stats.low ?? 0, label: 'Low Risk', color: 'var(--green)', border: 'var(--green)' },
          { icon: '📋', val: stats.total ?? 0, label: 'Today Total', color: 'var(--text)', border: 'var(--border2)' }
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px', borderLeft: `3px solid ${s.border}` }}>
            <span style={{ float: 'right', fontSize: '1.4rem', opacity: .5 }}>{s.icon}</span>
            <span style={{ fontFamily: 'var(--fd)', fontSize: '2.2rem', letterSpacing: '-.03em', display: 'block', marginBottom: 3, color: s.color }}>{s.val}</span>
            <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name, ID, symptoms..." style={{ flex: 1, padding: '10px 16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: '.88rem', outline: 'none' }} onKeyDown={e => e.key === 'Enter' && load()}/>
        <select className="form-select" style={{ width: 180 }} value={riskFilter} onChange={e => setRisk(e.target.value)}>
          <option value="">All Risk Levels</option>
          <option value="high">🔴 High Risk</option>
          <option value="medium">🟡 Medium Risk</option>
          <option value="low">🟢 Low Risk</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="dots"><span/><span/><span/></span></div>
        ) : intakes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>No intakes found.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Patient</th><th>Time</th><th>Symptoms</th><th>Vitals</th><th>AI Risk</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {intakes.map(i => (
                  <tr key={i._id}>
                    <td style={{ fontFamily: 'var(--fm)', fontSize: '.7rem', color: 'var(--text3)' }}>#{i.intakeId}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '.88rem' }}>{i.patient?.name}</div>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: '.7rem', color: 'var(--text3)' }}>{i.patient?.patientId}</div>
                    </td>
                    <td style={{ fontSize: '.78rem', color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                      {new Date(i.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ maxWidth: 180, fontSize: '.83rem' }}>
                      {i.symptoms?.slice(0,2).join(', ')}
                      {i.symptoms?.length > 2 && <span style={{ color: 'var(--text3)' }}> +{i.symptoms.length-2}</span>}
                    </td>
                    <td style={{ fontFamily: 'var(--fm)', fontSize: '.78rem', lineHeight: 1.8 }}>
                      {i.vitals?.temperature ? `${i.vitals.temperature}°F` : '—'}<br/>
                      {i.vitals?.heartRate ? `${i.vitals.heartRate}bpm` : '—'}
                    </td>
                    <td>
                      <div style={{ marginBottom: 4 }}><RiskBadge level={i.riskScore?.level}/></div>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: '.68rem', color: 'var(--text3)' }}>{(i.riskScore?.probability * 100).toFixed(1)}%</div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '.7rem', fontFamily: 'var(--fm)', padding: '3px 9px', borderRadius: 4,
                        textTransform: 'uppercase', letterSpacing: '.06em',
                        background: i.status === 'reviewed' ? 'rgba(16,185,129,.1)' : 'rgba(100,160,255,.07)',
                        color: i.status === 'reviewed' ? 'var(--green)' : 'var(--text3)',
                        border: `1px solid ${i.status === 'reviewed' ? 'rgba(16,185,129,.3)' : 'var(--border)'}`
                      }}>{i.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
  <button className="btn btn-danger btn-sm" onClick={() => setEmrPatient(i.patient)}>🚨 EMR</button>
  {i.status === 'pending' && (
    <button className="btn btn-outline btn-sm" onClick={() => markReviewed(i._id)}>✓ Review</button>
  )}
  <button className="btn btn-sm" style={{ background: 'var(--teal)', color: '#fff' }} onClick={() => generateDischarge(i)}>📄 Discharge</button>
</div>
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
