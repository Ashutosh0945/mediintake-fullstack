import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { useTheme } from '../hooks/useTheme';

export default function Layout({
  navItems,
  children,
  userName,
  userRole,
  avatarText,
  accentColor = 'var(--accent)',
  showBell = false
}) {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const { theme, toggle } = useTheme();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '256px 1fr', minHeight: '100vh' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
      }}>

        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,var(--accent),var(--teal))', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⚕</div>
          <span style={{ fontFamily: 'var(--fd)', fontSize: '1.2rem' }}>MediIntake</span>
        </div>

        {/* User Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg,' + accentColor + ', var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem', color: '#fff', flexShrink: 0
          }}>{avatarText}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{userName}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text3)', fontFamily: 'var(--fm)' }}>{userRole}</div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {navItems.map((section, si) => (
            <div key={si} style={{ marginBottom: 18 }}>
              {section.label && (
                <div style={{
                  fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: 'var(--text3)', fontFamily: 'var(--fm)', padding: '6px 10px 4px'
                }}>
                  {section.label}
                </div>
              )}
              {section.items.map((item, ii) => (
                <NavLink key={ii} to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 12px', borderRadius: 8,
                    fontSize: '0.875rem',
                    color: isActive ? 'var(--a2)' : 'var(--text2)',
                    background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                    marginBottom: 2, transition: 'all 0.15s', textDecoration: 'none'
                  })}
                >
                  <span style={{ width: 18, textAlign: 'center', fontSize: '0.9rem' }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer buttons */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 12px', borderRadius: 8, border: 'none',
              background: 'transparent', color: 'var(--text3)', cursor: 'pointer',
              fontSize: '0.875rem', width: '100%', transition: 'all 0.15s', marginBottom: 2
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; }}
          >
            <span style={{ width: 18, textAlign: 'center' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 12px', borderRadius: 8, border: 'none',
              background: 'transparent', color: 'var(--text3)', cursor: 'pointer',
              fontSize: '0.875rem', width: '100%', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; }}
          >
            <span style={{ width: 18, textAlign: 'center' }}>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ padding: '32px 40px', overflowY: 'auto', background: 'var(--bg)', position: 'relative' }}>
        {/* Notification Bell — only for hospital staff */}
        {showBell && (
          <div style={{ position: 'fixed', top: 18, right: 24, zIndex: 100 }}>
            <NotificationBell />
          </div>
        )}
        {children}
      </main>

    </div>
  );
}