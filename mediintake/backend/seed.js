const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const User     = require('./models/User');
const MedicalProfile = require('./models/MedicalProfile');
const Intake   = require('./models/Intake');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediintake';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    await User.deleteMany({});
    await MedicalProfile.deleteMany({});
    await Intake.deleteMany({});

    console.log('🗑  All data cleared — database is now empty');
    console.log('');
    console.log('Go to http://localhost:3000/register to create your own accounts');

  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();