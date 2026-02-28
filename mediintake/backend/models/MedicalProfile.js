const mongoose = require('mongoose');

const MedicalProfileSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required']
  },
  allergies: [{
    type: String,
    trim: true
  }],
  chronicConditions: [{
    type: String,
    trim: true
  }],
  currentMedications: [{
    name: { type: String, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true }
  }],
  pastMedicalHistory: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  emergencyContact: {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, required: true, trim: true }
  },
  height: { type: Number },    // cm
  weight: { type: Number },    // kg
  smoker: { type: Boolean, default: false },
  drinker: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('MedicalProfile', MedicalProfileSchema);
