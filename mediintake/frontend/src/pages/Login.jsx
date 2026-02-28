import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [params]  = useSearchParams();
  const isHosp    = params.get('role') === 'hospital';
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'patient') navigate('/patient/dashboard');
      else navigate('/hospital/queue');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left Panel */}
      <div style={{
        background: 'var(--bg2)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '64px', borderRight: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 30% 40%,rgba(59,130,246,.09),transparent 60%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '2.4rem', marginBottom: 16 }}>{isHosp ? '🏥' : '⚕️'}</div>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '2.8rem', lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 14 }}>
            {isHosp ? 'Triage smarter,\nfaster.' : 'Your health,\nalways ready.'}
          </h2>
          <p style={{ color: 'var(--text2)', lineHeight: 1.65, marginBottom: 36, fontSize: '.95rem', maxWidth: 340 }}>
            {isHosp
              ? 'Risk-sorted intake queue. Emergency profiles at a glance. Objective AI-powered triage assistance.'
              : 'One secure profile. Instant access during emergencies. No more repeated form filling every visit.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {(isHosp
              ? ['Real-time risk-sorted intake queue', 'Emergency quick-view profiles', 'AI-powered severity classification', 'Role-based access (Doctor/Nurse/Admin)']
              : ['Medical profile stored once', 'AI-powered risk scoring', 'Emergency card always accessible', 'Intake history & trend view']
            ).map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: '.88rem', color: 'var(--text2)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0, boxShadow: '0 0 8px rgba(20,184,166,.5)' }}/>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="animate-in">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 32, color: 'var(--text3)', fontSize: '.82rem' }}>
            ← Back to home
          </Link>

          <h3 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', marginBottom: 6, letterSpacing: '-.02em' }}>
            {isHosp ? 'Staff Login' : 'Patient Login'}
          </h3>
          <p style={{ color: 'var(--text2)', marginBottom: 32, fontSize: '.88rem' }}>
            {isHosp ? 'Hospital administration access' : 'Access your health dashboard'}
          </p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '11px 14px', marginBottom: 20, fontSize: '.85rem', color: 'var(--red)' }}>
              ✕  {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">{isHosp ? 'Staff ID / Email' : 'Email'}</label>
              <input name="email" type="email" className="form-input" value={form.email} onChange={onChange} placeholder={isHosp ? 'dr.name@hospital.com' : 'you@email.com'} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input" value={form.password} onChange={onChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <span className="dots"><span/><span/><span/></span> : (isHosp ? 'Access Dashboard →' : 'Sign In →')}
            </button>
          </form>
<div style={{ textAlign: 'right', marginTop: 8, marginBottom: 16 }}>
  <Link to="/forgot-password" style={{ fontSize: '.8rem', color: 'var(--text3)' }}>Forgot password?</Link>
</div>
          <div className="divider"/>
          <div style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--text3)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--a2)' }}>Register here</Link>
            {!isHosp && (
              <> · <Link to="/login?role=hospital" style={{ color: 'var(--text3)' }}>Hospital staff?</Link></>
            )}
          </div>

          {/* Demo credentials */}
          <div style={{ marginTop: 24, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: '.68rem', color: 'var(--text3)', fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Demo Credentials</div>
            {isHosp ? (
              <div style={{ fontSize: '.78rem', color: 'var(--text2)', lineHeight: 1.8 }}>
                Email: <code style={{ color: 'var(--a2)' }}>admin@mediintake.hospital</code><br/>
                Password: <code style={{ color: 'var(--a2)' }}>admin123</code>
              </div>
            ) : (
              <div style={{ fontSize: '.78rem', color: 'var(--text2)', lineHeight: 1.8 }}>
                Email: <code style={{ color: 'var(--a2)' }}>patient@test.com</code><br/>
                Password: <code style={{ color: 'var(--a2)' }}>test1234</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
