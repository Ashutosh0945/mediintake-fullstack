const mongoose = require('mongoose');

const IntakeSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  intakeId: {
    type: String,
    unique: true
  },

  // Symptoms
  symptoms: [{
    type: String,
    trim: true
  }],
  severity: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Severity rating is required']
  },
  duration: {
    type: String,
    enum: ['<6h', '6-24h', '1-3d', '>3d'],
    required: true
  },
  notes: {
    type: String,
    maxlength: 1000
  },

  // Vitals
  vitals: {
    temperature: { type: Number },   // °F
    heartRate:   { type: Number },   // bpm
    bloodPressureSystolic:  { type: Number },
    bloodPressureDiastolic: { type: Number },
    oxygenSaturation: { type: Number }, // %
    respiratoryRate: { type: Number }   // breaths/min
  },

  // AI Risk Score (computed by ML microservice or built-in logic)
  riskScore: {
    probability: { type: Number, min: 0, max: 1 },
    level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    factors: [{ type: String }]   // contributing risk factors
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'admitted', 'discharged'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: { type: Date },
  reviewNotes: { type: String }

}, { timestamps: true });

// Auto-generate intake ID
IntakeSchema.pre('save', async function (next) {
  if (this.isNew && !this.intakeId) {
    const count = await mongoose.model('Intake').countDocuments();
    this.intakeId = `INT-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Intake', IntakeSchema);
