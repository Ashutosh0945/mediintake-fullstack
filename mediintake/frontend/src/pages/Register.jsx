import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', gender: '', phone: '', role: 'patient'
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        gender: form.gender || undefined,
        age:    form.age    || undefined
      };
      await register(payload);
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        if (form.role === 'patient') {
          navigate('/login');
        } else {
          navigate('/login?role=hospital');
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }} className="animate-in">
          <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>✅</div>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '1.9rem', marginBottom: 10, letterSpacing: '-.02em' }}>
            Account Created!
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: 6, lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text)' }}>{form.name}</strong> registered as <strong style={{ color: 'var(--a2)', textTransform: 'capitalize' }}>{form.role}</strong>.
          </p>
          <p style={{ color: 'var(--text3)', fontSize: '.85rem', marginBottom: 28 }}>
            Redirecting to login page...
          </p>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 20px', marginBottom: 24, fontSize: '.85rem' }}>
            <div style={{ color: 'var(--text3)', fontFamily: 'var(--fm)', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Your Login</div>
            <div style={{ color: 'var(--text2)' }}>Email: <span style={{ color: 'var(--a2)', fontFamily: 'var(--fm)' }}>{form.email}</span></div>
          </div>
          <Link
            to={form.role === 'patient' ? '/login' : '/login?role=hospital'}
            className="btn btn-primary btn-full"
            style={{ justifyContent: 'center' }}
          >
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  // ── Register form ───────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520 }} className="animate-in">

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 32, color: 'var(--text3)', fontSize: '.82rem' }}>
          ← Back
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,var(--accent),var(--teal))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⚕</div>
          <span style={{ fontFamily: 'var(--fd)', fontSize: '1.3rem' }}>MediIntake</span>
        </div>

        <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.9rem', marginBottom: 6, letterSpacing: '-.02em' }}>
          Create Account
        </h3>
        <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: '.88rem' }}>
          Register a new account — you will be asked to login after.
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '11px 14px', marginBottom: 20, fontSize: '.85rem', color: 'var(--red)' }}>
            ✕  {error}
          </div>
        )}

        <form onSubmit={onSubmit}>

          {/* Role Selector */}
          <div style={{ marginBottom: 8 }}>
            <div className="form-label">Register As</div>
          </div>
          <div style={{ display: 'flex', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, gap: 4, marginBottom: 24 }}>
            {['patient', 'doctor', 'nurse', 'admin'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: r }))}
                style={{
                  flex: 1, padding: '9px 4px', borderRadius: 7, border: 'none',
                  cursor: 'pointer', fontSize: '.78rem', fontWeight: 500,
                  transition: 'all .2s', textTransform: 'capitalize',
                  background: form.role === r ? 'var(--s2)' : 'transparent',
                  color: form.role === r ? 'var(--text)' : 'var(--text3)',
                  boxShadow: form.role === r ? '0 2px 8px rgba(0,0,0,.3)' : 'none'
                }}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              name="name"
              className="form-input"
              value={form.name}
              onChange={onChange}
              placeholder="Your full name"
              required
            />
          </div>

          {/* Email + Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={onChange}
                placeholder="you@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                className="form-input"
                value={form.password}
                onChange={onChange}
                placeholder="Min 6 characters"
                required
              />
            </div>
          </div>

          {/* Patient only fields */}
          {form.role === 'patient' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  name="age"
                  type="number"
                  className="form-input"
                  value={form.age}
                  onChange={onChange}
                  placeholder="25"
                  min="1"
                  max="120"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-select"
                  value={form.gender}
                  onChange={onChange}
                >
                  <option value="">Select (optional)</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Phone (optional)</label>
                <input
                  name="phone"
                  className="form-input"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading
              ? <span className="dots"><span/><span/><span/></span>
              : 'Create Account →'
            }
          </button>

        </form>

        <div className="divider"/>
        <div style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--text3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--a2)' }}>Sign in</Link>
        </div>

      </div>
    </div>
  );
}