const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'nurse', 'admin'],
    default: 'patient'
  },
  age:        { type: Number },
  gender:     { 
    type: String, 
    enum: ['male', 'female', 'other', null],
    default: null
  },
  phone:      { type: String },
  patientId:  { type: String, unique: true, sparse: true },
  staffId:    { type: String, unique: true, sparse: true },
  department: { type: String },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isNew && this.role === 'patient' && !this.patientId) {
    const count = await mongoose.model('User').countDocuments({ role: 'patient' });
    this.patientId = `P-${String(count + 1001).padStart(4, '0')}`;
  }
  if (this.isNew && this.role !== 'patient' && !this.staffId) {
    const count = await mongoose.model('User').countDocuments({ role: { $ne: 'patient' } });
    this.staffId = `S-${String(count + 1001).padStart(4, '0')}`;
  }
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);