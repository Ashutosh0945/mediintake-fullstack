const express = require('express');
const router = express.Router();
const Intake = require('../models/Intake');
const { protect, authorize } = require('../middleware/auth');
const { calculateRiskScore } = require('../middleware/riskEngine');

router.use(protect);

// ── POST /api/intakes ────────────────────────────────────────
// Patient submits a new intake form
router.post('/', async (req, res) => {
  try {
    const { symptoms, severity, duration, notes, vitals } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one symptom is required.' });
    }

    // 🧠 Calculate AI risk score
    const riskScore = calculateRiskScore({ symptoms, severity, vitals, duration });

    const intake = await Intake.create({
      patient: req.user._id,
      symptoms,
      severity,
      duration,
      notes,
      vitals,
      riskScore
    });

    await intake.populate('patient', 'name patientId age gender');

    res.status(201).json({ success: true, intake });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/intakes/mine ────────────────────────────────────
// Patient views their own intake history
router.get('/mine', async (req, res) => {
  try {
    const intakes = await Intake.find({ patient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, intakes, total: intakes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/intakes/queue ───────────────────────────────────
// Hospital staff sees the full risk-sorted queue
router.get('/queue', authorize('doctor', 'nurse', 'admin'), async (req, res) => {
  try {
    const { riskLevel, search, status = 'pending' } = req.query;

    const matchStage = {};
    if (status) matchStage.status = status;
    if (riskLevel) matchStage['riskScore.level'] = riskLevel;

    let intakes = await Intake.find(matchStage)
      .populate('patient', 'name patientId age gender')
      .sort({ 'riskScore.probability': -1, createdAt: 1 })
      .limit(50);

    // Optional name search after populate
    if (search) {
      const s = search.toLowerCase();
      intakes = intakes.filter(i =>
        i.patient?.name?.toLowerCase().includes(s) ||
        i.patient?.patientId?.toLowerCase().includes(s) ||
        i.intakeId?.toLowerCase().includes(s)
      );
    }

    res.json({ success: true, intakes, total: intakes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/intakes/stats ───────────────────────────────────
// Dashboard stats for hospital
router.get('/stats', authorize('doctor', 'nurse', 'admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, high, medium, low, pending] = await Promise.all([
      Intake.countDocuments({ createdAt: { $gte: today } }),
      Intake.countDocuments({ createdAt: { $gte: today }, 'riskScore.level': 'high' }),
      Intake.countDocuments({ createdAt: { $gte: today }, 'riskScore.level': 'medium' }),
      Intake.countDocuments({ createdAt: { $gte: today }, 'riskScore.level': 'low' }),
      Intake.countDocuments({ status: 'pending' })
    ]);

    res.json({ success: true, stats: { total, high, medium, low, pending } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/intakes/:id ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const intake = await Intake.findById(req.params.id)
      .populate('patient', 'name patientId age gender phone')
      .populate('reviewedBy', 'name role');

    if (!intake) {
      return res.status(404).json({ success: false, message: 'Intake not found.' });
    }

    // Patient can only view their own
    if (req.user.role === 'patient' && intake.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, intake });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/intakes/:id/review ────────────────────────────
// Hospital staff marks intake as reviewed
router.patch('/:id/review', authorize('doctor', 'nurse', 'admin'), async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    const intake = await Intake.findByIdAndUpdate(
      req.params.id,
      { status, reviewNotes, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).populate('patient', 'name patientId');

    if (!intake) {
      return res.status(404).json({ success: false, message: 'Intake not found.' });
    }

    res.json({ success: true, intake });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
