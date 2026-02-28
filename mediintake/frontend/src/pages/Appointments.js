import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast, ToastContainer } from '../hooks/useToast';

const STATUS_COLORS = {
  pending:   { bg: 'rgba(100,160,255,.10)', color: 'var(--a2)',   border: 'rgba(100,160,255,.3)' },
  confirmed: { bg: 'rgba(16,185,129,.10)',  color: 'var(--green)', border: 'rgba(16,185,129,.3)' },
  cancelled: { bg: 'rgba(239,68,68,.10)',   color: 'var(--red)',   border: 'rgba(239,68,68,.3)'  },
  completed: { bg: 'rgba(100,100,100,.10)', color: 'var(--text3)', border: 'rgba(100,100,100,.3)'},
};

export default function Appointments() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', reason: '' });

  const load = () => {
    Promise.all([
      api.get('/appointments/mine'),
      api.get('/appointments/doctors')
    ]).then(([ar, dr]) => {
      setAppointments(ar.data.appointments || []);
      setDoctors(dr.data.doctors || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.doctorId || !form.date || !form.time || !form.reason) {
      toast.error('All fields are required'); return;
    }
    setSaving(true);
    try {
      await api.post('/appointments', form);
      toast.success('Appointment booked successfully!');
      setShowForm(false);
      setForm({ doctorId: '', date: '', time: '', reason: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Appointment cancelled');
      load();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-in">
      <ToastContainer toasts={toast.toasts}/>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.02em' }}>Appointments</h1>
          <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: 4 }}>Book and manage your doctor appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Book Appointment'}
        </button>
      </div>

      {/* Booking Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 680, borderColor: 'rgba(59,130,246,.3)' }}>
          <div className="card-title">New Appointment</div>
          <form onSubmit={onSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Select Doctor</label>
                <select className="form-select" value={form.doctorId} onChange={e => setForm(p => ({ ...p, doctorId: e.target.value }))} required>
                  <option value="">Choose a doctor...</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>{d.name} — {d.department || 'General'}</option>
                  ))}
                </select>
                {doctors.length === 0 && <div className="form-hint" style={{ color: 'var(--amber)' }}>No doctors registered yet. Ask admin to register doctors first.</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={form.date} min={today} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" className="form-input" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required/>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Reason for Visit</label>
                <textarea className="form-textarea" style={{ minHeight: 80 }} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Describe your symptoms or reason for the appointment..." required/>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="dots"><span/><span/><span/></span> : '📅 Confirm Booking'}
            </button>
          </form>
        </div>
      )}

      {/* Appointments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><span className="dots"><span/><span/><span/></span></div>
      ) : appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📅</div>
          <p>No appointments yet.</p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => setShowForm(true)}>Book your first appointment</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {appointments.map(a => {
            const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
            return (
              <div key={a._id} className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', textAlign: 'center', minWidth: 64 }}>
                    <div style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', color: 'var(--a2)', lineHeight: 1 }}>
                      {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text3)', fontFamily: 'var(--fm)', textTransform: 'uppercase' }}>
                      {new Date(a.date).toLocaleDateString('en-IN', { month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 3 }}>Dr. {a.doctor?.name}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{a.doctor?.department || 'General'} · {a.time}</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text3)', marginTop: 3 }}>{a.reason}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '.72rem', fontFamily: 'var(--fm)', padding: '4px 12px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>
                    {a.status}
                  </span>
                  {a.status === 'pending' && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(a._id)}>Cancel</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}