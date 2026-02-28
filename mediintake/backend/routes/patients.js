const express = require('express');
const router = express.Router();
const MedicalProfile = require('../models/MedicalProfile');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// ── GET /api/patients/profile ────────────────────────────────
// Get current patient's medical profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await MedicalProfile.findOne({ patient: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please complete your medical profile.' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/patients/profile ───────────────────────────────
// Create or update medical profile
router.post('/profile', async (req, res) => {
  try {
    const {
      bloodGroup, allergies, chronicConditions, currentMedications,
      pastMedicalHistory, emergencyContact, height, weight, smoker, drinker
    } = req.body;

    const profileData = {
      patient: req.user._id,
      bloodGroup,
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      currentMedications: currentMedications || [],
      pastMedicalHistory,
      emergencyContact,
      height,
      weight,
      smoker,
      drinker
    };

    const profile = await MedicalProfile.findOneAndUpdate(
      { patient: req.user._id },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ success: true, profile });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/patients/:id/emergency ─────────────────────────
// Emergency quick-view (hospital staff + patient themselves)
router.get('/:id/emergency', authorize('doctor', 'nurse', 'admin'), async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const profile = await MedicalProfile.findOne({ patient: req.params.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'No medical profile found for this patient.' });
    }

    // Return ONLY emergency-critical fields
    res.json({
      success: true,
      emergency: {
        patientId: patient.patientId,
        name:      patient.name,
        age:       patient.age,
        gender:    patient.gender,
        bloodGroup: profile.bloodGroup,
        allergies:  profile.allergies,
        chronicConditions: profile.chronicConditions,
        currentMedications: profile.currentMedications,
        emergencyContact: profile.emergencyContact
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/patients (hospital staff only) ──────────────────
router.get('/', authorize('doctor', 'nurse', 'admin'), async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'patient', isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({ success: true, patients, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
