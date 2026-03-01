const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();


// ── CORS CONFIG (BEST VERSION) ─────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {

    const allowedOrigins = [
      "http://localhost:3000",
      "https://mediintake1.vercel.app",
      "https://mediintake1-git-main.vercel.app",
      "https://mediintake1-ashutosh0945.vercel.app"
    ];

    // allow requests with no origin (mobile apps / curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // allow all for now
    }
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // important for preflight


// ── BODY PARSER ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ── ROUTES ─────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/intakes', require('./routes/intakes'));
app.use('/api/hospital', require('./routes/hospital'));


// ── HEALTH CHECK ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MediIntake API is running',
    time: new Date()
  });
});


// ── ROOT TEST (helps debugging) ─────────────────────────────
app.get('/', (req, res) => {
  res.send("MediIntake Backend Running 🚀");
});


// ── 404 HANDLER ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// ── GLOBAL ERROR HANDLER ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});


// ── DATABASE + SERVER START ────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {

    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  })
  .catch(err => {

    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);

  });