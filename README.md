# 🏥 CBS — Clinic Booking System

> **Group 19 · CMPG 311 · DBMS Module · Phase 3**
> **Current Status:** Phase 3 — Active Implementation Sprint (4 May – 18 May 2025)
>
> We are building a full-stack Clinic Appointment System for Ubuntu Campus Clinic. The primary exam deliverable is the **PostgreSQL database** — schema design, migrations, data integrity, and raw SQL queries. The Django REST API and React frontend exist to demonstrate the database working end-to-end.

CBS (Clinic Booking System) is a web application that replaces the manual paper-based appointment system at Ubuntu Campus Clinic, enabling students to book appointments online, manage their medical records, and receive automated notifications.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Database** | PostgreSQL 15 | Primary exam deliverable — all 12 ERD tables |
| **Backend** | Django 5.0 + Django REST Framework | API, ORM, migrations, admin panel |
| **Auth** | JWT (SimpleJWT) | Stateless login via `USER_ACCOUNT` table |
| **Frontend** | React 18 + Tailwind CSS | UI — connects to API via axios |
| **Testing** | pytest + pytest-django | Unit tests per module |
| **Deployment** | Render.com | Live URL for examiner |
| **CI** | GitHub Actions | Runs pytest on every PR to `dev` |

---

## ⚙️ Prerequisites

Before you start, make sure you have:

1. **Python 3.11+** — [Download](https://www.python.org/downloads/)
2. **Node.js 18+** — [Download](https://nodejs.org/)
3. **PostgreSQL 15** — [Download](https://www.postgresql.org/download/)
4. **Git** — [Download](https://git-scm.com/)

---

## 🗄 Database Schema

The schema was finalised in Phase 2. **These 12 tables are locked — do not rename columns or restructure without telling the DB Lead (S1) first.**

| Table | Module Owner | Key Relationships |
|---|---|---|
| `PATIENT` | Module 2 | Core entity — referenced by 6 other tables |
| `PATIENT_CONTACT` | Module 2 | FK → `PATIENT` |
| `USER_ACCOUNT` | Module 1 | FK → `PATIENT` or `STAFF` (CHECK constraint) |
| `AUDIT_LOG` | Module 6 | FK → `USER_ACCOUNT` |
| `DEPARTMENT` | Module 6 | FK → `STAFF` (head) |
| `STAFF` | Module 3 | FK → `DEPARTMENT` |
| `DOCTOR` | Module 3 | PK + FK → `STAFF` (subtype) |
| `TIMESLOT` | Module 3 | Referenced by `APPOINTMENT` |
| `APPOINTMENT` | Module 4 | FK → `PATIENT`, `STAFF`, `TIMESLOT` |
| `QUEUE_ENTRY` | Module 5 | FK → `APPOINTMENT` (1:1, UNIQUE) |
| `MEDICAL_RECORD` | Module 4/2 | FK → `APPOINTMENT`, `PATIENT` |
| `NOTIFICATION` | Module 7 | FK → `APPOINTMENT`, `PATIENT` or `STAFF` |

---

## 🏄 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/<your-org>/cbs-clinic.git
cd cbs-clinic
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Setup (Critical!) 🔑

We do not commit real credentials to GitHub. Create a `.env` file in the `backend/` directory:

```bash
# Copy the example file
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True
DB_NAME=cbs_clinic
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432
```

> ⚠️ `.env` is in `.gitignore`. **Never commit it.** Ask the DB Lead (S1) for staging/production values.

### 4. Database Setup

```bash
# Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE cbs_clinic;"

# Apply all migrations (run in dependency order)
python manage.py migrate

# Seed the database with realistic demo data
python manage.py seed_db
```

### 5. Run the Backend

```bash
python manage.py runserver
# API available at http://localhost:8000/api/
# Admin panel at http://localhost:8000/admin/
```

### 6. Frontend Setup

```bash
cd ../frontend
npm install
npm start
# React app at http://localhost:3000/
```

---

## 📂 Project Structure

```text
cbs-clinic/
├── backend/
│   ├── config/                  # Django settings, urls, wsgi
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── auth_module/         # Module 1 — USER_ACCOUNT, JWT
│   │   ├── patients/            # Module 2 — PATIENT, PATIENT_CONTACT, MEDICAL_RECORD
│   │   ├── doctors/             # Module 3 — STAFF, DOCTOR, TIMESLOT, DEPARTMENT
│   │   ├── appointments/        # Module 4 — APPOINTMENT
│   │   ├── queue/               # Module 5 — QUEUE_ENTRY
│   │   ├── admin_reporting/     # Module 6 — AUDIT_LOG, raw SQL reports
│   │   └── notifications/       # Module 7 — NOTIFICATION, seed_db command
│   ├── requirements.txt
│   ├── manage.py
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/               # Route-level components
│   │   ├── components/          # Shared UI components
│   │   ├── services/            # Axios API service layer
│   │   └── context/             # AuthContext (JWT)
│   ├── package.json
│   └── tailwind.config.js
│
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions — pytest on every PR
│
└── README.md
```

### 🧠 The Adapter Rule

**Important:** React must never query the database directly.

- **React pages** should only call **axios service functions** (e.g., `patientsService.getAll()`).
- **Service functions** call Django API endpoints (`/api/patients/`).
- **Django views** use the ORM or raw SQL to talk to PostgreSQL.

If the backend URL structure changes, only the service layer changes — no React component needs to be touched.

---

## 🌍 Environment Files

| File | Committed | Purpose |
|---|---|---|
| `backend/.env.example` | ✅ Yes | Template — all variable names, no real values |
| `backend/.env` | ❌ No | Local development — your real credentials |
| Render env vars | ❌ No | Production — set in Render.com dashboard |

---

## 🧪 Running Tests

```bash
cd backend

# Run all tests
pytest

# Run tests for a specific module
pytest apps/auth_module/tests/
pytest apps/patients/tests/
pytest apps/appointments/tests/

# Run with verbose output
pytest -v --tb=short
```

Tests use a separate test database. `conftest.py` provides shared fixtures (test patient, test doctor, test timeslot) so every module has consistent test data.

---

## 🌐 API Endpoints Overview

All endpoints are prefixed with `/api/`. JWT token required on all protected routes.

| Method | Endpoint | Module | Description |
|---|---|---|---|
| `POST` | `/auth/login/` | 1 | Returns JWT access + refresh tokens |
| `POST` | `/auth/register/` | 1 | Creates USER_ACCOUNT |
| `GET/POST` | `/patients/` | 2 | List / create patients |
| `GET/PATCH` | `/patients/{id}/` | 2 | Retrieve / update patient |
| `GET` | `/patients/{id}/records/` | 2 | Medical history for a patient |
| `GET` | `/timeslots/?date=YYYY-MM-DD` | 3 | Available slots for a given date |
| `GET/POST` | `/appointments/` | 4 | List / create appointments |
| `PATCH` | `/appointments/{id}/cancel/` | 4 | Cancel an appointment |
| `POST` | `/queue/check-in/` | 5 | Patient check-in via QR token |
| `PATCH` | `/queue/{id}/status/` | 5 | Advance queue status |
| `GET` | `/admin/reports/` | 6 | Daily counts, wait times (raw SQL) |
| `GET` | `/notifications/` | 7 | Notification history |

---

## 🚀 Deployment

The application is deployed on **Render.com** as three services:

1. **PostgreSQL** — Render managed database
2. **Backend** — Python/Django web service
3. **Frontend** — React static site

**Live URL:** `https://cbs-clinic.onrender.com` _(update once deployed)_

---

## 👥 Team

| Role | Name | Module | Tables |
|---|---|---|---|
| DB Lead + DevOps | S1 | 7/9 | NOTIFICATION + all migrations + deployment |
| Auth | Module 1 | 1 | USER_ACCOUNT |
| Patient | Module 2 | 2 | PATIENT, PATIENT_CONTACT, MEDICAL_RECORD |
| Doctor + Scheduling | Module 3 | 3 | STAFF, DOCTOR, TIMESLOT, DEPARTMENT |
| Appointment Booking | Module 4 | 4 | APPOINTMENT |
| Queue Management | Module 5 | 5 | QUEUE_ENTRY |
| Admin + Reporting | Module 6 | 6 | AUDIT_LOG, DEPARTMENT |
| Notifications | Module 7 | 7 | NOTIFICATION |
| Integration + Testing | Module 8 | 8 | — (all modules) |

---

## 📚 Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pytest-django](https://pytest-django.readthedocs.io/)
- [Render.com Docs](https://render.com/docs)
