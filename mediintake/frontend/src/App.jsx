import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PatientHome    from './pages/PatientHome';
import IntakeForm     from './pages/IntakeForm';
import IntakeHistory  from './pages/IntakeHistory';
import MedicalProfile from './pages/MedicalProfile';
import Appointments   from './pages/Appointments';
import HospitalQueue  from './pages/HospitalQueue';
import AllPatients    from './pages/AllPatients';
import Analytics      from './pages/Analytics';
import Layout         from './components/Layout';

// ── Route Guard ──────────────────────────────────────────────
function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <span className="dots"><span/><span/><span/></span>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// ── Patient Layout ───────────────────────────────────────────
function PatientLayout({ children }) {
  const { user } = useAuth();
  const navItems = [
    {
      label: 'Overview', items: [
        { to: '/patient/dashboard',    icon: '📊', label: 'Dashboard' },
        { to: '/patient/intake',       icon: '📝', label: 'New Intake' },
        { to: '/patient/history',      icon: '📋', label: 'My History' },
      ]
    },
    {
      label: 'Profile', items: [
        { to: '/patient/profile',      icon: '🩺', label: 'Medical Profile' },
        { to: '/patient/emergency',    icon: '🚨', label: 'Emergency Card' },
        { to: '/patient/appointments', icon: '📅', label: 'Appointments' },
      ]
    }
  ];
  return (
    <Layout
      navItems={navItems}
      userName={user?.name}
      userRole={'Patient · ' + (user?.patientId || '')}
      avatarText={(user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()) || 'PT'}
      accentColor="var(--accent)"
      showBell={false}
    >
      {children}
    </Layout>
  );
}

// ── Hospital Layout ──────────────────────────────────────────
function HospitalLayout({ children }) {
  const { user } = useAuth();
  const navItems = [
    {
      label: 'Hospital', items: [
        { to: '/hospital/queue',      icon: '📥', label: 'Intake Queue' },
        { to: '/hospital/patients',   icon: '👥', label: 'All Patients' },
        { to: '/hospital/analytics',  icon: '📊', label: 'Analytics' },
      ]
    },
    {
      label: 'AI Model', items: [
        { to: '/hospital/risk-model', icon: '🧠', label: 'Risk Model Info' },
      ]
    }
  ];
  return (
    <Layout
      navItems={navItems}
      userName={user?.name}
      userRole={(user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)) + ' · ' + (user?.staffId || '')}
      avatarText={(user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()) || 'DR'}
      accentColor="var(--teal)"
      showBell={true}
    >
      {children}
    </Layout>
  );
}

// ── Emergency Card ───────────────────────────────────────────
function EmergencyCard() {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    import('./utils/api').then(({ default: api }) => {
      api.get('/patients/profile')
        .then(r => setProfile(r.data.profile))
        .catch(() => {});
    });
  }, []);

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.02em' }}>Emergency Card 🚨</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: 4 }}>Show this in emergencies — critical info at a glance</p>
      </div>
      <div style={{ maxWidth: 460 }}>
        <div style={{
          background: 'linear-gradient(135deg,#162040,#0c1225)',
          border: '2px solid var(--red)', borderRadius: 18, padding: 32,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(ellipse at 70% 30%,rgba(239,68,68,.08),transparent 70%)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '.6rem', color: 'var(--text3)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 4 }}>Emergency Medical ID</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1.6rem' }}>{user?.name || '—'}</div>
              <div style={{ fontSize: '.82rem', color: 'var(--text2)' }}>
                {user?.age ? user.age : '—'}{user?.gender ? ' ' + user.gender[0].toUpperCase() : ''} · {user?.patientId}
              </div>
            </div>
            <div style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.4)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--a2)' }}>{profile?.bloodGroup || '?'}</div>
              <div style={{ fontSize: '.6rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Blood</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: '.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4, fontFamily: 'var(--fm)' }}>Allergies</div>
              <div style={{ color: 'var(--amber)', fontWeight: 600, fontSize: '.88rem' }}>{profile?.allergies?.join(', ') || 'None known'}</div>
            </div>
            <div style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: '.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4, fontFamily: 'var(--fm)' }}>Conditions</div>
              <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{profile?.chronicConditions?.join(', ') || 'None'}</div>
            </div>
          </div>
          {profile?.currentMedications?.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: '.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 5, fontFamily: 'var(--fm)' }}>Medications</div>
              <div style={{ fontSize: '.85rem' }}>{profile.currentMedications.map(m => m.name).join(' · ')}</div>
            </div>
          )}
          {profile?.emergencyContact && (
            <div style={{ background: 'rgba(20,184,166,.08)', border: '1px solid rgba(20,184,166,.2)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4, fontFamily: 'var(--fm)' }}>Emergency Contact</div>
              <div style={{ fontWeight: 600 }}>{profile.emergencyContact.name}</div>
              <div style={{ color: 'var(--teal)', fontFamily: 'var(--fm)', fontSize: '.88rem' }}>{profile.emergencyContact.phone}</div>
            </div>
          )}
        </div>
        {!profile && (
          <div style={{ marginTop: 16, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 10, padding: '14px 18px', fontSize: '.85rem', color: 'var(--amber)' }}>
            Complete your medical profile to populate this card.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Risk Model Info ──────────────────────────────────────────
function RiskModelInfo() {
  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.02em' }}>AI Risk Model</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: 4 }}>Logistic Regression · Simulated Training Data</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
        <div className="card">
          <div className="card-title">Model Details</div>
          {[
            ['Algorithm', 'Logistic Regression (sklearn)'],
            ['Framework', 'Node.js built-in (or Python Flask)'],
            ['Input Features', 'Symptoms, severity, vitals, duration'],
            ['Output', 'Probability 0.0 – 1.0']
          ].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--fm)', fontSize: '.75rem', color: 'var(--a2)' }}>{k}:</span>
              <span style={{ fontSize: '.85rem', color: 'var(--text2)', marginLeft: 8 }}>{v}</span>
            </div>
          ))}
          <div className="divider"/>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '.78rem', lineHeight: 2 }}>
            <div style={{ color: 'var(--green)' }}>0.00 – 0.40 → LOW RISK</div>
            <div style={{ color: 'var(--amber)' }}>0.40 – 0.70 → MEDIUM RISK</div>
            <div style={{ color: 'var(--red)' }}>0.70 – 1.00 → HIGH RISK</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Feature Weights</div>
          {[
            ['Chest Pain', 0.87, 'var(--red)'],
            ['Breathlessness', 0.75, 'var(--red)'],
            ['Palpitations', 0.60, 'var(--amber)'],
            ['Sweating', 0.45, 'var(--amber)'],
            ['Dizziness', 0.38, 'var(--amber)'],
            ['High Fever', 0.32, 'var(--text3)'],
            ['Fatigue', 0.15, 'var(--text3)']
          ].map(([name, w, c]) => (
            <div key={name} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: '.82rem' }}>{name}</span>
                <span style={{ fontFamily: 'var(--fm)', fontSize: '.75rem', color: c }}>+{w}</span>
              </div>
              <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: (w * 100) + '%', background: c, borderRadius: 3 }}/>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <div className="card-title">Viva Answer — Ready to Use</div>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 20, borderLeft: '3px solid var(--teal)' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--text2)', lineHeight: 1.75, fontSize: '.9rem' }}>
              "We implemented a <strong style={{ color: 'var(--text)' }}>Logistic Regression</strong> model trained on simulated symptom datasets
              to classify emergency severity levels. The goal was not diagnosis but <strong style={{ color: 'var(--text)' }}>prioritization assistance</strong>.
              Features were engineered from patient-reported symptoms, vitals, and medical history. The model outputs a probability score
              that maps to Low, Medium, or High risk tiers — allowing clinical staff to triage the intake queue objectively and consistently."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'patient' ? '/patient/dashboard' : '/hospital/queue'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'patient' ? '/patient/dashboard' : '/hospital/queue'} /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Patient routes */}
      <Route path="/patient/*" element={
        <RequireAuth roles={['patient']}>
          <PatientLayout>
            <Routes>
              <Route path="dashboard"    element={<PatientHome />} />
              <Route path="intake"       element={<IntakeForm />} />
              <Route path="history"      element={<IntakeHistory />} />
              <Route path="profile"      element={<MedicalProfile />} />
              <Route path="emergency"    element={<EmergencyCard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="*"            element={<Navigate to="dashboard" />} />
            </Routes>
          </PatientLayout>
        </RequireAuth>
      } />

      {/* Hospital routes */}
      <Route path="/hospital/*" element={
        <RequireAuth roles={['doctor', 'nurse', 'admin']}>
          <HospitalLayout>
            <Routes>
              <Route path="queue"      element={<HospitalQueue />} />
              <Route path="patients"   element={<AllPatients />} />
              <Route path="analytics"  element={<Analytics />} />
              <Route path="risk-model" element={<RiskModelInfo />} />
              <Route path="*"          element={<Navigate to="queue" />} />
            </Routes>
          </HospitalLayout>
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}