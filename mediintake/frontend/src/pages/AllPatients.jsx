import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function AllPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    api.get('/patients', { params: { search, limit: 30 } })
      .then(r => setPatients(r.data.patients || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.02em' }}>All Patients</h1>
        <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: 4 }}>{patients.length} registered patients</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name, email, or patient ID..." style={{ width: '100%', maxWidth: 480, padding: '10px 16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: '.88rem', outline: 'none' }} />
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="dots"><span/><span/><span/></span></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Patient ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Registered</th></tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontFamily: 'var(--fm)', fontSize: '.72rem', color: 'var(--a2)' }}>{p.patientId}</td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ color: 'var(--text2)', fontSize: '.85rem' }}>{p.age ? `${p.age}${p.gender ? ` ${p.gender[0].toUpperCase()}` : ''}` : '—'}</td>
                    <td style={{ color: 'var(--text2)', fontSize: '.85rem', textTransform: 'capitalize' }}>{p.gender || '—'}</td>
                    <td style={{ fontFamily: 'var(--fm)', fontSize: '.78rem', color: 'var(--text2)' }}>{p.phone || '—'}</td>
                    <td style={{ fontSize: '.78rem', color: 'var(--text3)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
