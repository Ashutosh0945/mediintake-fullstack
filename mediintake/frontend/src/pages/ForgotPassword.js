import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [step,    setStep]    = useState(1); // 1=email, 2=otp+newpass, 3=success
  const [email,   setEmail]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [devOtp,  setDevOtp]  = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  const sendOtp = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async e => {
    e.preventDefault();
    setError('');
    if (newPass !== confirmPass) { setError('Passwords do not match'); return; }
    if (newPass.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: newPass });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-in">

        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 32, color: 'var(--text3)', fontSize: '.82rem' }}>← Back to Login</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,var(--accent),var(--teal))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚕</div>
          <span style={{ fontFamily: 'var(--fd)', fontSize: '1.3rem' }}>MediIntake</span>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {['Enter Email', 'Verify OTP', 'Done'].map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 3, borderRadius: 2, background: step > i ? 'var(--accent)' : 'var(--border)', marginBottom: 5, transition: 'background .3s' }}/>
              <span style={{ fontSize: '.65rem', color: step > i ? 'var(--a2)' : 'var(--text3)', fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{s}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '11px 14px', marginBottom: 20, fontSize: '.85rem', color: 'var(--red)' }}>
            ✕  {error}
          </div>
        )}

        {step === 1 && (
          <>
            <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.9rem', marginBottom: 6, letterSpacing: '-.02em' }}>Forgot Password</h3>
            <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: '.88rem' }}>Enter your registered email to receive an OTP.</p>
            <form onSubmit={sendOtp}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required/>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="dots"><span/><span/><span/></span> : 'Send OTP →'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.9rem', marginBottom: 6, letterSpacing: '-.02em' }}>Verify OTP</h3>
            <p style={{ color: 'var(--text2)', marginBottom: 16, fontSize: '.88rem' }}>Enter the OTP sent to <strong style={{ color: 'var(--a2)' }}>{email}</strong></p>

            {devOtp && (
              <div style={{ background: 'rgba(20,184,166,.08)', border: '1px solid rgba(20,184,166,.3)', borderRadius: 8, padding: '11px 14px', marginBottom: 16, fontSize: '.85rem' }}>
                🧪 Dev OTP: <strong style={{ fontFamily: 'var(--fm)', color: 'var(--teal)', letterSpacing: '.15em' }}>{devOtp}</strong>
                <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: 3 }}>Also printed in backend terminal. Remove in production.</div>
              </div>
            )}

            <form onSubmit={resetPassword}>
              <div className="form-group">
                <label className="form-label">6-Digit OTP</label>
                <input className="form-input" style={{ fontFamily: 'var(--fm)', fontSize: '1.2rem', letterSpacing: '.2em', textAlign: 'center' }} value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} required/>
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat new password" required/>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="dots"><span/><span/><span/></span> : 'Reset Password →'}
              </button>
            </form>
            <button className="btn btn-ghost btn-full" style={{ marginTop: 10 }} onClick={() => { setStep(1); setDevOtp(''); setOtp(''); }}>← Try different email</button>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>✅</div>
            <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.9rem', marginBottom: 8, letterSpacing: '-.02em' }}>Password Reset!</h3>
            <p style={{ color: 'var(--text2)', marginBottom: 28, lineHeight: 1.6 }}>Your password has been updated successfully. You can now log in with your new password.</p>
            <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>Go to Login →</button>
          </div>
        )}

      </div>
    </div>
  );
}