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

  age: Number,

  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null
  },

  phone: String,

  patientId: { type: String, unique: true, sparse: true },
  staffId: { type: String, unique: true, sparse: true },

  department: String,

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

/* PASSWORD HASH */
UserSchema.pre('save', async function(next) {

  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();

});

/* AUTO GENERATE IDS */
UserSchema.pre('save', async function(next) {

  if (!this.isNew) return next();

  if (this.role === 'patient' && !this.patientId) {

    const count = await mongoose.model('User').countDocuments({ role: 'patient' });

    this.patientId = `P-${String(count + 1001).padStart(4, '0')}`;

  }

  if (this.role !== 'patient' && !this.staffId) {

    const count = await mongoose.model('User').countDocuments({ role: { $ne: 'patient' } });

    this.staffId = `S-${String(count + 1001).padStart(4, '0')}`;

  }

  next();

});

/* PASSWORD CHECK */
UserSchema.methods.matchPassword = async function(enteredPassword) {

  return await bcrypt.compare(enteredPassword, this.password);

};

module.exports = mongoose.model('User', UserSchema);