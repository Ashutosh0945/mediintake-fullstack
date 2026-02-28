import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 60% -10%,rgba(59,130,246,.16),transparent 60%), radial-gradient(ellipse 50% 40% at 5% 80%,rgba(20,184,166,.10),transparent 50%)'
      }}/>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(100,160,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(100,160,255,.04) 1px,transparent 1px)',
        backgroundSize: '52px 52px'
      }}/>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 52px', position: 'relative', zIndex: 10, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,var(--accent),var(--teal))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⚕</div>
          <span style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', letterSpacing: '-.02em' }}>MediIntake</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', position: 'relative', zIndex: 5 }}>
        <div style={{
          fontFamily: 'var(--fm)', fontSize: '.68rem', color: 'var(--teal)',
          letterSpacing: '.15em', textTransform: 'uppercase',
          border: '1px solid rgba(20,184,166,.28)', padding: '5px 16px', borderRadius: 20,
          marginBottom: 32, background: 'rgba(20,184,166,.06)', display: 'inline-block'
        }}>
          AI-Based Emergency Risk Scoring
        </div>

        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(2.8rem,6vw,5rem)', lineHeight: 1.08, letterSpacing: '-.03em', marginBottom: 24, maxWidth: 820 }}>
          Digital Healthcare<br />
          <em style={{ fontStyle: 'italic', color: 'var(--a2)' }}>Intake System</em>
        </h1>

        <p style={{ fontSize: '1.08rem', color: 'var(--text2)', lineHeight: 1.75, maxWidth: 540, marginBottom: 48 }}>
          Structured patient intake with ML-powered triage prioritization. Eliminate missing histories, reduce wait times, and surface high-risk cases the moment they arrive.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary">👤 Patient Registration →</Link>
          <Link to="/login?role=hospital" className="btn btn-teal">🏥 Hospital Staff Login</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap', marginTop: 72 }}>
          {[
            { val: '3×', label: 'Faster Intake' },
            { val: 'AI', label: 'Risk Scoring' },
            { val: 'JWT', label: 'Auth + RBAC' },
            { val: 'REST', label: 'Microservices' },
            { val: 'Mongo', label: 'Database' }
          ].map(s => (
            <div key={s.val} style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--fd)', fontSize: '2.1rem', color: 'var(--a2)', display: 'block', letterSpacing: '-.02em' }}>{s.val}</span>
              <span style={{ fontSize: '.75rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--fm)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Architecture Card */}
        <div style={{ marginTop: 64, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '28px 36px', display: 'flex', gap: 0, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 780 }}>
          {[
            { icon: '⚛️', name: 'React', sub: 'Frontend' },
            { arrow: '⟶ REST ⟶' },
            { icon: '🟢', name: 'Express', sub: 'Backend' },
            { arrow: '⟶ ODM ⟶' },
            { icon: '🍃', name: 'MongoDB', sub: 'Database' },
            { arrow: '⟶ ML ⟶', teal: true },
            { icon: '🧠', name: 'Risk Engine', sub: 'AI Scoring', teal: true }
          ].map((item, i) =>
            item.arrow ? (
              <span key={i} style={{ fontFamily: 'var(--fm)', fontSize: '.72rem', color: item.teal ? 'var(--teal)' : 'var(--text3)', padding: '0 10px' }}>{item.arrow}</span>
            ) : (
              <div key={i} style={{ textAlign: 'center', padding: '8px 16px' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '.82rem', color: item.teal ? 'var(--teal)' : 'var(--text)' }}>{item.name}</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text3)', fontFamily: 'var(--fm)' }}>{item.sub}</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
