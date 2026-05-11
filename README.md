# 🏥 Ubuntu Campus Clinic — Appointment System

<div align="center">

![Status](https://img.shields.io/badge/Status-Active%20Development-teal?style=for-the-badge)
![Phase](https://img.shields.io/badge/Phase-3%20Implementation-0D1B2A?style=for-the-badge)
![DB](https://img.shields.io/badge/Database-PostgreSQL%2015-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Django%205.0-092E20?style=for-the-badge&logo=django&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

**Group 19 · CMPG 311 · DBMS Module · Phase 3**

*Replacing manual paper-based clinic scheduling with a production-grade digital system —
built database-first, designed to scale.*

[Getting Started](#-getting-started) · [Architecture](#-architecture) · [Database Schema](#-database-schema) · [API Reference](#-api-reference) · [Team](#-team) · [Docs](#-documentation)

</div>

---

## What Is This?

Ubuntu Campus Clinic runs on paper. Students wait days for appointments. Records get lost. Staff have no visibility into capacity or performance. After hours — the system stops entirely.

This changes that.

The **Ubuntu Campus Clinic Appointment System** is a full-stack web application that digitizes the complete patient lifecycle — registration, booking, queue management, consultation, medical records, and automated notifications — in one centralized platform accessible 24/7 from any browser.

> **The primary exam deliverable is the PostgreSQL database** — schema design, migration architecture, data integrity enforcement, and raw SQL reporting. The Django REST API and React 18 frontend exist to demonstrate the database working end-to-end as a complete, live system.

---

## 🛠 Tech Stack

| Layer | Technology | Why We Chose It |
|---|---|---|
| **Database** | PostgreSQL 15 | ACID compliance · FK enforcement · production-grade · primary exam deliverable |
| **Backend** | Django 5.0 + Django REST Framework | Built-in ORM · admin panel · migrations · serializers |
| **Auth** | JWT via SimpleJWT | Stateless · role encoded in payload · scales horizontally |
| **Frontend** | React 18 + Tailwind CSS | Component-based · responsive · browser + mobile |
| **Testing** | pytest + pytest-django | Clean syntax · shared fixtures · CI integration |
| **Deployment** | Render.com | Free tier · one dashboard · auto-deploy from GitHub |
| **CI** | GitHub Actions | Full pytest suite on every PR to `dev` — broken code never merges |

---

## ⚙️ Prerequisites

| Tool | Version | Download |
|---|---|---|
| Python | 3.11+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| PostgreSQL | 15 | [postgresql.org](https://www.postgresql.org/download/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/smangelemapss/Ubuntu-clinic-DBMS-grp-19.git
cd Ubuntu-clinic-DBMS-grp-19
```

> ⚠️ **Team members:** Always clone from `dev`, never from `main`. Read [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md) before writing any code.

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Mac / Linux
venv\Scripts\activate           # Windows

# Install all dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

We never commit real credentials to GitHub. Create your local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True
DB_NAME=ubuntu_clinic
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432
```

> 🔑 `.env` is in `.gitignore` — it will never be committed. Ask S1 (DB Lead) for staging or production values.

### 4. Database Setup

```bash
# Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE ubuntu_clinic;"

# Apply all migrations — schema created in FK dependency order
python manage.py migrate

# Seed with realistic demo data across all 12 tables
python manage.py seed_db
```

### 5. Run the Backend

```bash
python manage.py runserver
```

| Service | URL |
|---|---|
| API | `http://localhost:8000/api/v1/` |
| Admin Panel | `http://localhost:8000/admin/` |

### 6. Run the Frontend

```bash
cd ../frontend
npm install
npm start
```

| Service | URL |
|---|---|
| React App | `http://localhost:3000/` |

---

## 🏗 Architecture

The system is built on a strict four-layer architecture. Each layer has one responsibility and communicates only with the layer directly below it.

```
┌───────────────────────────────────────────────┐
│           PRESENTATION LAYER                  │
│   React 18 · React Router · Tailwind · axios  │
│   Renders UI · never calls DB directly        │
└──────────────────┬────────────────────────────┘
                   │  HTTP/JSON · /api/v1/
┌──────────────────▼────────────────────────────┐
│           APPLICATION LAYER                   │
│   Django Views · DRF Serializers · SimpleJWT  │
│   Enforces rules · validates · authorizes     │
└──────────────────┬────────────────────────────┘
                   │  Django ORM · QuerySets
┌──────────────────▼────────────────────────────┐
│           DATA ACCESS LAYER                   │
│   Django ORM · psycopg2 · Raw SQL (reports)   │
│   Translates intent into database queries     │
└──────────────────┬────────────────────────────┘
                   │  SQL
┌──────────────────▼────────────────────────────┐
│           DATABASE LAYER                      │
│   PostgreSQL 15 · FK · UNIQUE · CHECK         │
│   Stores data · enforces integrity · ACID     │
│        PRIMARY EXAM DELIVERABLE               │
└───────────────────────────────────────────────┘
```

**The Adapter Rule:** React never queries the database. All HTTP calls go through `src/services/`. All Django views go through serializers. Raw SQL lives only in `admin_reporting/queries.py`.

Full architecture detail — layers, libraries, services, design decisions — in [docs/SYSTEM_DESIGN.md](./docs/SYSTEM_DESIGN.md).

---

## 🗄 Database Schema

The schema was finalized in Phase 2 and is locked. **Do not rename columns or restructure without telling S1 first** — every foreign key in the system depends on these exact names.

| Domain | Table | Key Constraint |
|---|---|---|
| Identity | `PATIENT` | `UNIQUE(student_number)` · `UNIQUE(email)` |
| Identity | `PATIENT_CONTACT` | `FK → PATIENT` ON DELETE CASCADE |
| Identity | `USER_ACCOUNT` | `CHECK(patient OR staff NOT NULL)` · `UNIQUE(username)` |
| Staff | `DEPARTMENT` | `UNIQUE(department_name)` |
| Staff | `STAFF` | `UNIQUE(email)` · `FK → DEPARTMENT` |
| Staff | `DOCTOR` | `PK = FK → STAFF` · `UNIQUE(license_number)` |
| Scheduling | `TIMESLOT` | `is_available DEFAULT TRUE` |
| Scheduling | `APPOINTMENT` | `UNIQUE(slot_id)` · `ON DELETE PROTECT` on all FKs |
| Operations | `QUEUE_ENTRY` | `UNIQUE(appointment_id)` |
| Operations | `MEDICAL_RECORD` | `FK → APPOINTMENT + PATIENT` |
| System | `NOTIFICATION` | `CHECK(patient OR staff NOT NULL)` |
| System | `AUDIT_LOG` | `FK → USER_ACCOUNT` · auto-timestamp · append-only |

**Migration order:** Level 1 → `PATIENT · TIMESLOT · DEPARTMENT` → Level 2 → `PATIENT_CONTACT · STAFF` → Level 3 → `DOCTOR · USER_ACCOUNT` → Level 4 → `APPOINTMENT · AUDIT_LOG` → Level 5 → `QUEUE_ENTRY · MEDICAL_RECORD · NOTIFICATION`

S1 owns all migrations. No one runs `makemigrations` without S1 approval.

---

## 📂 Project Structure

```
Ubuntu-clinic-DBMS-grp-19/
│
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions — pytest on every PR to dev
│
├── backend/
│   ├── config/                  # Django settings · root URLs · WSGI
│   ├── apps/
│   │   ├── auth_module/         # B1 — USER_ACCOUNT · JWT · permissions
│   │   ├── patients/            # B2 — PATIENT · PATIENT_CONTACT · MEDICAL_RECORD · TIMESLOT
│   │   ├── doctors/             # B2/B3 — STAFF · DOCTOR · DEPARTMENT
│   │   ├── appointments/        # B3 — APPOINTMENT · booking · QR generation
│   │   ├── queue/               # B3 — QUEUE_ENTRY · check-in · status flow
│   │   ├── admin_reporting/     # B4 — AUDIT_LOG · raw SQL reports
│   │   └── notifications/       # S1 — NOTIFICATION · email · seed_db
│   ├── requirements.txt
│   ├── manage.py
│   ├── pytest.ini
│   ├── conftest.py              # Shared test fixtures — written and owned by S1
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── routes/              # F1 — route definitions + ProtectedRoute
│       ├── context/             # F1 — AuthContext · JWT · role
│       ├── services/            # F1 — all axios calls · one file per backend app
│       ├── pages/
│       │   ├── auth/            # F1 — Login · Register
│       │   ├── patient/         # F2 — Dashboard · Profile · Booking · Records
│       │   ├── doctor/          # F3 — Dashboard · Schedule · Queue Board
│       │   └── admin/           # F4 — Reports · Audit Log · Notifications
│       ├── components/          # F1 — shared UI · no API calls
│       └── utils/               # Formatters · role guards · error handlers
│
├── docs/
│   └── SYSTEM_DESIGN.md         # Complete system design blueprint
│
├── README.md                    # This file
├── CONTRIBUTING.md              # Standards · branching · PR process · The Laws
└── TEAM_WORKFLOW.md             # Operational guide · git workflow · role responsibilities
```

---

## 🌐 API Reference

All endpoints versioned at `/api/v1/`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login/` | Public | Returns JWT access + refresh tokens |
| `POST` | `/api/v1/auth/register/` | Public | Creates `USER_ACCOUNT` |
| `POST` | `/api/v1/auth/refresh/` | Public | Returns new access token |
| `POST` | `/api/v1/auth/logout/` | Protected | Blacklists refresh token |
| `GET/POST` | `/api/v1/patients/` | Auth | List or register patients |
| `GET/PATCH` | `/api/v1/patients/{id}/` | Patient · Admin | Profile view and update |
| `GET` | `/api/v1/patients/{id}/records/` | Doctor · Patient | Full medical history |
| `GET` | `/api/v1/timeslots/?date=YYYY-MM-DD&available=true` | Auth | Available slots for a date |
| `GET/POST` | `/api/v1/appointments/` | Auth | List or book appointments |
| `PATCH` | `/api/v1/appointments/{id}/cancel/` | Patient · Admin | Cancel appointment |
| `POST` | `/api/v1/queue/check-in/` | Patient | Check in via QR token |
| `PATCH` | `/api/v1/queue/{id}/status/` | Doctor · Admin | `WAITING → IN_PROGRESS → COMPLETED` |
| `GET` | `/api/v1/admin/reports/daily/` | Admin | Appointments per day — raw SQL |
| `GET` | `/api/v1/admin/reports/wait-times/` | Admin | Average wait time per doctor — raw SQL |
| `GET` | `/api/v1/admin/audit-log/` | Admin | Full audit trail |
| `GET` | `/api/v1/notifications/` | Auth | Notification history |

**Standard error shape — every endpoint:**
```json
{ "error": "Slot is no longer available", "code": "SLOT_UNAVAILABLE", "status": 409 }
```

---

## 🧪 Running Tests

```bash
cd backend

pytest                          # full suite
pytest apps/auth_module/        # single module
pytest -v --tb=short            # verbose with traceback
```

`conftest.py` provides shared fixtures across all modules. The CI pipeline runs the full suite on every PR to `dev`. A failing test blocks the merge — no exceptions.

---

## 🚢 Deployment

Deployed on **Render.com** as three linked services — PostgreSQL managed database, Django backend (Gunicorn), and React static site. All managed and deployed by S1.

**Live URL:** `https://ubuntu-campus-clinic.onrender.com` *(updated by S1 once deployed)*

---

## 👥 Team

| Role | Code | Tables Owned | Key Deliverables |
|---|---|---|---|
| **DB Lead + DevOps + QA** | S1 | ALL tables (migration owner) · `NOTIFICATION` | All 12 models · migrations · seed_db · CI · Render |
| **Backend Lead — Auth** | B1 | `USER_ACCOUNT` · `DEPARTMENT` · `STAFF` · `DOCTOR` | JWT endpoints · permission classes · Django admin |
| **Backend — Patients & Timeslots** | B2 | `PATIENT` · `PATIENT_CONTACT` · `MEDICAL_RECORD` · `TIMESLOT` | Patient CRUD · timeslot availability endpoints |
| **Backend — Bookings & Queue** | B3 | `APPOINTMENT` · `QUEUE_ENTRY` · `NOTIFICATION` (logic) | Booking · QR generation · queue check-in · email |
| **Backend — Admin & Reporting** | B4 | `AUDIT_LOG` | Raw SQL reports · audit middleware · pytest suite |
| **Frontend Lead — Auth & Layout** | F1 | — | App shell · AuthContext · shared components · routing |
| **Frontend — Patient & Medical** | F2 | — | Patient profile · medical history · appointment list |
| **Frontend — Doctor & Booking** | F3 | — | Doctor dashboard · Big Calendar · booking form · queue board |
| **Frontend — Admin & Notifications** | F4 | — | Reports dashboard · audit log · notification panel |

---

## 📖 Documentation

| Document | What It Covers |
|---|---|
| [docs/SYSTEM_DESIGN.md](./docs/SYSTEM_DESIGN.md) | Full architecture · schema · API contracts · security · design decisions |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Engineering standards · branch naming · commit format · PR process · The Laws |
| [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md) | Day-to-day git workflow · role responsibilities · sprint timeline · recovery steps |

---

## 📚 Resources

| Resource | Link |
|---|---|
| Django Documentation | [docs.djangoproject.com](https://docs.djangoproject.com/) |
| Django REST Framework | [django-rest-framework.org](https://www.django-rest-framework.org/) |
| SimpleJWT | [django-rest-framework-simplejwt.readthedocs.io](https://django-rest-framework-simplejwt.readthedocs.io/) |
| React Documentation | [react.dev](https://react.dev/) |
| PostgreSQL Documentation | [postgresql.org/docs](https://www.postgresql.org/docs/) |
| pytest-django | [pytest-django.readthedocs.io](https://pytest-django.readthedocs.io/) |
| Render.com Docs | [render.com/docs](https://render.com/docs) |

---

<div align="center">

*Ubuntu Campus Clinic — Appointment System · Group 19 · CMPG 311 · DBMS Module*

*Built database-first. Designed to scale. Engineered as a team.*

</div>
