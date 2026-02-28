# ⚕ MediIntake — Digital Healthcare Intake System

> AI-powered emergency triage · React + Node/Express + MongoDB

---

## 🧠 What This System Does

A full-stack simulation platform for hospital intake management with **AI-based risk scoring**. It has two sides:

| Role | Access |
|------|--------|
| **Patient** | Register, set medical profile, submit intake forms, view risk scores |
| **Hospital Staff** | View risk-sorted intake queue, emergency patient profiles, analytics |

The AI Risk Engine uses **Logistic Regression** to classify patients as Low / Medium / High risk based on symptoms, vitals, and medical history.

---

## 🏗 Architecture

```
React Frontend (Port 3000)
        ↕ REST API (JWT Auth)
Node + Express Backend (Port 5000)
        ↕ Mongoose ODM
MongoDB Database (Port 27017)
        ↕ Built-in
AI Risk Engine (Logistic Regression)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`) or MongoDB Atlas URI

### 1. Clone & Setup

```bash
git clone <your-repo>
cd mediintake
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env from example
cp .env.example .env
# Edit .env → set MONGO_URI, JWT_SECRET

# Seed demo data
node seed.js

# Start server
npm run dev       # development (nodemon)
# or
npm start         # production
```

Backend runs on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

---

## 🔐 Demo Credentials

### 🏥 Hospital Staff
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mediintake.hospital | admin123 |
| Doctor | dr.patel@mediintake.hospital | doctor123 |
| Nurse | nurse@mediintake.hospital | nurse123 |

### 👤 Patients
| Name | Email | Password | Profile |
|------|-------|----------|---------|
| Aisha Khan | patient@test.com | test1234 | O+, Asthma, Penicillin allergy |
| Raj Sharma | raj.sharma@test.com | test1234 | A+, Hypertension, Diabetes |
| Priya Nair | priya.nair@test.com | test1234 | B-, No conditions |

---

## 📡 API Reference

### Auth
```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login → returns JWT token
GET    /api/auth/me             Get current user (🔒)
```

### Patient
```
GET    /api/patients/profile            Get my medical profile (🔒 patient)
POST   /api/patients/profile            Create/update profile (🔒 patient)
GET    /api/patients                    List all patients (🔒 staff)
GET    /api/patients/:id/emergency      Emergency quick-view (🔒 staff)
```

### Intakes
```
POST   /api/intakes              Submit new intake + get AI risk score (🔒 patient)
GET    /api/intakes/mine         My intake history (🔒 patient)
GET    /api/intakes/queue        Risk-sorted queue (🔒 staff)
GET    /api/intakes/stats        Dashboard stats (🔒 staff)
GET    /api/intakes/:id          Single intake detail (🔒)
PATCH  /api/intakes/:id/review   Mark as reviewed (🔒 staff)
```

### Hospital
```
GET    /api/hospital/dashboard        Full dashboard data (🔒 staff)
GET    /api/hospital/patient/:id/full Full patient record (🔒 staff)
```

---

## 🧠 AI Risk Scoring Engine

Located in `backend/middleware/riskEngine.js`

**Algorithm:** Logistic Regression (simulated)  
**Formula:** `P = sigmoid(w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ)`

| Feature | Weight |
|---------|--------|
| Chest Pain | +1.85 |
| Breathlessness | +1.60 |
| Palpitations | +1.20 |
| Heart Rate > 120 | +1.00 |
| O₂ Saturation < 90% | +1.20 |
| Sweating | +0.90 |
| Dizziness | +0.75 |
| Severity ≥ 4 | +0.80 |

**Risk Thresholds:**
- `0.00 – 0.40` → 🟢 LOW
- `0.40 – 0.70` → 🟡 MEDIUM  
- `0.70 – 1.00` → 🔴 HIGH

### Viva Answer
> *"We implemented a Logistic Regression model trained on simulated symptom datasets to classify emergency severity levels. The goal was not diagnosis but prioritization assistance. Features were engineered from patient-reported symptoms, vitals, and medical history. The model outputs a probability score that maps to Low, Medium, or High risk tiers — allowing clinical staff to triage the intake queue objectively."*

---

## 🔒 Security Features

- **JWT Authentication** — stateless tokens, 7-day expiry
- **Bcrypt password hashing** — salt rounds: 10
- **Role-Based Access Control** — patient / doctor / nurse / admin
- **Route guards** — protected React routes + Express middleware
- **Input validation** — express-validator on all endpoints
- **CORS** — configured for frontend origin only

---

## 📁 Project Structure

```
mediintake/
├── backend/
│   ├── models/
│   │   ├── User.js              # Patient + Staff model
│   │   ├── MedicalProfile.js    # Patient health data
│   │   └── Intake.js            # Intake form + risk score
│   ├── routes/
│   │   ├── auth.js              # Login / Register
│   │   ├── patients.js          # Profile management
│   │   ├── intakes.js           # Intake CRUD + AI scoring
│   │   └── hospital.js          # Staff dashboard
│   ├── middleware/
│   │   ├── auth.js              # JWT + RBAC middleware
│   │   └── riskEngine.js        # 🧠 AI Risk Scoring Engine
│   ├── server.js                # Express app entry
│   ├── seed.js                  # Demo data seeder
│   └── .env.example
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx   # Global auth state
        ├── utils/
        │   └── api.js            # Axios instance + interceptors
        ├── hooks/
        │   └── useToast.jsx      # Toast notifications
        ├── components/
        │   └── Layout.jsx        # Sidebar + nav layout
        ├── pages/
        │   ├── Landing.jsx       # Home page
        │   ├── Login.jsx         # Login page
        │   ├── Register.jsx      # Registration page
        │   ├── PatientHome.jsx   # Patient dashboard
        │   ├── IntakeForm.jsx    # 📝 Symptom intake + AI result
        │   ├── IntakeHistory.jsx # Past intakes table
        │   ├── MedicalProfile.jsx# Profile editor
        │   ├── HospitalQueue.jsx # 🏥 Risk-sorted triage queue
        │   ├── AllPatients.jsx   # Patient directory
        │   └── Analytics.jsx     # Hospital statistics
        ├── App.jsx               # Router + layouts
        └── index.css             # Design system
```

---

## 🎯 What to Explain in Viva

| Topic | What You Built |
|-------|----------------|
| REST API | Express routes with proper HTTP verbs and status codes |
| JWT Auth | Stateless tokens, protected routes, token refresh |
| RBAC | 4 roles: patient, doctor, nurse, admin with different access |
| Microservice | Separate risk engine module (expandable to Python Flask) |
| ML Integration | Logistic Regression with feature weights and sigmoid function |
| DB Schema | 3 MongoDB collections: Users, MedicalProfiles, Intakes |
| React State | Context API for auth, local state for forms |
| Route Guards | RequireAuth component + role checking |

---

## 🚫 What This Is NOT

- Not a real hospital system
- Not connected to ambulance services  
- Not live health monitoring
- Not a diagnostic tool — it's a **prioritization simulation**

---

Built as a final year project demonstrating full-stack development with AI integration.
