const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Intake = require('../models/Intake');
const MedicalProfile = require('../models/MedicalProfile');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('doctor', 'nurse', 'admin'));

// ── GET /api/hospital/dashboard ──────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const thisWeek = new Date(Date.now() - 7*24*60*60*1000);

    const [
      totalPatients,
      todayIntakes,
      highRisk,
      mediumRisk,
      lowRisk,
      pendingReview,
      weeklyIntakes
    ] = await Promise.all([
      User.countDocuments({ role: 'patient', isActive: true }),
      Intake.countDocuments({ createdAt: { $gte: today } }),
      Intake.countDocuments({ 'riskScore.level': 'high', status: 'pending' }),
      Intake.countDocuments({ 'riskScore.level': 'medium', status: 'pending' }),
      Intake.countDocuments({ 'riskScore.level': 'low', status: 'pending' }),
      Intake.countDocuments({ status: 'pending' }),
      Intake.countDocuments({ createdAt: { $gte: thisWeek } })
    ]);

    // Top symptoms
    const symptomAgg = await Intake.aggregate([
      { $unwind: '$symptoms' },
      { $group: { _id: '$symptoms', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    res.json({
      success: true,
      dashboard: {
        totalPatients,
        todayIntakes,
        highRisk,
        mediumRisk,
        lowRisk,
        pendingReview,
        weeklyIntakes,
        topSymptoms: symptomAgg
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/hospital/patient/:id/full ───────────────────────
// Full patient record with intake history
router.get('/patient/:id/full', async (req, res) => {
  try {
    const [patient, profile, intakes] = await Promise.all([
      User.findById(req.params.id).select('-password'),
      MedicalProfile.findOne({ patient: req.params.id }),
      Intake.find({ patient: req.params.id }).sort({ createdAt: -1 }).limit(10)
    ]);

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    res.json({ success: true, patient, profile, intakes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
