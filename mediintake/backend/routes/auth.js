const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

/*
==============================
REGISTER
==============================
*/
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "patient"
    });

    sendToken(user, 201, res);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/*
==============================
LOGIN
==============================
*/
router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    sendToken(user, 200, res);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});


/*
==============================
CURRENT USER
==============================
*/
router.get('/me', protect, async (req, res) => {

  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    user
  });

});


module.exports = router;