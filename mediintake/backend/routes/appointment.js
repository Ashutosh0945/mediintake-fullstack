const express = require('express');
const router  = express.Router();
const Appointment = require('../models/Appointment');
const User        = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('name department staffId');
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({ success: false, message: 'All fields required.' });
    }
    const appt = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date, time, reason
    });
    await appt.populate('doctor', 'name department');
    res.status(201).json({ success: true, appointment: appt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/mine', async (req, res) => {
  try {
    const appts = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name department staffId')
      .sort({ date: 1, time: 1 });
    res.json({ success: true, appointments: appts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/all', authorize('doctor', 'nurse', 'admin'), async (req, res) => {
  try {
    const appts = await Appointment.find()
      .populate('patient', 'name patientId')
      .populate('doctor', 'name department')
      .sort({ date: 1, time: 1 });
    res.json({ success: true, appointments: appts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id', authorize('doctor', 'nurse', 'admin'), async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, notes: req.body.notes },
      { new: true }
    ).populate('patient', 'name patientId').populate('doctor', 'name');
    if (!appt) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Not found.' });
    if (appt.patient.toString() !== req.user._id.toString() && req.user.role === 'patient') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    await appt.deleteOne();
    res.json({ success: true, message: 'Appointment cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
```

---

## Step 3 — Create `Appointment.js` in models folder

Go to:
```
mediintake-fullstack\mediintake\backend\models\