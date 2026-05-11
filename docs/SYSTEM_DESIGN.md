# Ubuntu Campus Clinic — Appointment System.
## Complete System Design Blueprint

> **Group 19 · CMPG 311 · DBMS Module · Phase 3**
> This document is the single source of truth for the system architecture, database design, API contracts, security model, and implementation sequence. It is approved and finalized before any implementation begins. All architectural decisions reference this document.

---

## Table of Contents

1. [Document Identity](#1-document-identity)
2. [System Context](#2-system-context)
3. [Non-Functional Requirements](#3-non-functional-requirements)
4. [Design for Extension](#4-design-for-extension)
5. [Architecture Overview](#5-architecture-overview)
6. [System File Structure](#6-system-file-structure)
7. [Database Design](#7-database-design)
8. [Transaction Management & Concurrency](#8-transaction-management--concurrency)
9. [Appointment Booking Sequence](#9-appointment-booking-sequence)
10. [API Design & Contracts](#10-api-design--contracts)
11. [Security Architecture](#11-security-architecture)
12. [Edge Cases & Failure Handling](#12-edge-cases--failure-handling)
13. [Module Ownership & The Laws](#13-module-ownership--the-laws)
14. [Testing Strategy](#14-testing-strategy)
15. [Deployment Architecture](#15-deployment-architecture)
16. [Design Decisions Log](#16-design-decisions-log)
17. [Design Completeness Checklist](#17-design-completeness-checklist)

---

## 1. Document Identity

| Field | Detail |
|---|---|
| **System Name** | Ubuntu Campus Clinic — Appointment System |
| **Project** | CMPG 311 · DBMS Module · Phase 3 |
| **Group** | Group 19 |
| **Sprint** | 4 May – 18 May 2025 |
| **Primary Deliverable** | PostgreSQL database — schema, migrations, integrity, raw SQL |
| **Secondary Deliverable** | Django REST API + React 18 frontend demonstrating the database end-to-end |
| **Document Purpose** | Complete system design blueprint — approved and finalized before any implementation begins |
| **DB Lead / Architect** | S1 — owns all migrations, seed data, CI pipeline, and deployment |

---

## 2. System Context

### What the System Is

A web-based appointment management platform replacing the manual paper-based scheduling system at Ubuntu Campus Clinic. The system manages the complete patient lifecycle — from registration through booking, queue management, consultation, medical record creation, and automated notification — in a single centralized digital system.

### The Problem It Solves

| Problem | How the System Solves It |
|---|---|
| Appointment delays of several days | 24/7 online booking with same-day slot allocation |
| Limited 8AM–4PM operating hours | Web portal accessible at any time from any browser |
| Manual paper-based scheduling errors | Validated digital booking with database-enforced constraints |
| Long in-clinic waiting times | Real-time queue tracking with room assignment |
| Lost or inaccurate paper records | Centralized PostgreSQL medical history |
| No visibility into clinic performance | Admin dashboard with raw SQL reporting |
| No audit trail for medical data | `AUDIT_LOG` table capturing every sensitive action |

### System Actors

| Actor | Role in the System |
|---|---|
| **Patient (Student)** | Registers, books appointments, checks in via QR, views own medical history and notifications |
| **Doctor** | Views assigned appointments, manages timeslot availability, records diagnoses and prescriptions |
| **Nurse / Staff** | Manages queue, updates consultation status, captures vitals |
| **Admin** | Manages departments and staff, views reports, monitors audit logs |
| **System (Automated)** | Generates QR tokens, sends notifications, logs all sensitive actions to `AUDIT_LOG` |

### System Boundaries — What the System Does NOT Do

- No integration with external hospitals or national health systems
- No AI-based diagnosis or automated treatment recommendations
- No billing, medical aid claims, or payment processing
- No emergency dispatch or ambulance services
- No dedicated mobile application — browser-based only, responsive on mobile
- No management of physical medical equipment

---

## 3. Non-Functional Requirements

These define how well the system must perform. The scalability requirement is deliberately framed as a starting point with a documented growth path — not a hard ceiling. Every architectural decision in this document traces back to at least one NFR.

| Category | Current Requirement | Scalability Path |
|---|---|---|
| **Performance** | API responses under 2 seconds for standard queries | Indexed FK columns now · query optimisation and caching layer when bottlenecks appear |
| **Availability** | 99% uptime during demo and examination period | Render auto-restart now · multi-instance load balancing when uptime demands increase |
| **Scalability** | 50–100 concurrent users at Ubuntu Campus Clinic | Stateless JWT enables horizontal scaling with zero code changes · PostgreSQL supports partitioning and read replicas when data volume demands it |
| **Security** | JWT auth · hashed passwords · RBAC · HTTPS | Rate limiting and token rotation ready to enable in Django settings — no code changes required |
| **Maintainability** | One Django app per domain — modules fully isolated | New modules added to `INSTALLED_APPS` without touching existing code |
| **Reliability** | PostgreSQL ACID transactions on all writes | Row-level locking and DB constraints enforce integrity at any scale |
| **Usability** | Mobile-responsive browser interface | API-first design means a native mobile app consumes the same API without any backend changes |
| **Auditability** | All sensitive actions logged to `AUDIT_LOG` | Append-only log table · supports export to external SIEM tools when compliance demands grow |
| **Extensibility** | API versioned at `/api/v1/` from day one | New API versions introduced without breaking existing clients |
| **Recoverability** | Automated backups · `seed_db` command · version-controlled migrations | Full schema and data restorable from version control alone on any fresh PostgreSQL instance |

---

## 4. Design for Extension

### The Principle

Building software that works today is the minimum requirement. Building software that can grow, adapt, and extend tomorrow without requiring a full rewrite is the mark of mature engineering.

Ubuntu Campus Clinic is designed around one core principle:

> **The system is open for extension and closed for modification.**

Adding a new feature, a new role, a new notification channel, or a new clinic branch should not require editing existing working code. It should require only adding new code alongside it.

This is not theoretical. It is enforced by every architectural decision in this document.

### Why This Matters for Ubuntu Campus Clinic

The system starts as a single-clinic solution for Ubuntu Campus Clinic. But the same problem — manual paper-based clinic scheduling — exists at dozens of campus clinics across universities. The decisions made now determine whether this system can serve one clinic or fifty without a rewrite.

A system that is not designed for extension forces a choice when growth arrives: rewrite everything, or keep layering hacks until the system collapses under its own complexity.

### The Three Extension Dimensions

**Dimension 1 — Scale**

The system handles more users, more concurrent requests, and more data without changing application code.

- Stateless JWT means any number of Django instances can run behind a load balancer — no shared session state to coordinate
- PostgreSQL supports connection pooling, read replicas for reporting queries, and date-based table partitioning for high-volume tables like `APPOINTMENT` and `AUDIT_LOG`
- React frontend is a static build — it can be served from a CDN and scales independently of the backend completely

**Dimension 2 — Feature Extension**

New capabilities are added as new modules, not as modifications to existing ones.

- A Pharmacy module is a new Django app added to `INSTALLED_APPS` — does not touch Appointment or Patient
- A Lab Results module is new tables and new endpoints — existing schema is unchanged
- A new role (`PHARMACIST`) is a new permission class in `auth_module` — no other module changes
- A new notification channel (SMS, WhatsApp, push) is a new method in notifications — `NOTIFICATION.channel` already stores any channel value

**Dimension 3 — Infrastructure Evolution**

Any layer can be replaced without cascading rewrites through the others.

- PostgreSQL replaced — only Django ORM queries change. React never knows.
- Django replaced — only React service files change. Database never knows.
- React replaced by mobile app — the `/api/v1/` contract remains the same
- Render.com replaced — environment variables and Gunicorn config are the only changes

### Where This Principle Is Applied Across This Document

| Section | How Design for Extension Is Applied |
|---|---|
| Architecture | Four-layer adapter pattern — each layer independently replaceable |
| Database Design | `NOTIFICATION.channel` supports new channels without schema change · `DEPARTMENT` supports multi-branch expansion |
| API Design | All endpoints versioned at `/api/v1/` — breaking changes go to `/api/v2/` |
| Security | Rate limiting and token rotation configurable in settings — zero code changes to enable |
| Module Ownership | One app per domain — new modules extend without modifying existing apps |
| Deployment | Environment variables abstract all infrastructure config — platform-agnostic |

---

## 5. Architecture Overview

### The Four-Layer Application Architecture

```
╔══════════════════════════════════════════════════════════════════╗
║                    EXTERNAL SERVICES                             ║
║                                                                  ║
║   GitHub               — version control + CI trigger           ║
║   Render.com           — hosts backend, frontend, database      ║
║   Email Provider SMTP  — notification delivery                  ║
╚══════════════════════════════════════════════════════════════════╝
         │ hosts              │ deploys            │ delivers
         ▼                    ▼                    ▼
╔══════════════════════════════════════════════════════════════════╗
║                    INTERNAL SERVICES                             ║
║                                                                  ║
║   GitHub Actions CI    — runs pytest on every PR to dev         ║
║   Gunicorn             — WSGI server, serves Django in prod      ║
║   Django Email Backend — sends appointment reminders via SMTP   ║
║   Render Auto-Backup   — daily PostgreSQL snapshots             ║
╚══════════════════════════════════════════════════════════════════╝
         │ serves             │ validates           │ protects
         ▼                    ▼                     ▼
╔══════════════════════════════════════════════════════════════════╗
║         LAYER 1 — PRESENTATION LAYER                            ║
║                                                                  ║
║   Responsibility:                                                ║
║   Render UI · manage user interaction · display data            ║
║   Never contains business logic · never calls DB directly       ║
║                                                                  ║
║   Rule: Components never call axios directly —                   ║
║         all HTTP calls go through src/services/ only            ║
║                                                                  ║
║   Libraries:                                                     ║
║   React 18          — component rendering and state             ║
║   React Router v6   — client-side navigation                    ║
║   Tailwind CSS      — responsive utility-first styling          ║
║   axios             — HTTP client with JWT interceptor          ║
║   React Context API — auth state storage (JWT + role)           ║
╚══════════════════════════════════════════════════════════════════╝
         │
         │  HTTP / JSON
         │  Authorization: Bearer <token>
         │  All requests to /api/v1/
         ▼
╔══════════════════════════════════════════════════════════════════╗
║         LAYER 2 — APPLICATION / BUSINESS LAYER                  ║
║                                                                  ║
║   Responsibility:                                                ║
║   Enforce business rules · validate requests · authorize users  ║
║   Orchestrate workflow · manage transactions                    ║
║   Decides what is ALLOWED and what HAPPENS                      ║
║   Does not know HOW data is stored                              ║
║                                                                  ║
║   Libraries:                                                     ║
║   Django REST Framework — API views, serializers, routers       ║
║   SimpleJWT             — JWT generation and validation         ║
║   django-cors-headers   — allows React origin in dev and prod   ║
║   python-dotenv         — loads .env into Django settings       ║
║   qrcode                — appointment QR token generation       ║
╚══════════════════════════════════════════════════════════════════╝
         │
         │  ORM method calls
         │  QuerySets · select_for_update() · objects.create()
         ▼
╔══════════════════════════════════════════════════════════════════╗
║         LAYER 3 — DATA ACCESS LAYER                             ║
║                                                                  ║
║   Responsibility:                                                ║
║   Translate business intent into database queries               ║
║   Handle all persistence operations                             ║
║   Decides HOW data is fetched and stored                        ║
║   Does not know what business rule triggered the query          ║
║                                                                  ║
║   Rule: Raw SQL permitted ONLY in admin_reporting/queries.py    ║
║         All other data access goes through Django ORM           ║
║                                                                  ║
║   Libraries:                                                     ║
║   Django ORM    — QuerySets, model managers, migrations         ║
║   psycopg2      — low-level PostgreSQL driver                   ║
║   Raw SQL       — reporting queries only, isolated in one file  ║
╚══════════════════════════════════════════════════════════════════╝
         │
         │  SQL — generated by ORM or written explicitly
         │  psycopg2 connection
         ▼
╔══════════════════════════════════════════════════════════════════╗
║         LAYER 4 — DATABASE LAYER                                ║
║                                                                  ║
║   Responsibility:                                                ║
║   Store all data · enforce structural integrity                 ║
║   Guarantee ACID compliance on every write                      ║
║   The final enforcer — constraints cannot be bypassed           ║
║                                                                  ║
║   PostgreSQL 15 capabilities used:                              ║
║   FK constraints      — referential integrity at DB level       ║
║   UNIQUE constraints  — double-booking prevention               ║
║   CHECK constraints   — orphan record prevention                ║
║   Row-level locking   — SELECT FOR UPDATE on slot booking       ║
║   Indexes             — all FKs and query-heavy columns         ║
║   ACID transactions   — atomicity on every booking operation    ║
║                                                                  ║
║              PRIMARY EXAM DELIVERABLE                           ║
╚══════════════════════════════════════════════════════════════════╝
```

### Layer Responsibilities

| Layer | Single Responsibility | What It Must Never Do |
|---|---|---|
| Presentation | Render UI and manage user interaction | Contain business logic · call database directly |
| Application | Enforce rules · validate · authorize · orchestrate | Return raw model data without serialization |
| Data Access | Translate intent into queries · handle persistence | Make business decisions · enforce rules |
| Database | Store data · enforce structural integrity | Trust application to enforce what the DB should own |

### The Adapter Principle — Layer Independence

Each layer communicates only with the layer directly below it through a defined contract. No layer skips a layer. No layer knows how the layer below it is internally implemented.

```
React components     →  call service functions only
Service functions    →  call /api/v1/ endpoints only
Django views         →  call serializers and service layer only
Service layer        →  calls ORM methods only
Django ORM           →  generates SQL for PostgreSQL
PostgreSQL           →  enforces constraints and stores data
```

**What this enables:**

- Replace PostgreSQL → only ORM queries change. React never knows.
- Replace Django → only React service files change. Database never knows.
- Replace React with mobile app → API contract is unchanged. Backend never knows.
- Replace Render.com → only environment variables and Gunicorn config change.

---

## 6. System File Structure

Every folder has a single defined purpose and a single module owner. No folder crosses module boundaries.

```
ubuntu-campus-clinic/
│
├── .github/
│   └── workflows/           # CI pipeline — pytest on every PR to dev
│
├── backend/
│   ├── config/              # Django settings, root URL router, WSGI entry point
│   │
│   ├── apps/
│   │   ├── auth_module/     # Module 1 — USER_ACCOUNT, JWT, permission classes
│   │   ├── patients/        # Module 2 — PATIENT, PATIENT_CONTACT, MEDICAL_RECORD
│   │   ├── doctors/         # Module 3 — STAFF, DOCTOR, TIMESLOT, DEPARTMENT
│   │   ├── appointments/    # Module 4 — APPOINTMENT, booking logic, QR generation
│   │   ├── queue/           # Module 5 — QUEUE_ENTRY, check-in, status transitions
│   │   ├── admin_reporting/ # Module 6 — AUDIT_LOG, raw SQL queries, Django admin
│   │   └── notifications/   # Module 7 — NOTIFICATION, email backend, seed_db
│   │
│   └── [config files]
│       ├── requirements.txt # All Python dependencies pinned to exact versions
│       ├── manage.py        # Django management entry point
│       ├── pytest.ini       # pytest config — test discovery, DB settings
│       ├── conftest.py      # Shared fixtures — all modules use these
│       └── .env.example     # All variable names, no real values
│
├── frontend/
│   └── src/
│       ├── routes/          # Route definitions + ProtectedRoute wrapper
│       ├── context/         # AuthContext — JWT state, role, login, logout
│       ├── services/        # ALL axios calls — one file per backend app
│       ├── hooks/           # Custom React hooks — data fetching abstractions
│       ├── layouts/         # Page shells — main, admin, auth layouts
│       ├── pages/           # Route-level views — organised by actor role
│       │   ├── auth/        # Login · Register
│       │   ├── patient/     # Dashboard · Profile · Book · Medical History
│       │   ├── doctor/      # Dashboard · Schedule · Queue Board
│       │   └── admin/       # Dashboard · Reports · Audit Log
│       ├── components/      # Reusable UI — no API calls, props and events only
│       └── utils/           # Date formatters · role guards · error handlers
│
├── docs/
│   └── SYSTEM_DESIGN.md     # This document
│
├── README.md                # Setup, env vars, API overview, team roles
└── CONTRIBUTING.md          # Branching, commits, PR process, The Laws
```

---

## 7. Database Design

### The 12 Tables — Grouped by Domain

#### Identity Domain

| Table | Purpose | Key Constraints |
|---|---|---|
| `PATIENT` | Core patient entity — student profile and consent | `UNIQUE(student_number)` · `UNIQUE(email)` |
| `PATIENT_CONTACT` | Multi-value emergency contact numbers | `FK → PATIENT` ON DELETE CASCADE |
| `USER_ACCOUNT` | Login credentials, role, account status | `CHECK(patient IS NOT NULL OR staff IS NOT NULL)` · `UNIQUE(username)` |

#### Staff Domain

| Table | Purpose | Key Constraints |
|---|---|---|
| `DEPARTMENT` | Clinic org structure, department head | `UNIQUE(department_name)` · `FK → STAFF(head)` nullable |
| `STAFF` | All clinic employees, working hours, department | `UNIQUE(email)` · `FK → DEPARTMENT` nullable |
| `DOCTOR` | Subtype of STAFF — doctor-specific fields only | `PK = FK → STAFF` · `UNIQUE(license_number)` |

#### Scheduling Domain

| Table | Purpose | Key Constraints |
|---|---|---|
| `TIMESLOT` | Available date and time blocks | `is_available DEFAULT TRUE` |
| `APPOINTMENT` | Core transactional entity — links patient, staff, slot | `UNIQUE(slot_id)` · `FK → PATIENT + STAFF + TIMESLOT` with `ON DELETE PROTECT` |

#### Operations Domain

| Table | Purpose | Key Constraints |
|---|---|---|
| `QUEUE_ENTRY` | Check-in time, consultation tracking, room assignment | `UNIQUE(appointment_id)` |
| `MEDICAL_RECORD` | Diagnosis, prescription, treatment notes | `FK → APPOINTMENT + PATIENT` |

#### System Domain

| Table | Purpose | Key Constraints |
|---|---|---|
| `NOTIFICATION` | Email and notification delivery log | `CHECK(patient IS NOT NULL OR staff IS NOT NULL)` |
| `AUDIT_LOG` | Complete action history for POPIA compliance | `FK → USER_ACCOUNT` · auto-timestamp on every row |

---

### FK Dependency Graph — Migration Order

```
LEVEL 1 — No FK dependencies — migrate first
├── PATIENT
├── TIMESLOT
└── DEPARTMENT        (head_staff FK is nullable — deferred until STAFF exists)

LEVEL 2 — Depends on Level 1
├── PATIENT_CONTACT   →  PATIENT
└── STAFF             →  DEPARTMENT

LEVEL 3 — Depends on Level 2
├── DOCTOR            →  STAFF  (PK is also FK — subtype pattern)
└── USER_ACCOUNT      →  PATIENT (optional) + STAFF (optional)

LEVEL 4 — Depends on Level 3
├── APPOINTMENT       →  PATIENT + STAFF + TIMESLOT
└── AUDIT_LOG         →  USER_ACCOUNT

LEVEL 5 — Migrate last
├── QUEUE_ENTRY       →  APPOINTMENT
├── MEDICAL_RECORD    →  APPOINTMENT + PATIENT
└── NOTIFICATION      →  APPOINTMENT + PATIENT (optional) + STAFF (optional)

POST-MIGRATION
└── DEPARTMENT.head_staff_id  →  STAFF  (ALTER after STAFF table exists)
```

---

### Status Lifecycles

These are the defined status transitions for the two tables that carry operational state. Every transition is intentional — no status can be skipped.

#### APPOINTMENT Lifecycle

```
         SCHEDULED
             │
             │  Admin or doctor confirms
             ▼
         CONFIRMED ──────────────────────────────┐
             │                                   │
             │  Patient checks in                │  Patient does not arrive
             ▼                                   ▼
    (triggers QUEUE_ENTRY)                   NO_SHOW
             │
             │  Consultation completed
             ▼
         COMPLETED

At any point before check-in:
SCHEDULED or CONFIRMED  →  CANCELLED  (by patient or admin)
```

#### QUEUE_ENTRY Lifecycle

```
         WAITING
         (created when patient checks in)
             │
             │  Doctor calls patient into room
             ▼
         IN_PROGRESS
             │
             │  Consultation ends
             ▼
         COMPLETED

Alternative exit:
WAITING  →  LEFT_WITHOUT_SEEN  (patient leaves before being called)
```

#### The Connection Point

```
CONFIRMED APPOINTMENT
         +
Patient presents QR code at clinic
         │
         ▼
QUEUE_ENTRY created  →  status = WAITING
APPOINTMENT status updated to reflect check-in
```

---

### Critical Constraints — Data Integrity at Database Level

| Constraint | Table | Column | What It Prevents |
|---|---|---|---|
| `UNIQUE` | `APPOINTMENT` | `slot_id` | Double-booking — one slot per appointment, enforced at DB level |
| `UNIQUE` | `QUEUE_ENTRY` | `appointment_id` | Two check-in records for the same appointment |
| `UNIQUE` | `PATIENT` | `student_number` | Duplicate patient registrations |
| `UNIQUE` | `PATIENT` | `email` | Duplicate login identity for patients |
| `UNIQUE` | `STAFF` | `email` | Duplicate staff accounts |
| `UNIQUE` | `DOCTOR` | `license_number` | Fraudulent or duplicate doctor registration |
| `UNIQUE` | `USER_ACCOUNT` | `username` | Duplicate portal login accounts |
| `CHECK` | `USER_ACCOUNT` | `patient OR staff` | Orphan accounts with no identifiable owner |
| `CHECK` | `NOTIFICATION` | `patient OR staff` | Notifications with no deliverable recipient |
| `ON DELETE PROTECT` | `APPOINTMENT` FKs | `patient_id · staff_id · slot_id` | Deleting a patient or doctor who has existing appointments |
| `DEFAULT TRUE` | `TIMESLOT` | `is_available` | Slots not automatically released after cancellation |

---

### Index Strategy

Indexes ensure query performance is maintained as data volume grows. Every index is justified by a real query pattern in the system.

| Index Type | Table | Column(s) | Query It Supports |
|---|---|---|---|
| Primary Key (auto) | All tables | `*_id` | All PK lookups — auto-created by Django |
| FK Index | `APPOINTMENT` | `patient_id` | Patient appointment history |
| FK Index | `APPOINTMENT` | `staff_id` | Doctor's schedule queries |
| Unique Index | `APPOINTMENT` | `slot_id` | Double-booking constraint — enforced on every booking |
| Date Index | `TIMESLOT` | `slot_date` | Availability queries by date |
| **Composite Index** | `TIMESLOT` | `slot_date, is_available` | Available slots on a given date — most frequent query in the system |
| Timestamp Index | `AUDIT_LOG` | `log_timestamp` | Admin date-range filtering |
| FK Index | `AUDIT_LOG` | `user_id` | User-specific activity lookup |
| FK Index | `MEDICAL_RECORD` | `patient_id` | Patient full medical history |
| FK Index | `NOTIFICATION` | `appointment_id` | Notification lookup per appointment |
| FK Index | `QUEUE_ENTRY` | `appointment_id` | Queue entry lookup on check-in |

> The composite index on `TIMESLOT(slot_date, is_available)` is the most strategically important. The availability query runs every time any user opens the booking form. Without this index, PostgreSQL performs a full table scan on every request.

---

### Soft Deletes — Future Consideration

The current system uses hard deletes throughout. For a production medical system, future versions should replace hard deletes on `PATIENT`, `APPOINTMENT`, and `MEDICAL_RECORD` with a soft-delete pattern — adding an `is_deleted BOOLEAN DEFAULT FALSE` flag and filtering it from all standard queries. This preserves data for POPIA compliance and legal retention requirements. A hard-deleted patient record also breaks the `AUDIT_LOG` foreign key, creating an incomplete and potentially non-compliant audit history. The current schema supports this addition without structural rework.

---

### Normalization Summary

**1NF** — All attributes are atomic. Address is decomposed into street, city, and postal code. `PATIENT_CONTACT` handles multi-value phone numbers as individual rows. No repeating groups exist anywhere in the schema.

**2NF** — Every table uses a single-column surrogate auto-increment primary key. No composite keys exist, therefore no partial dependencies are possible by design.

**3NF** — No transitive dependencies. The `DOCTOR` table isolates `license_number` and `specialisation` from `STAFF`. These attributes depend on holding the doctor role — not on being a staff member. Without this separation, every non-doctor staff row would carry NULL columns for doctor-specific fields — a 3NF violation and a long-term maintainability problem.

---

### Future-Proofing in the Schema

- `NOTIFICATION.channel` is `VARCHAR(10)` and accepts any string value — adding SMS, WhatsApp, or push notifications requires no schema change
- `APPOINTMENT` and `AUDIT_LOG` are the two highest-volume tables — both are natural candidates for PostgreSQL date-based partitioning by `created_at` when row counts demand it
- `DEPARTMENT` is clinic-scoped today — a `branch_id` FK can be added to support multi-clinic expansion without touching any other table

---

## 8. Transaction Management & Concurrency

### The Double-Booking Problem

When two patients attempt to book the same timeslot simultaneously, a naive application-level check fails:

```
Patient A reads TIMESLOT 42  →  is_available = True  ✓
Patient B reads TIMESLOT 42  →  is_available = True  ✓
Patient A inserts APPOINTMENT  →  success
Patient B inserts APPOINTMENT  →  also succeeds  ← DOUBLE BOOKING
```

Both reads happened before either write. The application check passed for both. This is a classic database race condition that no amount of application-level logic alone can solve reliably.

### The Two-Layer Defence

**Layer 1 — Row-Level Lock — prevents the race condition**

```sql
BEGIN TRANSACTION

  SELECT * FROM TIMESLOT
  WHERE slot_id = 42
  FOR UPDATE              -- row is locked for this transaction

  IF is_available = True:
    INSERT INTO APPOINTMENT (...)
    UPDATE TIMESLOT SET is_available = False
    COMMIT                -- lock released · changes permanent

  ELSE:
    ROLLBACK              -- lock released · nothing written
    return 409 SLOT_UNAVAILABLE

END TRANSACTION
```

Patient B reaches the `SELECT FOR UPDATE` and waits at the lock until Patient A's transaction commits or rolls back. By the time Patient B reads the row, `is_available` is already `False`. It receives a clean, correct error.

**Layer 2 — UNIQUE Constraint — the final enforcer**

Even if the row lock fails due to a bug, a bypass, or a direct database insert — the `UNIQUE` constraint on `slot_id` in `APPOINTMENT` means the database unconditionally rejects the second insert. No application code path can bypass a database constraint.

### ACID Compliance

| Property | How Ubuntu Campus Clinic Implements It |
|---|---|
| **Atomicity** | The entire booking — lock, insert, update — succeeds completely or rolls back completely. No partial writes. |
| **Consistency** | All constraints (UNIQUE, CHECK, FK, NOT NULL) are enforced on every transaction. The database is never left in an invalid state. |
| **Isolation** | `SELECT FOR UPDATE` prevents concurrent transactions from reading stale data during a booking operation. |
| **Durability** | Once a booking commits, PostgreSQL guarantees it survives a server restart or crash. |

---

## 9. Appointment Booking Sequence

This sequence traces a single patient booking from the React UI through every layer to the database and back. It demonstrates all four layers operating as one complete system.

```
PATIENT clicks "Book Appointment"
         │
         ▼
PRESENTATION LAYER (React)
  appointmentService.book({ slot_id, reason_for_visit })
  axios POST /api/v1/appointments/
  Header: Authorization: Bearer <access_token>
         │
         │  HTTP POST · JSON payload
         ▼
APPLICATION LAYER (Django)
  JWT middleware validates token
  IsPatient permission class verifies role
  AppointmentSerializer validates payload:
    - slot_id exists and is a valid timeslot
    - appointment date is not in the past
    - patient_id matches the token owner
  book_appointment() service function called
         │
         │  ORM method call
         ▼
DATA ACCESS LAYER (Django ORM)
  BEGIN TRANSACTION
  SELECT * FROM TIMESLOT WHERE slot_id = ? FOR UPDATE
         │
         ▼
DATABASE LAYER (PostgreSQL)
  Row locked · timeslot record returned
         │
         ▼
DATA ACCESS LAYER (Django ORM)
  is_available = True  →  proceed
  INSERT INTO APPOINTMENT (patient_id, staff_id, slot_id, ...)
  UPDATE TIMESLOT SET is_available = False
  COMMIT
         │
         ▼
APPLICATION LAYER (Django)
  QR token generated · stored on APPOINTMENT record
  Post-save signal fires
  NOTIFICATION record created (scheduled_for = appointment_time - 24h)
  Django email backend queued
         │
         │  HTTP 201 · JSON response
         ▼
PRESENTATION LAYER (React)
  Response: { appointment_id, qr_code_token, scheduled_for }
  QR code rendered and displayed to patient
  Appointment added to patient dashboard list

─────────────────────────────────────────────────────────────────
FAILURE PATH — slot already taken
─────────────────────────────────────────────────────────────────

DATA ACCESS LAYER
  SELECT FOR UPDATE  →  is_available = False
  ROLLBACK transaction

APPLICATION LAYER
  Returns: { "error": "Slot is no longer available",
             "code": "SLOT_UNAVAILABLE", "status": 409 }

PRESENTATION LAYER
  Error message displayed to patient
  Booking form returns to slot selection
```

---

## 10. API Design & Contracts

### Design Principles

- All endpoints versioned at `/api/v1/` — breaking changes go to `/api/v2/` without affecting existing clients
- All responses are JSON
- All protected endpoints require `Authorization: Bearer <access_token>` header
- All error responses follow one standard shape — no endpoint invents its own format
- All list endpoints support `?page=` and `?limit=` query parameters
- All incoming payloads validated at serializer level before any ORM interaction

### Authentication Flow

```
STEP 1 — Login
POST /api/v1/auth/login/
Body:      { "username": "43224105", "password": "..." }
Response:  { "access": "<jwt>", "refresh": "<jwt>", "role": "PATIENT" }

STEP 2 — Authenticated Request
Header:    Authorization: Bearer <access_token>
           Payload contains: user_id · role · patient_id or staff_id · expiry

STEP 3 — Token Refresh  (access expires after 1 hour)
POST /api/v1/auth/refresh/
Body:      { "refresh": "<refresh_token>" }
Response:  { "access": "<new_access_token>" }

STEP 4 — Logout
POST /api/v1/auth/logout/
Body:      { "refresh": "<refresh_token>" }
Action:    Refresh token blacklisted — cannot be used again
```

> **JWT Security Note:** The JWT payload carries the user's role to reduce permission query overhead on standard requests. For sensitive operations — accessing medical records, viewing audit logs, cancelling another user's appointment — Django re-verifies current role and `account_status` against `USER_ACCOUNT` in the database. A token may still be valid even if the account was locked after it was issued.

### Complete Endpoint Reference

#### Module 1 — Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login/` | Public | Returns JWT pair and role |
| `POST` | `/api/v1/auth/register/` | Public | Creates `USER_ACCOUNT` |
| `POST` | `/api/v1/auth/refresh/` | Public | Returns new access token |
| `POST` | `/api/v1/auth/logout/` | Protected | Blacklists refresh token |

#### Module 2 — Patients

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/patients/` | Admin | List all patients |
| `POST` | `/api/v1/patients/` | Public | Register new patient |
| `GET` | `/api/v1/patients/{id}/` | Patient · Admin | Patient profile |
| `PATCH` | `/api/v1/patients/{id}/` | Patient | Update own profile only |
| `GET` | `/api/v1/patients/{id}/records/` | Doctor · Patient | Full medical history |

#### Module 3 — Doctors & Scheduling

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/staff/` | Admin | List all staff |
| `GET` | `/api/v1/staff/{id}/` | Auth | Staff profile |
| `GET` | `/api/v1/timeslots/` | Auth | All timeslots |
| `GET` | `/api/v1/timeslots/?date=YYYY-MM-DD&available=true` | Auth | Available slots for a date |
| `POST` | `/api/v1/timeslots/` | Admin | Create new timeslot |
| `PATCH` | `/api/v1/timeslots/{id}/` | Admin | Update slot availability |

#### Module 4 — Appointments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/appointments/` | Auth | Patient sees own · Doctor sees assigned |
| `POST` | `/api/v1/appointments/` | Patient | Book — transaction lock + QR generation |
| `GET` | `/api/v1/appointments/{id}/` | Auth | Detail view with QR token |
| `PATCH` | `/api/v1/appointments/{id}/cancel/` | Patient · Admin | Cancel appointment |
| `PATCH` | `/api/v1/appointments/{id}/status/` | Doctor · Admin | Update appointment status |

#### Module 5 — Queue

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/queue/` | Doctor · Admin | Current live queue |
| `POST` | `/api/v1/queue/check-in/` | Patient | Check in via QR token |
| `PATCH` | `/api/v1/queue/{id}/status/` | Doctor · Admin | `WAITING → IN_PROGRESS → COMPLETED` |
| `GET` | `/api/v1/queue/today/` | Admin | Full day queue overview |

#### Module 6 — Admin & Reporting

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/reports/daily/` | Admin | Appointments per day — raw SQL |
| `GET` | `/api/v1/admin/reports/wait-times/` | Admin | Average wait time per doctor — raw SQL |
| `GET` | `/api/v1/admin/reports/capacity/` | Admin | Slot utilisation — raw SQL |
| `GET` | `/api/v1/admin/audit-log/` | Admin | Full audit trail with filters |
| `GET` | `/api/v1/departments/` | Auth | List departments |
| `POST` | `/api/v1/departments/` | Admin | Create department |

#### Module 7 — Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/notifications/` | Auth | User notification history |
| `PATCH` | `/api/v1/notifications/{id}/read/` | Auth | Mark notification as read |

### Standard Response Shapes

**Single object:**

```json
{
  "data": { "patient_id": 1, "first_name": "Thabo", "email": "..." },
  "message": "Patient retrieved successfully"
}
```

**List:**

```json
{
  "data": [...],
  "count": 42,
  "page": 1,
  "total_pages": 5
}
```

**Error — every endpoint, same shape:**

```json
{
  "error": "Slot is no longer available",
  "code": "SLOT_UNAVAILABLE",
  "status": 409
}
```

### API Validation Layer

All incoming payloads are validated at the serializer level before any ORM interaction. No raw data reaches the database without passing through this layer.

| Validation Rule | Example |
|---|---|
| Required fields | `student_number` · `email` · `date_of_birth` cannot be blank |
| Format validation | Email must be valid · student number must be 8–10 digits |
| Business rule validation | Appointment date cannot be in the past |
| Ownership validation | Patient can only update their own profile |
| Role-based restrictions | Patients cannot manually set appointment `priority` to URGENT |
| Unique pre-check | Friendly error before DB rejects a duplicate student number |
| QR token validation | Token must exist · belong to the correct patient · not be expired |

---

## 11. Security Architecture

### Role-Based Access Control

| Permission Class | Who It Covers | What They Can Access |
|---|---|---|
| `IsPatient` | Students with PATIENT role | Own profile · own appointments · own medical records · own notifications |
| `IsDoctor` | Staff with DOCTOR role | Assigned appointments · queue board · records for their own patients |
| `IsAdmin` | Staff with ADMIN role | Full access — all records · reports · audit log · department management |

Every view in every module declares its permission class explicitly. No view is left unprotected by accident.

### Audit Trail Design

Every sensitive database action writes a row to `AUDIT_LOG` automatically.

| Field | Value | Purpose |
|---|---|---|
| `user_id` | FK to `USER_ACCOUNT` | Who performed the action |
| `action` | `CREATE · READ · UPDATE · DELETE` | What was done |
| `table_affected` | Table name string | Where it happened |
| `record_affected_id` | PK of the affected row | Which specific record |
| `log_timestamp` | Auto-set to current timestamp | Exactly when |
| `ip_address` | Request IP address | Where the request originated |

This satisfies POPIA requirements — every access to patient data is traceable to a specific user, action, timestamp, and IP address.

### Password Security

Passwords are never stored in plain text. Django's `make_password()` applies PBKDF2-SHA256 with a unique random salt per user. Only the resulting hash is stored in `USER_ACCOUNT.password_hash`. The original password cannot be recovered from it.

### QR Code Security

| Property | Detail | Purpose |
|---|---|---|
| `qr_code_token` | UUID4 generated at booking time | Unique and unguessable — cannot be predicted or forged |
| `qr_code_expires` | Appointment time + 30 minutes | Token is time-bound — cannot be reused after the window |
| Validation on check-in | Token + expiry checked together | Both invalid and expired tokens rejected with `401` |

### Future Security Extensions

Ready to enable in Django settings with zero code changes when requirements increase:

- **Rate limiting** — `DEFAULT_THROTTLE_CLASSES` limits requests per IP per minute
- **Refresh token rotation** — `ROTATE_REFRESH_TOKENS = True` invalidates each refresh token on use
- **HTTPS enforcement** — `SECURE_SSL_REDIRECT = True` in production settings

---

## 12. Edge Cases & Failure Handling

### Concurrency & Booking Failures

| Scenario | Handling | Response Code |
|---|---|---|
| Two patients book same slot simultaneously | DB row lock prevents race · UNIQUE constraint is final enforcer | `409 SLOT_UNAVAILABLE` |
| Patient books a slot that just became unavailable | `is_available = False` detected inside transaction | `409 SLOT_UNAVAILABLE` |
| QR code presented after 30-minute expiry | `qr_code_expires` checked on check-in | `401 TOKEN_EXPIRED` |
| Invalid or forged QR token | Token not found in `APPOINTMENT` table | `401 INVALID_TOKEN` |
| Appointment booked for a past date | Serializer date validation rejects before ORM | `400 INVALID_DATE` |

### Authentication & Authorization Failures

| Scenario | Handling | Response Code |
|---|---|---|
| Expired access token | JWT middleware rejects · client uses refresh | `401 TOKEN_EXPIRED` |
| Revoked or blacklisted refresh token | SimpleJWT blacklist check on every refresh | `401 TOKEN_BLACKLISTED` |
| Patient accesses another patient's records | `IsPatient` checks ownership against `patient_id` in JWT | `403 FORBIDDEN` |
| Non-admin requests reports endpoint | `IsAdmin` rejects before view runs | `403 FORBIDDEN` |
| Request with no Authorization header | JWT middleware rejects before any view is reached | `401 UNAUTHORIZED` |
| Account locked after token was issued | Sensitive ops re-verify `account_status` in `USER_ACCOUNT` | `403 ACCOUNT_LOCKED` |

### Data Integrity Failures

| Scenario | Handling | Response Code |
|---|---|---|
| Delete patient with existing appointments | `ON DELETE PROTECT` raises `ProtectedError` · caught cleanly | `409 RECORD_IN_USE` |
| Delete slot with an existing booking | FK validation in view before delete | `409 SLOT_IN_USE` |
| Duplicate student number on registration | Serializer pre-check + DB constraint as final enforcer | `400 DUPLICATE_STUDENT_NUMBER` |
| Medical record without valid `appointment_id` | FK required — serializer validates appointment belongs to patient | `400 APPOINTMENT_REQUIRED` |
| Notification with no patient and no staff | CHECK constraint at DB level rejects the insert | `400 RECIPIENT_REQUIRED` |

### System & Infrastructure Failures

| Scenario | Handling | Outcome |
|---|---|---|
| Database connection lost | Django DB error caught in view · clean error returned | `503 SERVICE_UNAVAILABLE` |
| Email send fails | Exception caught in `notifications/email.py` · failure written to `NOTIFICATION.error_message` | Silent log · no HTTP error to user |
| Migration fails on deployment | GitHub Actions CI catches migration errors before Render deploy triggers | CI fails · deployment blocked |
| Render web service crashes | Render auto-restarts the service automatically | Automatic recovery |
| Corrupted or lost database | Restore from Render backup · re-run `seed_db` for demo data | Full recovery from version-controlled migrations |

---

## 13. Module Ownership & The Laws

### The Laws

These rules govern how every team member works on this system. They exist because a 9-person remote team working on a shared database is the highest-risk engineering environment for data corruption, migration conflicts, and integration failures.

| Law | Rule | Why It Exists |
|---|---|---|
| **I** | No direct push to `main` or `dev` — ever | PR process enforces code review on every single change |
| **II** | No migration file merged without S1 approval | One bad migration breaks `python manage.py migrate` for all 9 members simultaneously |
| **III** | No endpoint shipped without at least one test | Untested endpoints break Module 8 integration and CI |
| **IV** | No raw SQL outside `admin_reporting/queries.py` | Architecture consistency · ORM everywhere else prevents injection |
| **V** | No PR opened without completing the self-review checklist | The first reviewer is always yourself |
| **VI** | One concern per branch and per PR — never mix modules | Mixed concerns make review impossible and rollback destructive |
| **VII** | No cross-module change without an approved proposal | Prevents architecture drift and wasted implementation effort |

### Dependency Chain — Build Order

```
S1 (DB Lead) — Day 1 before anyone else writes code
  Creates GitHub repo · branch structure (main, dev)
  Scaffolds Django project · registers all 7 apps
  Writes ALL 12 models across all apps
  Runs migrations in dependency order
  Verifies full schema in psql
  Pushes to dev — everyone clones from here
                      │
                      ▼
       ┌──── GATE 1 ──────────────────────────────────┐
       │  Module 1 (Auth) — Day 1–2                   │
       │  JWT login · register · logout               │
       │  IsPatient · IsDoctor · IsAdmin classes      │
       │  MUST merge to dev before anyone starts      │
       │  building any protected API endpoint         │
       └──────────────────────────────────────────────┘
                      │
           ┌──────────┴───────────┐
           ▼                      ▼
    Module 2 (Patient)     Module 3 (Doctor)
    PATIENT · CONTACT      STAFF · DOCTOR
    MEDICAL_RECORD         TIMESLOT · DEPT
    Runs in parallel       Runs in parallel
           │                      │
           └──────────┬───────────┘
                      ▼
       ┌──── GATE 2 ──────────────────────────────────┐
       │  Module 4 (Appointment)                      │
       │  Booking · QR generation · cancellation      │
       │  Requires PATIENT FK + STAFF FK + SLOT FK    │
       │  MUST merge before Module 5 and 7 start      │
       └──────────────────────────────────────────────┘
                      │
         ┌────────────┼─────────────┐
         ▼            ▼             ▼
    Module 5       Module 7      Module 6
    Queue          Notifications  Admin Reports
    Check-in       Email + log    Raw SQL + Audit
         │            │             │
         └────────────┴─────────────┘
                      │
                      ▼
           Module 8 — Integration & Testing
           Connects all React pages to real API
           Writes full pytest suite · owns README
                      │
                      ▼
           S1 — Final Deployment
           Seeds all 12 tables
           Deploys to Render.com
           Verifies live URL for examiner
```

### Per-Module Specification

| Module | Tables Owned | Key Deliverables | Blocks |
|---|---|---|---|
| **S1 DB Lead** | ALL (migration owner) + `NOTIFICATION` | All 12 models · all migrations · `seed_db` · CI pipeline · Render deploy | Entire team on Day 1 |
| **Module 1 Auth** | `USER_ACCOUNT` | JWT endpoints · 3 permission classes | Gate 1 — all protected endpoints |
| **Module 2 Patient** | `PATIENT` · `PATIENT_CONTACT` · `MEDICAL_RECORD` | Patient CRUD · `/records/` endpoint | Module 4 · Module 6 |
| **Module 3 Doctor** | `STAFF` · `DOCTOR` · `TIMESLOT` · `DEPARTMENT` | Staff/timeslot endpoints · availability filter | Module 4 · Module 6 |
| **Module 4 Appointment** | `APPOINTMENT` | Booking with transaction lock · QR generation | Gate 2 — Module 5 · Module 7 |
| **Module 5 Queue** | `QUEUE_ENTRY` | Check-in · status transitions · room assignment | Module 8 |
| **Module 6 Admin** | `AUDIT_LOG` | Raw SQL reports · audit trail · Django admin config | Module 8 |
| **Module 7 Notifications** | `NOTIFICATION` | Email send · notification log | Module 8 |
| **Module 8 Integration** | None — connects all | React pages wired to real API · full pytest suite · README | Deployment |

---

## 14. Testing Strategy

### Test Types and Coverage

| Test Type | What Is Tested | Owner | Tool |
|---|---|---|---|
| **Unit — Serializers** | Field validation · required fields · format rules · role restrictions | Each module | pytest |
| **Unit — Models** | Constraint enforcement · FK relationships · default values · Meta table names | S1 + each module | pytest-django |
| **Integration — Booking** | Full booking flow — slot lock · UNIQUE constraint · QR generation · slot marked unavailable | Module 4 | pytest |
| **Integration — Queue** | `check-in → WAITING → IN_PROGRESS → COMPLETED` full status flow | Module 5 | pytest |
| **API — Auth** | Login returns JWT · refresh works · logout blacklists · wrong password rejected | Module 1 | DRF test client |
| **API — RBAC** | Patient blocked from admin routes · doctor blocked from other patients' records | Module 1 + each module | DRF test client |
| **Database — Constraints** | UNIQUE on `slot_id` rejects double booking · CHECK on `USER_ACCOUNT` enforced | S1 | pytest-django |
| **Database — FK Protection** | `ON DELETE PROTECT` raises error correctly · cascade deletes work | S1 | pytest-django |
| **Regression** | Full suite re-runs automatically on every PR via GitHub Actions | Module 8 + CI | pytest + GitHub Actions |

### Shared Fixtures — `conftest.py`

| Fixture | What It Creates |
|---|---|
| `test_department` | One Department — Medical |
| `test_staff` | One Staff member in `test_department` |
| `test_doctor` | Doctor subtype record linked to `test_staff` |
| `test_patient` | One Patient with `consent_given=True` |
| `test_user_patient` | `USER_ACCOUNT` linked to `test_patient` with PATIENT role |
| `test_user_doctor` | `USER_ACCOUNT` linked to `test_staff` with DOCTOR role |
| `test_timeslot` | Available timeslot for tomorrow at 09:00 |
| `test_appointment` | Appointment linking `test_patient` + `test_doctor` + `test_timeslot` |

### CI Test Gate

Every PR to `dev` must pass the full pytest suite before it can be merged. GitHub Actions spins up a fresh PostgreSQL 15 container, applies all migrations cleanly, runs the full test suite, and reports pass or fail. A single failing test blocks the merge. No deadline pressure overrides this gate.

---

## 15. Deployment Architecture

### Render.com Topology

```
GitHub Repository
  feat/* branches  ──►  PR to dev  ──►  GitHub Actions runs pytest
                                                 │
                                   ┌─────────────┴────────────┐
                                   │  PASS                    │  FAIL
                                   ▼                          ▼
                              2 approvals               PR blocked
                              S1 required               fix required
                              if migrations present
                                   │
                              Squash merge to dev
                                   │
                        (sprint end — all features stable)
                                   │
                              Merge dev → main
                                   │
                                   ▼  auto-deploy triggers on Render
╔═══════════════════════════════════════════════════════════════╗
║                         Render.com                            ║
║                                                               ║
║  ┌──────────────────────────────┐                           ║
║  │  Backend Web Service         │                           ║
║  │  Python · Django · Gunicorn  │                           ║
║  │  Serves /api/v1/             │                           ║
║  └──────────────┬───────────────┘                           ║
║                 │ psycopg2                                    ║
║                 ▼                                             ║
║  ┌──────────────────────────────┐                           ║
║  │  PostgreSQL                  │                           ║
║  │  Render Managed Database     │                           ║
║  │  Daily automated backups     │                           ║
║  └──────────────────────────────┘                           ║
║                                                               ║
║  ┌──────────────────────────────┐                           ║
║  │  Frontend Static Site        │                           ║
║  │  React build output          │                           ║
║  │  Served via CDN              │                           ║
║  └──────────────────────────────┘                           ║
╚═══════════════════════════════════════════════════════════════╝
```

### CI/CD Pipeline — Step by Step

```
1   Developer pushes to feat/* branch
2   Opens Pull Request targeting dev
3   GitHub Actions triggers automatically:
      · Spins up Ubuntu 22.04 runner
      · Starts PostgreSQL 15 service container
      · pip install -r requirements.txt
      · python manage.py migrate
      · pytest --tb=short -v
4   All tests pass  →  PR is reviewable
5   2 approvals received (S1 required if migration files are present)
6   Squash merge into dev  →  one clean commit on dev
7   Sprint end: dev merged into main
8   Render auto-deploys:
      Backend:   pip install + python manage.py migrate + gunicorn start
      Frontend:  npm install + npm run build
      Database:  python manage.py seed_db  (first deploy only)
9   Examiner accesses live URL
```

### Environment Strategy

| Environment | Database | Triggered By | Purpose |
|---|---|---|---|
| Local | Developer's local PostgreSQL | `python manage.py runserver` | Daily development |
| CI | PostgreSQL 15 container — GitHub Actions | Every PR to `dev` | Automated test validation |
| Production | Render managed PostgreSQL | Merge to `main` | Examiner demo and live URL |

### Backup & Recovery

| Layer | Mechanism | Recovery Action |
|---|---|---|
| **Automated Backups** | Render managed PostgreSQL — daily automated snapshots | Restore from Render dashboard |
| **Seed Data** | `python manage.py seed_db` management command | Re-run on any empty database to restore realistic demo data |
| **Schema Recovery** | All migrations version-controlled in GitHub | `python manage.py migrate` on any fresh PostgreSQL restores the exact schema |
| **Code Recovery** | Complete git history on GitHub | Any commit can be checked out and redeployed |

---

## 16. Design Decisions Log

| Decision | Chosen | Rejected | Reason |
|---|---|---|---|
| **Database engine** | PostgreSQL 15 | SQLite · MySQL | ACID compliance · FK enforcement by default · production-grade · primary exam deliverable |
| **ORM strategy** | Django ORM for CRUD · raw SQL in Module 6 only | Pure raw SQL throughout | ORM prevents SQL injection for standard queries · raw SQL in reports demonstrates SQL knowledge to the examiner |
| **API architecture** | REST via DRF | GraphQL · gRPC | Native to Django · team familiarity · appropriate for a 14-day sprint |
| **API versioning** | `/api/v1/` prefix from day one | No versioning | Breaking changes go to `/api/v2/` without affecting existing clients — costs nothing to implement now |
| **Authentication** | JWT stateless via SimpleJWT | Django sessions | No server-side session storage · role in payload · scales horizontally |
| **Double-booking prevention** | UNIQUE constraint + `SELECT FOR UPDATE` | Application-level check only | Application logic can fail silently · DB constraint cannot be bypassed by any code path |
| **DOCTOR table design** | Subtype table — PK is FK to STAFF | STAFF table with nullable doctor columns | 3NF compliance · no NULL columns for non-doctor staff · clean extension point for new staff subtypes |
| **NOTIFICATION recipient** | Single table with CHECK constraint | Separate patient and staff notification tables | Simpler schema · CHECK enforces integrity at DB level · easier reporting |
| **Frontend state management** | React Context API for auth state | Redux · Zustand | No external dependency needed for auth state at this scale |
| **JWT storage in React** | Memory via AuthContext state | localStorage | localStorage is vulnerable to XSS · memory storage is an acceptable tradeoff for a clinical demo system |
| **Deployment platform** | Render.com | AWS · Heroku · Railway | Free tier covers all three services · one dashboard · auto-deploy from GitHub · zero DevOps overhead |
| **Seed data mechanism** | Django management command `seed_db` | JSON fixtures | Management command generates programmatic FK-linked data · JSON fixtures are brittle with interdependent FKs |
| **Test runner** | pytest + pytest-django | Django unittest | Cleaner syntax · shared fixtures via `conftest.py` · better failure output · GitHub Actions integration |

---

## 17. Design Completeness Checklist

```
✅ Document identity — system name, project, purpose, sprint, DB lead
✅ System context — actors, problem statement, what it replaces
✅ System boundaries — explicit list of what the system does NOT do
✅ Non-functional requirements — 10 categories with scalability paths
✅ Design for Extension — principle, three dimensions, reference table
✅ Four-layer architecture — Presentation, Application, Data Access, Database
✅ External Services tier — GitHub, Render, Email Provider
✅ Internal Services tier — CI, Gunicorn, Email Backend, Auto-Backup
✅ Libraries mapped to correct layers
✅ The Adapter Principle — layer independence and replacement strategy
✅ Layer responsibility table — single responsibility per layer
✅ System file structure — folder-level, one purpose per folder
✅ Database design — 12 tables across 4 domains
✅ FK dependency graph — exact migration order in 5 levels
✅ Status lifecycle diagrams — APPOINTMENT and QUEUE_ENTRY
✅ Critical constraints — 11 constraints with reasoning
✅ Index strategy — 11 indexes with query justification
✅ Soft deletes — future consideration noted for POPIA compliance
✅ Future-proofing in schema — partitioning, channel flexibility, multi-branch
✅ Normalization — 1NF, 2NF, 3NF with full reasoning
✅ Transaction management — SELECT FOR UPDATE + ACID + two-layer defence
✅ Appointment booking sequence — end-to-end flow across all four layers
✅ API design — all endpoints versioned at /api/v1/
✅ API validation layer — 7 validation categories
✅ Authentication flow — 4-step JWT lifecycle
✅ Standard response shapes — success, list, error
✅ Security — RBAC, audit trail, POPIA, password hashing, QR token security
✅ Future security extensions — rate limiting, token rotation, HTTPS
✅ Edge cases and failure handling — 18 scenarios across 4 categories
✅ The Laws — 7 rules with reasoning
✅ Module ownership — 9 modules, two dependency gates, per-module spec
✅ Testing strategy — 9 test types, shared fixtures, CI gate
✅ Deployment topology — Render.com diagram with all three services
✅ CI/CD pipeline — 9-step process
✅ Environment strategy — local, CI, production
✅ Backup and recovery — 4 layers
✅ Design decisions log — 13 decisions with reasoning
```

---

*Ubuntu Campus Clinic — Appointment System · Group 19 · CMPG 311 · DBMS Module*
*Document lives at `/docs/SYSTEM_DESIGN.md` · Referenced from `README.md`*
