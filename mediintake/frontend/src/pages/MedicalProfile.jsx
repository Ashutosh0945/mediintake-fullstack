import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast, ToastContainer } from '../hooks/useToast';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function MedicalProfile() {
  const toast = useToast();
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [profile, setProfile]   = useState({
    bloodGroup: '', allergies: [], chronicConditions: [],
    currentMedications: [], pastMedicalHistory: '',
    emergencyContact: { name: '', relationship: '', phone: '' }
  });
  const [allergyInput, setAllergyInput]     = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [medInput, setMedInput]             = useState({ name: '', dosage: '', frequency: '' });

  useEffect(() => {
    api.get('/patients/profile')
      .then(r => {
        const p = r.data.profile;
        setProfile({ ...profile, ...p, emergencyContact: p.emergencyContact || { name: '', relationship: '', phone: '' } });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addTag = (field, input, setInput) => {
    if (!input.trim()) return;
    setProfile(p => ({ ...p, [field]: [...(p[field] || []), input.trim()] }));
    setInput('');
  };
  const removeTag = (field, idx) => setProfile(p => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));

  const addMed = () => {
    if (!medInput.name.trim()) return;
    setProfile(p => ({ ...p, currentMedications: [...p.currentMedications, { ...medInput }] }));
    setMedInput({ name: '', dosage: '', frequency: '' });
  };
  const removeMed = idx => setProfile(p => ({ ...p, currentMedications: p.currentMedications.filter((_, i) => i !== idx) }));

  const onSave = async () => {
    if (!profile.bloodGroup) { toast.error('Blood group is required'); return; }
    if (!profile.emergencyContact?.name || !profile.emergencyContact?.phone) { toast.error('Emergency contact name & phone required'); return; }
    setSaving(true);
    try {
      await api.post('/patients/profile', profile);
      toast.success('Medical profile saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><span className="dots"><span/><span/><span/></span></div>;

  return (
    <div className="animate-in">
      <ToastContainer toasts={toast.toasts}/>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', letterSpacing: '-.02em' }}>Medical Profile</h1>
          <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: 4 }}>Stored once, accessed instantly during emergencies</p>
        </div>
        <button className="btn btn-primary" onClick={onSave} disabled={saving}>
          {saving ? <span className="dots"><span/><span/><span/></span> : '💾 Save Profile'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>

        {/* Blood Group */}
        <div className="card">
          <div className="card-title">Blood Group <span style={{ color: 'var(--red)' }}>*</span></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BLOOD_GROUPS.map(bg => (
              <button key={bg} type="button"
                onClick={() => setProfile(p => ({ ...p, bloodGroup: bg }))}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: `1px solid ${profile.bloodGroup === bg ? 'var(--accent)' : 'var(--border)'}`,
                  background: profile.bloodGroup === bg ? 'rgba(59,130,246,.15)' : 'var(--bg3)',
                  color: profile.bloodGroup === bg ? 'var(--a2)' : 'var(--text2)',
                  fontFamily: 'var(--fm)', fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontSize: '.9rem'
                }}>{bg}</button>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <div className="card-title">Emergency Contact <span style={{ color: 'var(--red)' }}>*</span></div>
          <div className="form-group"><label className="form-label">Name</label>
            <input className="form-input" value={profile.emergencyContact?.name || ''} onChange={e => setProfile(p => ({ ...p, emergencyContact: { ...p.emergencyContact, name: e.target.value } }))} placeholder="Contact Name"/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Relationship</label>
              <input className="form-input" value={profile.emergencyContact?.relationship || ''} onChange={e => setProfile(p => ({ ...p, emergencyContact: { ...p.emergencyContact, relationship: e.target.value } }))} placeholder="Spouse"/>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Phone</label>
              <input className="form-input" value={profile.emergencyContact?.phone || ''} onChange={e => setProfile(p => ({ ...p, emergencyContact: { ...p.emergencyContact, phone: e.target.value } }))} placeholder="+91 99..."/>
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="card">
          <div className="card-title">Allergies</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {profile.allergies?.map((a, i) => (
              <span key={i} className="tag" style={{ color: 'var(--amber)', borderColor: 'rgba(245,158,11,.3)', cursor: 'pointer' }} onClick={() => removeTag('allergies', i)}>
                ⚠ {a} ✕
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={allergyInput} onChange={e => setAllergyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('allergies', allergyInput, setAllergyInput))} placeholder="e.g. Penicillin, Sulfa" style={{ flex: 1 }}/>
            <button className="btn btn-outline btn-sm" onClick={() => addTag('allergies', allergyInput, setAllergyInput)}>Add</button>
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="card">
          <div className="card-title">Chronic Conditions</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {profile.chronicConditions?.map((c, i) => (
              <span key={i} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeTag('chronicConditions', i)}>{c} ✕</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={conditionInput} onChange={e => setConditionInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('chronicConditions', conditionInput, setConditionInput))} placeholder="e.g. Diabetes, Asthma" style={{ flex: 1 }}/>
            <button className="btn btn-outline btn-sm" onClick={() => addTag('chronicConditions', conditionInput, setConditionInput)}>Add</button>
          </div>
        </div>

        {/* Medications */}
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <div className="card-title">Current Medications</div>
          {profile.currentMedications?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {profile.currentMedications.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
                  <div style={{ fontSize: '.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                    {m.dosage && <span style={{ color: 'var(--text2)' }}> · {m.dosage}</span>}
                    {m.frequency && <span style={{ color: 'var(--text3)' }}> · {m.frequency}</span>}
                  </div>
                  <button className="btn-ghost btn btn-sm" onClick={() => removeMed(i)} style={{ color: 'var(--red)' }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10 }}>
            <input className="form-input" value={medInput.name} onChange={e => setMedInput(p => ({ ...p, name: e.target.value }))} placeholder="Medication name *"/>
            <input className="form-input" value={medInput.dosage} onChange={e => setMedInput(p => ({ ...p, dosage: e.target.value }))} placeholder="Dosage (e.g. 500mg)"/>
            <input className="form-input" value={medInput.frequency} onChange={e => setMedInput(p => ({ ...p, frequency: e.target.value }))} placeholder="Frequency (e.g. 2x daily)"/>
            <button className="btn btn-outline" onClick={addMed}>+ Add</button>
          </div>
        </div>

        {/* Past History */}
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <div className="card-title">Past Medical History</div>
          <textarea className="form-textarea" style={{ minHeight: 110 }} value={profile.pastMedicalHistory || ''} onChange={e => setProfile(p => ({ ...p, pastMedicalHistory: e.target.value }))} placeholder="Previous surgeries, hospitalizations, major illnesses, family history of conditions..."/>
        </div>
      </div>
    </div>
  );
}
