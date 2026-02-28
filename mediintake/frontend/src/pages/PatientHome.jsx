import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function RiskBadge({ level }) {
  return (
    <span className={`risk-badge risk-${level}`}>
      <span className="risk-dot"/>
      {level?.toUpperCase()}
    </span>
  );
}

export default function PatientHome() {
  const { user } = useAuth();
  const [intakes, setIntakes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/intakes/mine').catch(() => ({ data: { intakes: [] } })),
      api.get('/patients/profile').catch(() => ({ data: { profile: null } }))
    ]).then(([ir, pr]) => {
      setIntakes(ir.data.intakes || []);
      setProfile(pr.data.profile || null);
    }).finally(() => setLoading(false));
  }, []);

  const lastRisk = intakes[0]?.riskScore?.level;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <span className="dots"><span/><span/><span/></span>
    </div>
  );

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.02em' }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: 4 }}>
            Patient ID: <span style={{ fontFamily: 'var(--fm)', color: 'var(--a2)' }}>{user?.patientId}</span>
          </p>
        </div>
        <Link to="/patient/intake" className="btn btn-primary">+ New Intake</Link>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '📝', val: intakes.length, label: 'Total Intakes' },
          { icon: '🧠', val: lastRisk ? lastRisk.toUpperCase() : '—', label: 'Last Risk Score', color: lastRisk === 'high' ? 'var(--red)' : lastRisk === 'medium' ? 'var(--amber)' : 'var(--green)' },
          { icon: '💊', val: profile?.currentMedications?.length ?? '—', label: 'Medications' },
          { icon: '📞', val: profile?.emergencyContact ? 'Set' : 'Missing', label: 'Emergency Contact', color: profile?.emergencyContact ? 'var(--teal)' : 'var(--red)' }
        ].map(s => (
          <div key={s.label} className="stat-card card" style={{ padding: '18px 20px' }}>
            <span style={{ float: 'right', fontSize: '1.5rem', opacity: .5 }}>{s.icon}</span>
            <span style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.03em', display: 'block', marginBottom: 3, color: s.color || 'var(--text)' }}>{s.val}</span>
            <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* No profile warning */}
      {!profile && (
        <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ color: 'var(--amber)', fontWeight: 600 }}>⚠ Medical profile incomplete</span>
            <p style={{ color: 'var(--text2)', fontSize: '.85rem', marginTop: 3 }}>Complete your medical profile for better emergency care and accurate risk scoring.</p>
          </div>
          <Link to="/patient/profile" className="btn btn-sm" style={{ background: 'var(--amber)', color: '#fff', flexShrink: 0 }}>Complete Now</Link>
        </div>
      )}

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent intakes */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Recent Intakes</div>
            <Link to="/patient/history" style={{ fontSize: '.75rem', color: 'var(--a2)' }}>View all</Link>
          </div>
          {intakes.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: '.85rem', padding: '20px 0', textAlign: 'center' }}>
              No intakes yet.<br/><Link to="/patient/intake" style={{ color: 'var(--a2)' }}>Submit your first intake →</Link>
            </div>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Chief Complaint</th><th>Risk</th></tr></thead>
              <tbody>
                {intakes.slice(0, 4).map(i => (
                  <tr key={i._id}>
                    <td style={{ fontSize: '.75rem', color: 'var(--text3)', fontFamily: 'var(--fm)', whiteSpace: 'nowrap' }}>
                      {new Date(i.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ fontSize: '.85rem' }}>{i.symptoms?.slice(0,2).join(', ')}</td>
                    <td><RiskBadge level={i.riskScore?.level}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick profile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Medical Profile</div>
            <Link to="/patient/profile" style={{ fontSize: '.75rem', color: 'var(--a2)' }}>{profile ? 'Edit' : 'Setup'}</Link>
          </div>
          {!profile ? (
            <div style={{ color: 'var(--text3)', fontSize: '.85rem', padding: '20px 0', textAlign: 'center' }}>
              No profile yet. <Link to="/patient/profile" style={{ color: 'var(--a2)' }}>Set it up now →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'Blood Group', val: profile.bloodGroup, color: 'var(--a2)', mono: true },
                { key: 'Age', val: `${user?.age || '—'} yrs` },
                { key: 'Allergies', val: profile.allergies?.join(', ') || 'None', color: profile.allergies?.length ? 'var(--amber)' : undefined },
                { key: 'Conditions', val: profile.chronicConditions?.join(', ') || 'None' }
              ].map(f => (
                <div key={f.key} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 14px' }}>
                  <div style={{ fontSize: '.66rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--fm)', marginBottom: 3 }}>{f.key}</div>
                  <div style={{ fontSize: '.9rem', fontWeight: 500, color: f.color || 'var(--text)', fontFamily: f.mono ? 'var(--fm)' : undefined }}>{f.val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
