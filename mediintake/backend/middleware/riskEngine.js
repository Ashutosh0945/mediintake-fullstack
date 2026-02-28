/**
 * MediIntake - AI Risk Scoring Engine
 * Simulates a Logistic Regression model for emergency triage prioritization.
 * In production, this would call a Python Flask ML microservice.
 *
 * Features used:
 *  - Symptoms (chest pain, breathlessness, palpitations, sweating, etc.)
 *  - Severity (1-5)
 *  - Vitals (heart rate, temperature, oxygen saturation)
 *  - Duration of symptoms
 */

// Feature weights derived from a trained Logistic Regression model
const WEIGHTS = {
  intercept: -2.1,

  // High-risk symptoms
  'Chest Pain':     1.85,
  'Breathlessness': 1.60,
  'Palpitations':   1.20,
  'Sweating':       0.90,
  'Dizziness':      0.75,

  // Medium-risk symptoms
  'High Fever':     0.65,
  'Vomiting':       0.50,
  'Body Pain':      0.35,
  'Nausea':         0.30,

  // Low-risk symptoms
  'Fever':          0.20,
  'Headache':       0.25,
  'Fatigue':        0.15,
  'Cough':          0.10,
};

// Sigmoid function (logistic function)
function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Calculate AI risk score
 * @param {Object} intakeData
 * @returns {Object} { probability, level, factors }
 */
function calculateRiskScore(intakeData) {
  const { symptoms = [], severity = 1, vitals = {}, duration = '6-24h' } = intakeData;

  let z = WEIGHTS.intercept;
  const factors = [];

  // ── Symptom contributions ────────────────────────────────
  for (const symptom of symptoms) {
    // Normalize symptom name (strip emoji)
    const clean = symptom.replace(/[^\w\s]/g, '').trim();
    const matchedKey = Object.keys(WEIGHTS).find(k =>
      clean.toLowerCase().includes(k.toLowerCase())
    );
    if (matchedKey && WEIGHTS[matchedKey]) {
      z += WEIGHTS[matchedKey];
      if (WEIGHTS[matchedKey] >= 0.8) {
        factors.push(`High-risk symptom: ${matchedKey}`);
      }
    }
  }

  // ── Severity contribution ────────────────────────────────
  if (severity >= 4) {
    z += 0.80;
    factors.push(`High severity (${severity}/5)`);
  } else if (severity >= 3) {
    z += 0.30;
  }

  // ── Vitals contributions ─────────────────────────────────
  const { heartRate, temperature, oxygenSaturation } = vitals;

  if (heartRate) {
    if (heartRate > 120) { z += 1.0; factors.push(`Tachycardia (HR: ${heartRate} bpm)`); }
    else if (heartRate > 100) { z += 0.50; factors.push(`Elevated HR (${heartRate} bpm)`); }
    else if (heartRate < 50)  { z += 0.70; factors.push(`Bradycardia (HR: ${heartRate} bpm)`); }
  }

  if (temperature) {
    if (temperature > 103)      { z += 0.70; factors.push(`High fever (${temperature}°F)`); }
    else if (temperature > 100) { z += 0.30; }
    else if (temperature < 96)  { z += 0.60; factors.push(`Hypothermia risk (${temperature}°F)`); }
  }

  if (oxygenSaturation) {
    if (oxygenSaturation < 90)  { z += 1.20; factors.push(`Critical O₂ sat (${oxygenSaturation}%)`); }
    else if (oxygenSaturation < 94) { z += 0.60; factors.push(`Low O₂ sat (${oxygenSaturation}%)`); }
  }

  // ── Duration contribution ────────────────────────────────
  if (duration === '<6h' && symptoms.some(s => s.includes('Chest'))) {
    z += 0.50; // acute onset chest pain = higher risk
    factors.push('Acute onset chest symptoms');
  }

  // ── Add small random noise (simulate model variance) ────
  z += (Math.random() * 0.12) - 0.06;

  const probability = Math.max(0.02, Math.min(0.98, sigmoid(z)));

  let level;
  if (probability >= 0.70) level = 'high';
  else if (probability >= 0.40) level = 'medium';
  else level = 'low';

  if (factors.length === 0) {
    factors.push('No high-risk factors identified');
  }

  return { probability: parseFloat(probability.toFixed(4)), level, factors };
}

module.exports = { calculateRiskScore };
