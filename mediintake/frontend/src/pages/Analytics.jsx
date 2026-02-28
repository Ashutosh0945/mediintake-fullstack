import React, { useEffect, useState } from 'react';
import api from '../utils/api';

function Bar({ label, val, max, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: '.85rem' }}>{label}</span>
        <span style={{ fontFamily: 'var(--fm)', fontSize: '.75rem', color }}>{val}</span>
      </div>
      <div style={{ height: 7, background: 'var(--bg3)', borderRadius: 4 }}>
        <div style={{ height: '100%', width: `${Math.round((val / max) * 100)}%`, background: color, borderRadius: 4, transition: 'width .6s ease' }}/>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    api.get('/hospital/dashboard')
      .then(r => setData(r.data.dashboard))
      .catch(console.error)
      .finally(() => setLoad(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><span className="dots"><span/><span/><span/></span></div>;

  const total = (data?.highRisk || 0) + (data?.mediumRisk || 0) + (data?.lowRisk || 0);

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.02em' }}>Analytics</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: 4 }}>Hospital intake statistics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '👥', val: data?.totalPatients, label: 'Total Patients' },
          { icon: '📋', val: data?.todayIntakes, label: 'Intakes Today' },
          { icon: '⏳', val: data?.pendingReview, label: 'Pending Review', color: 'var(--amber)' },
          { icon: '📅', val: data?.weeklyIntakes, label: 'This Week' }
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <span style={{ float: 'right', fontSize: '1.4rem', opacity: .5 }}>{s.icon}</span>
            <span style={{ fontFamily: 'var(--fd)', fontSize: '2rem', display: 'block', marginBottom: 3, color: s.color || 'var(--text)' }}>{s.val ?? 0}</span>
            <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-title">Pending Risk Distribution</div>
          {total === 0 ? <div style={{ color: 'var(--text3)', fontSize: '.85rem' }}>No pending cases.</div> : (
            <>
              <Bar label="High Risk"   val={data?.highRisk   || 0} max={total} color="var(--red)"/>
              <Bar label="Medium Risk" val={data?.mediumRisk || 0} max={total} color="var(--amber)"/>
              <Bar label="Low Risk"    val={data?.lowRisk    || 0} max={total} color="var(--green)"/>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-title">Top Reported Symptoms</div>
          {!data?.topSymptoms?.length ? (
            <div style={{ color: 'var(--text3)', fontSize: '.85rem' }}>No data yet.</div>
          ) : (
            data.topSymptoms.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: i < data.topSymptoms.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '.88rem' }}>{s._id}</span>
                <span style={{ fontFamily: 'var(--fm)', fontSize: '.75rem', color: 'var(--text2)' }}>{s.count} cases</span>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ gridColumn: '1/-1' }}>
          <div className="card-title">System Architecture</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', justifyContent: 'center', padding: '16px 0' }}>
            {[
              { icon: '⚛️', name: 'React', sub: 'Frontend · Port 3000' },
              { arrow: '⟵⟶ REST API ⟵⟶' },
              { icon: '🟢', name: 'Express', sub: 'Backend · Port 5000' },
              { arrow: '⟵⟶ Mongoose ⟵⟶' },
              { icon: '🍃', name: 'MongoDB', sub: 'Database · :27017' },
              { arrow: '⟵⟶ Built-in ⟵⟶', teal: true },
              { icon: '🧠', name: 'Risk Engine', sub: 'Logistic Regression', teal: true }
            ].map((item, i) =>
              item.arrow ? (
                <span key={i} style={{ fontFamily: 'var(--fm)', fontSize: '.68rem', color: item.teal ? 'var(--teal)' : 'var(--text3)', padding: '0 8px' }}>{item.arrow}</span>
              ) : (
                <div key={i} style={{ background: 'var(--bg3)', border: `1px solid ${item.teal ? 'rgba(20,184,166,.3)' : 'var(--border)'}`, borderRadius: 10, padding: '14px 20px', textAlign: 'center', minWidth: 120 }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '.82rem', color: item.teal ? 'var(--teal)' : 'var(--text)' }}>{item.name}</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontFamily: 'var(--fm)' }}>{item.sub}</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
