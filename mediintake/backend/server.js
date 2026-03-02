const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* -------------------- CORS -------------------- */

app.use(
  cors({
    origin: true, // allow all origins (safe for now)
    credentials: true
  })
);

app.options("*", cors());

/* -------------------- BODY PARSER -------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- ROUTES -------------------- */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/patients", require("./routes/patients"));
app.use("/api/intakes", require("./routes/intakes"));
app.use("/api/hospital", require("./routes/hospital"));

/* -------------------- HEALTH CHECK -------------------- */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "MediIntake API running",
    time: new Date()
  });
});

/* -------------------- ROOT -------------------- */

app.get("/", (req, res) => {
  res.send("MediIntake Backend Running 🚀");
});

/* -------------------- 404 -------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* -------------------- ERROR HANDLER -------------------- */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error"
  });
});

/* -------------------- DATABASE -------------------- */

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });