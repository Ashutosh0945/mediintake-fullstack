import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';

export default function NotificationBell() {
  const [alerts,  setAlerts]  = useState([]);
  const [open,    setOpen]    = useState(false);
  const [unread,  setUnread]  = useState(0);
  const seenIds = useRef(new Set(JSON.parse(localStorage.getItem('seenAlerts') || '[]')));
  const ref     = useRef();

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/intakes/queue', { params: { riskLevel: 'high' } });
      const intakes = res.data.intakes || [];
      const newAlerts = intakes.map(i => ({
        id:      i._id,
        intakeId: i.intakeId,
        name:    i.patient?.name,
        prob:    ((i.riskScore?.probability || 0) * 100).toFixed(1),
        time:    i.createdAt,
        status:  i.status
      }));
      setAlerts(newAlerts);
      const newUnread = newAlerts.filter(a => !seenIds.current.has(a.id)).length;
      setUnread(newUnread);
    } catch (_) {}
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    const ids = alerts.map(a => a.id);
    ids.forEach(id => seenIds.current.add(id));
    localStorage.setItem('seenAlerts', JSON.stringify([...seenIds.current]));
    setUnread(0);
  };

  const handleOpen = () => {
    setOpen(s => !s);
    if (!open) markAllRead();
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={handleOpen} style={{
        position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, width: 38, height: 38, cursor: 'pointer', fontSize: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: unread > 0 ? 'var(--red)' : 'var(--text2)', transition: 'all .2s'
      }}>
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--red)', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: '.65rem', fontWeight: 700, fontFamily: 'var(--fm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg2)'
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 46, right: 0, width: 320,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,.5)',
          zIndex: 200, overflow: 'hidden'
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '.9rem' }}>🚨 High Risk Alerts</span>
            <span style={{ fontSize: '.72rem', color: 'var(--text3)', fontFamily: 'var(--fm)' }}>{alerts.length} active</span>
          </div>
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {alerts.length === 0 ? (
              <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--text3)', fontSize: '.85rem' }}>
                ✅ No high-risk cases right now
              </div>
            ) : alerts.map(a => (
              <div key={a.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', marginTop: 5, flexShrink: 0, boxShadow: '0 0 6px rgba(239,68,68,.6)' }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.85rem', marginBottom: 2 }}>{a.name}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text2)' }}>Risk: <span style={{ color: 'var(--red)', fontWeight: 600 }}>{a.prob}%</span> · #{a.intakeId}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginTop: 2 }}>
                    {new Date(a.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {a.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', fontSize: '.72rem', color: 'var(--text3)', textAlign: 'center' }}>
            Auto-refreshes every 30 seconds
          </div>
        </div>
      )}
    </div>
  );
}