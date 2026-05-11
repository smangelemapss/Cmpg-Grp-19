# Ubuntu Campus Clinic — Team Workflow
## Operational Guide · Group 19 · Phase 3

> This is the operational guide — not the rules document. CONTRIBUTING.md covers the rules. This document covers exactly how each role works day to day, how git works in practice, and what to do when things break.

---

## Table of Contents

1. [Daily Workflow Loop](#1-daily-workflow-loop)
2. [Git in Practice](#2-git-in-practice)
3. [S1 — DB Lead, DevOps & QA](#3-s1--db-lead-devops--qa)
4. [B1 B2 B3 B4 — Backend Team](#4-b1-b2-b3-b4--backend-team)
5. [F1 F2 F3 F4 — Frontend Team](#5-f1-f2-f3-f4--frontend-team)
6. [Cross-Team Collaboration](#6-cross-team-collaboration)
7. [Pull Request Workflow on GitHub](#7-pull-request-workflow-on-github)
8. [When Things Go Wrong](#8-when-things-go-wrong)
9. [Sprint Timeline](#9-sprint-timeline)

---

## 1. Daily Workflow Loop

Every team member — backend, frontend, S1 — follows this sequence every working day.

### Before Writing Any Code

```bash
# Confirm which branch you are on
git branch
# If you see * dev or * main — STOP. You should be on your feature branch.

# Update dev with everyone's latest merged work
git checkout dev
git pull origin dev

# Switch back to your feature branch
git checkout feature/your-branch

# Bring dev into your branch so you stay current
git merge dev
# Resolve any conflicts before continuing — see Section 8
```

### While Coding

```bash
git status                            # see what has changed
git diff                              # see exact line changes
git add apps/patients/serializers.py  # stage a specific file
git add apps/patients/                # stage your whole module folder
git commit -m "feat(b2): add PatientSerializer with validation"
git push origin feature/b2-patient-api
```

### Before Closing the Laptop

```bash
git status        # check for uncommitted work
git add .
git commit -m "wip(b2): patient view in progress"
git push origin feature/b2-patient-api
```

Push every session. Never lose work.

---

## 2. Git in Practice

### How Branches Actually Work

A branch is just a pointer to a specific commit. Working on `feature/b2-patient-api` means `main` and `dev` are completely unaffected — you cannot break what you cannot touch.

```
main         →  points to commit X  (untouched)
dev          →  points to commit Y  (integration)
feature/b2   →  points to commit Z  (your work)
```

### How to Read the Branch Graph

```bash
git log --oneline --graph --all

# Example output:
# * f3a1c2d (HEAD -> feature/b2-patient-api) feat(b2): add views
# * 8b2e4a1 feat(b2): add PatientSerializer
# | * 2a8c1b4 (dev) feat(b1): add JWT login endpoint
# |/
# * 1e4f9d3 chore(s1): initial Django scaffold
```

### How to Undo Things Safely

**Changed a file but not staged — discard changes:**
```bash
git restore apps/patients/models.py
# WARNING: permanent — changes are gone
```

**Staged a file but not committed — unstage it:**
```bash
git restore --staged apps/patients/models.py
# Changes kept — file goes back to modified state
```

**Committed but not pushed — undo the commit, keep changes:**
```bash
git reset --soft HEAD~1
# Changes go back to staged — fix and recommit
```

**Committed and pushed — undo safely:**
```bash
# NEVER use git reset on pushed commits
git revert HEAD
# Creates a new commit that reverses the last one — history preserved
```

### Handling a Merge Conflict

```bash
# After git merge dev outputs a conflict:
git status
# Files under "both modified" have conflicts

# Open the file — Git marks it like this:
<<<<<<< HEAD
    your version here
=======
    incoming version here
>>>>>>> dev

# Edit the file — remove ALL markers, keep the correct version
# Then:
git add apps/patients/models.py
git commit -m "merge: resolve conflict in Patient model"
git push origin feature/your-branch
```

---

## 3. S1 — DB Lead, DevOps & QA

S1 is the shared role that bridges both teams. S1 does not own a feature module. S1 owns the foundation that every module builds on.

### Day 1 — Before Anyone Else Writes Code

**Step 1 — Create and configure the repository**

```bash
# On GitHub:
# Create repo: Ubuntu-clinic-DBMS-grp-19
# Add all 9 members as collaborators with Write access
# Settings → Branches → Add protection rule for main and dev:
#   - Require PR before merging
#   - Require 2 approvals
#   - Require status checks (pytest CI) to pass
#   - Do not allow bypassing

git clone https://github.com/smangelemapss/Ubuntu-clinic-DBMS-grp-19.git
cd Ubuntu-clinic-DBMS-grp-19
git checkout -b feature/s1-scaffold
```

**Step 2 — Scaffold the Django project**

```bash
django-admin startproject config .
python manage.py startapp auth_module apps/auth_module
python manage.py startapp patients apps/patients
python manage.py startapp doctors apps/doctors
python manage.py startapp appointments apps/appointments
python manage.py startapp queue apps/queue
python manage.py startapp admin_reporting apps/admin_reporting
python manage.py startapp notifications apps/notifications

git add .
git commit -m "chore(s1): initial Django project scaffold — all 7 apps registered"
```

**Step 3 — Write ALL 12 models**

S1 writes every model file across all apps. Backend developers (B1–B4) do not write models — they import and build serializers and views on top of what S1 defines. This prevents FK naming conflicts across parallel branches.

Migration dependency order to follow when writing models:

```
Level 1 — write first (no FKs):
  patients/models.py      → Patient, PatientContact
  doctors/models.py       → Department, TimeSlot

Level 2 — depends on Level 1:
  doctors/models.py       → Staff (FK → Department)

Level 3 — depends on Level 2:
  doctors/models.py       → Doctor (PK = FK → Staff)
  auth_module/models.py   → UserAccount (FK → Patient optional, Staff optional)

Level 4 — depends on Level 3:
  appointments/models.py  → Appointment (FK → Patient + Staff + TimeSlot)
  admin_reporting/models.py → AuditLog (FK → UserAccount)

Level 5 — depends on Level 4:
  queue/models.py         → QueueEntry (FK → Appointment)
  patients/models.py      → MedicalRecord (FK → Appointment + Patient)
  notifications/models.py → Notification (FK → Appointment + Patient/Staff)
```

Every model must have `db_table` in Meta matching the Phase 2 ERD exactly:

```python
class Patient(models.Model):
    class Meta:
        db_table = "PATIENT"
```

```bash
git add .
git commit -m "feat(s1): write all 12 models with correct db_table Meta names"
```

**Step 4 — Run migrations in dependency order**

```bash
python manage.py makemigrations patients
python manage.py makemigrations doctors
python manage.py makemigrations auth_module
python manage.py makemigrations appointments
python manage.py makemigrations admin_reporting
python manage.py makemigrations queue
python manage.py makemigrations notifications

python manage.py migrate

# Verify in psql
psql -U postgres -d ubuntu_clinic
\dt                        # list all 12 tables
\d "APPOINTMENT"           # verify constraints on a specific table
\d "USER_ACCOUNT"

git add .
git commit -m "db(s1): run all initial migrations — 12 tables created and verified"
```

**Step 5 — Write `conftest.py` with shared fixtures**

All 9 modules use these fixtures. S1 owns and maintains this file.

```python
# conftest.py
import pytest
from apps.doctors.models import Department, Staff, Doctor, TimeSlot
from apps.patients.models import Patient
from apps.auth_module.models import UserAccount
from apps.appointments.models import Appointment
from datetime import date, time, timedelta

@pytest.fixture
def test_department(db):
    return Department.objects.create(department_name="Medical")

@pytest.fixture
def test_staff(db, test_department):
    return Staff.objects.create(
        department=test_department,
        first_name="Sibusiso", last_name="Nkosi",
        role="DOCTOR", email="dr.nkosi@ubuntu-clinic.ac.za",
        contact_number="0112345678",
        working_hours_start=time(8, 0), working_hours_end=time(16, 0)
    )

@pytest.fixture
def test_doctor(db, test_staff):
    return Doctor.objects.create(
        staff=test_staff,
        license_number="HPCSA-001",
        specialisation="General Practitioner"
    )

@pytest.fixture
def test_patient(db):
    return Patient.objects.create(
        student_number="43224105",
        first_name="Thabo", last_name="Nkosi",
        email="thabo@nwu.ac.za",
        contact_number="0712345678",
        date_of_birth=date(2000, 1, 15),
        consent_given=True
    )

@pytest.fixture
def test_timeslot(db):
    tomorrow = date.today() + timedelta(days=1)
    return TimeSlot.objects.create(
        slot_date=tomorrow,
        start_time=time(9, 0),
        end_time=time(9, 30),
        is_available=True
    )

@pytest.fixture
def test_appointment(db, test_patient, test_staff, test_timeslot):
    return Appointment.objects.create(
        patient=test_patient,
        staff=test_staff,
        slot=test_timeslot,
        status="SCHEDULED",
        booking_type="SICK",
        priority="NORMAL"
    )
```

```bash
git add conftest.py
git commit -m "test(s1): write shared fixtures for all 12 tables"
```

**Step 6 — Write the CI pipeline**

```yaml
# .github/workflows/ci.yml
name: Ubuntu Clinic CI

on:
  pull_request:
    branches: [dev, main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: ubuntu_clinic_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: testpass
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: cd backend && pip install -r requirements.txt
      - name: Run migrations
        run: cd backend && python manage.py migrate
        env:
          DB_NAME: ubuntu_clinic_test
          DB_USER: postgres
          DB_PASSWORD: testpass
          DB_HOST: localhost
          DB_PORT: 5432
          SECRET_KEY: ci-test-secret-key-not-real
          DEBUG: True
      - name: Run pytest
        run: cd backend && pytest --tb=short -v
```

```bash
git add .github/
git commit -m "chore(s1): add GitHub Actions CI — pytest on every PR to dev"
```

**Step 7 — Push, open PR, merge to dev, announce**

```bash
git push -u origin feature/s1-scaffold
# Open PR on GitHub targeting dev
# Self-review and merge
```

Post in group chat:
> **"Repo scaffold is live on dev. All 12 models written and migrated. Clone from dev now. B1, B2, B3, B4 can start building serializers and views. Do NOT run makemigrations without asking me first."**

---

### S1 Ongoing Responsibilities During the Sprint

**Migration governance — most critical recurring task:**

When any backend developer needs to add or change a field:

1. Developer posts in group chat: `"[MIGRATION REQUEST] Adding allergies TEXT NULL to PATIENT — no FK impact"`
2. S1 confirms no conflicts with open branches
3. Developer runs `makemigrations <app>` only after S1 confirms
4. Developer commits migration file and tags S1 as reviewer on the PR
5. S1 tests the migration locally before approving:

```bash
git fetch origin
git checkout feature/b2-patient-api
python manage.py migrate
psql -U postgres -d ubuntu_clinic
\d "PATIENT"                  # verify new field is present
python manage.py migrate patients 0001_initial  # verify rollback works
```

**`seed_db` command — mid-sprint:**

```bash
git checkout -b feature/s1-seed-data
# Write apps/notifications/management/commands/seed_db.py
# Seed order must match migration dependency order:
# departments → staff → doctors → patients → user_accounts →
# timeslots → appointments → queue_entries → medical_records →
# notifications → audit_logs
git add .
git commit -m "feat(s1): write seed_db management command for all 12 tables"
```

**API contract document — Day 1 alongside scaffold:**

Write a short JSON contract for every endpoint and share it in the group chat so F1–F4 can mock immediately without waiting for backend:

```
POST /api/v1/appointments/
Request:  { slot_id: int, staff_id: int, reason_for_visit: string }
Response 201: { appointment_id: int, qr_code_token: string }
Response 409: { error: string, code: "SLOT_UNAVAILABLE" }
```

**Deployment — end of sprint:**

```bash
git checkout -b feature/s1-deployment

# On Render.com:
# 1. Create PostgreSQL service — copy DATABASE_URL
# 2. Create Backend web service:
#    Build command: pip install -r requirements.txt && python manage.py migrate
#    Start command: gunicorn config.wsgi
#    Env vars: SECRET_KEY, DATABASE_URL, DEBUG=False, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS
# 3. Create Frontend static site:
#    Build command: npm install && npm run build
#    Publish directory: build

# First deploy only — seed the database:
python manage.py seed_db

git add .
git commit -m "chore(s1): add Render deployment config and env vars"
```

---

## 4. B1 B2 B3 B4 — Backend Team

### What Each Backend Developer Builds

| Role | Module | What to Build |
|---|---|---|
| **B1** | Auth & Roles | `USER_ACCOUNT` · JWT login/register/refresh/logout · `IsPatient` · `IsDoctor` · `IsAdmin` permission classes · Django admin registration for all 12 models · CORS + JWT settings |
| **B2** | Patients & Timeslots | Patient CRUD endpoints · contact management · medical records (auth-gated) · timeslot availability and filtering |
| **B3** | Bookings & Queue | Appointment create/cancel/update with QR generation · queue check-in + status flow · Django email for confirmations |
| **B4** | Admin & Reporting | `AUDIT_LOG` auto-logging middleware · raw SQL reports · pytest unit tests for all backend modules |

### Getting Started

```bash
# Clone dev — after S1 has pushed the scaffold
git checkout dev
git pull origin dev
git checkout -b feature/b2-patient-api   # use your assigned branch name

# Verify the models S1 wrote
cat apps/patients/models.py
# Do NOT modify this file — only import from it
```

### The Build Order — Follow This Exactly

```
Step 1 — Import the model S1 wrote (do not rewrite it)
Step 2 — Write the serializer
Step 3 — Write the view
Step 4 — Write the URL routing
Step 5 — Write tests
Step 6 — Commit each step separately
```

**Example — B2 building Patient endpoints:**

```python
# Step 1 — import, do not rewrite
from patients.models import Patient

# Step 2 — serializer
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['patient_id', 'student_number', 'first_name',
                  'last_name', 'email', 'date_of_birth', 'consent_given']
        read_only_fields = ['patient_id', 'registration_date']

# Step 3 — view
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

# Step 4 — URL
router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
```

Commit after each step:

```bash
git commit -m "feat(b2): add PatientSerializer with student number validation"
git commit -m "feat(b2): add PatientViewSet with RBAC permissions"
git commit -m "feat(b2): register patient URLs at /api/v1/patients/"
git commit -m "test(b2): add patient registration and CRUD tests"
```

### Testing Your Endpoints Before Frontend Connects

```bash
# Get a JWT first
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testpatient", "password": "testpass"}'

# Call your endpoint
curl -X GET http://localhost:8000/api/v1/patients/ \
  -H "Authorization: Bearer <your_access_token>"
```

Post in group chat when ready:
> **"B2 endpoints live on dev — /api/v1/patients/ and /api/v1/patients/{id}/records/ working. F2 can connect."**

---

## 5. F1 F2 F3 F4 — Frontend Team

### What Each Frontend Developer Builds

| Role | Module | What to Build |
|---|---|---|
| **F1** | Layout, Auth & Routing | `App.jsx` routing · `AuthContext` · JWT storage · login + register pages · shared Navbar, Sidebar, Button, Input components · axios instance with JWT interceptor |
| **F2** | Patient & Medical Pages | Patient profile view + edit · medical history list + record detail · emergency contact management · patient-facing appointment list |
| **F3** | Doctor Dashboard & Booking | Doctor dashboard with React Big Calendar · timeslot availability UI · appointment booking form + QR display page · waiting room queue board |
| **F4** | Admin UI & Notifications | Admin dashboard with Chart.js charts · audit log table with filters · department management page · notification history panel |

### The Core Rule

React never calls the database. React never calls axios directly inside a component. All HTTP calls go through a service function in `src/services/`.

```javascript
// ❌ Wrong
const res = await fetch('http://localhost:8000/api/v1/patients/');

// ✅ Correct
import { getPatients } from '../services/patientService';
const patients = await getPatients();
```

### Working Before Backend Endpoints Are Ready — Mocking

F1–F4 can start building pages immediately using mocked service functions. When the real endpoint merges, swap the mock for the real call. The component never changes.

```javascript
// src/services/patientService.js

// Mock — use until B2 merges to dev
export const getPatient = async (id) => {
  return { patient_id: 1, first_name: "Thabo", email: "thabo@nwu.ac.za" };
};

// Real — swap in when B2 endpoint is live
export const getPatient = async (id) => {
  const response = await api.get(`/api/v1/patients/${id}/`);
  return response.data;
};
```

### AuthContext — F1 Builds This First

Every other frontend role depends on `AuthContext` being live. F1 builds and merges this before F2, F3, F4 build their pages.

```javascript
// src/context/AuthContext.jsx
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const login = async (username, password) => {
    const data = await loginUser(username, password);
    setUser(data);
    setRole(data.role);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 6. Cross-Team Collaboration

### The Dependency Map

```
S1 scaffolds repo and all 12 models  ←  Everyone blocks on this
         │
         ▼
B1 merges JWT + permission classes   ←  All backend endpoints block on this
         │
    ┌────┴─────────────┐
    ▼                  ▼
  B2 builds          B3 builds
  Patient + Timeslot  Appointment + Queue
    │                  │
    └────────┬──────────┘
             ▼
         B3/B4 complete
             │
             ▼
    F1 merges AuthContext + shell   ←  All frontend pages block on this
         │
    ┌────┼────┬────┐
    ▼    ▼    ▼    ▼
   F2   F3   F4  (connect to real B-team endpoints as they merge)
```

### Communication Protocol

Post in the group chat at these moments — every time:

| When | What to Post |
|---|---|
| Starting work | `"Starting feature/b2-patient-api today — building Patient CRUD serializer and views"` |
| Endpoint ready | `"B2 endpoints live on dev — /api/v1/patients/ working. F2 can connect."` |
| Migration needed | `"[MIGRATION REQUEST] B2 — adding allergies TEXT NULL to PATIENT, no FK impact"` |
| PR open | `"PR open — feature/b2-patient-api. S1 tagged for migration review."` |
| Blocked | `"Blocked on B1 — need JWT permission classes before I can gate my endpoints"` |

### API Contract Agreement

Before any frontend developer connects a page to a backend endpoint, both sides agree the contract in the group chat:

```
B3 posts:
"Booking endpoint contract:
 POST /api/v1/appointments/
 Request:  { slot_id: int, staff_id: int, reason_for_visit: string, booking_type: string }
 Response 201: { appointment_id: int, qr_code_token: string }
 Response 409: { error: string, code: 'SLOT_UNAVAILABLE' }
 F3 — does this work for the booking form?"

F3 replies: "Confirmed. Building the form against this contract."
```

---

## 7. Pull Request Workflow on GitHub

### Opening a PR

1. Push your branch: `git push origin feature/your-branch`
2. Go to GitHub — click **"Compare & pull request"** on the yellow banner
3. **Set base branch to `dev`** — never `main`
4. Fill in the PR description completely — every field
5. Assign 2 reviewers minimum
6. Tag S1 if any migration file is included
7. Add the correct label (`feat`, `fix`, `db`, `docs`)
8. Link the GitHub issue

### Responding to Review Comments

```bash
# Fix on your feature branch
git add apps/patients/views.py
git commit -m "fix(b2): address PR review — add missing ownership check"
git push origin feature/b2-patient-api
# PR auto-updates on GitHub
# Reply to each comment: "Fixed in commit abc1234"
# Click "Resolve conversation"
# Click "Re-request review"
```

### After Merge

```bash
git checkout dev
git pull origin dev
git branch -d feature/b2-patient-api       # delete local branch
# GitHub prompts to delete remote branch — click Delete branch
```

Post in group chat: **"B2 merged — Patient CRUD and /records/ endpoint live on dev"**

---

## 8. When Things Go Wrong

### Migration Conflict

**Symptoms:** `python manage.py migrate` fails with inconsistent migration history.

**Action:** Tell S1 immediately. Do not try to fix alone.

S1 resolves:
```bash
python manage.py showmigrations
python manage.py makemigrations --merge
```

Everyone re-pulls dev after S1 fixes it.

**Prevention:** Always ask S1 before running `makemigrations`. Always.

---

### Accidentally Started Coding on Dev

```bash
# Do NOT commit — do NOT push
git checkout -b feature/your-branch
# Your uncommitted changes move with you
# You are now safely on the correct branch
```

---

### Accidentally Committed to Dev (Not Yet Pushed)

```bash
git checkout -b feature/your-branch   # save work to correct branch
git checkout dev
git reset --soft HEAD~1               # undo commit on dev — changes unstaged
git restore .                         # discard changes on dev
git checkout feature/your-branch      # work safely here
```

---

### Someone Pushed Directly to Dev

Tell S1 immediately. S1 resolves:

```bash
git checkout dev
git reset --hard <last-clean-commit-hash>
git push origin dev --force-with-lease
```

Everyone re-pulls:
```bash
git checkout dev
git fetch origin
git reset --hard origin/dev
```

---

### CI Failing on Your PR

```bash
# Click the red X on GitHub — read the full error
cd backend
pytest --tb=short -v          # reproduce locally
# Fix the failure
git add .
git commit -m "fix(b2): fix failing serializer test"
git push origin feature/b2-patient-api
# CI re-runs automatically
```

---

### Your Branch Is Behind Dev

```bash
git checkout dev
git pull origin dev
git checkout feature/your-branch
git merge dev                 # resolve any conflicts
git push origin feature/your-branch
```

---

## 9. Sprint Timeline

| Day | Date | S1 | B1 | B2 | B3 | B4 | F1 | F2 | F3 | F4 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 4 May | Repo · scaffold · all 12 models · migrations · push to dev | Clone · plan B1 | Clone · plan B2 | Clone · plan B3 | Clone · plan B4 | Clone · plan F1 | Clone · plan F2 | Clone · plan F3 | Clone · plan F4 |
| 2 | 5 May | CI pipeline · conftest.py · seed_db skeleton · API contracts | JWT login + register | Patient serializers | Appointment model review | Audit log middleware | AuthContext · axios instance | Mock patient service | Mock doctor service | Mock admin service |
| 3 | 6 May | Support B-team · review migration requests | JWT refresh + logout · permission classes | Patient views + URLs | Appointment + Queue endpoints | Raw SQL reports | Login + register pages | Patient profile page | Doctor dashboard | Reports page |
| 4 | 7 May | Review B1 PR | **B1 PR → merge to dev** | Patient tests | QR generation | pytest fixtures | Protected routes · Navbar | Patient medical history | Booking form | Audit log table |
| 5 | 8 May | Support all · migration governance | Support F1 wiring | B2 PR open | Queue status flow | B4 PR open | Wire auth to B1 | Wire patient to B2 | Wire booking to B3 | Wire reports to B4 |
| 6 | 9 May | Review all PRs | Done | **B2 PR → merge** | B3 PR open | **B4 PR → merge** | Done | Done | Queue board | Notifications panel |
| 7 | 10 May | seed_db complete · review B3 | — | Done | **B3 PR → merge** | Done | Done | Done | **F3 PR → merge** | **F4 PR → merge** |
| 8 | 11 May | All PRs reviewed · deploy prep | — | — | Done | Done | **F1 PR → merge** | **F2 PR → merge** | Done | Done |
| 9 | 12 May | Deploy to Render · verify live URL | — | — | — | — | — | — | — | — |
| 10 | 13 May | Verify seed data on production | All | All | All | All | All | All | All | All |
| 11 | 14 May | Final sign-off · confirm examiner URL | — | — | — | — | — | — | — | — |
| **Sub** | **18 May** | **Submit GitHub repo link + live Render URL** | | | | | | | | |

### The Two Non-Negotiable Gates

```
GATE 1 — Day 4
B1 merges to dev
JWT working · permission classes defined
All backend endpoints are blocked until this is green

GATE 2 — Day 7
B3 merges to dev
Appointment booking + queue flow working
F3 cannot test end-to-end booking until this is green
```

### Four Check-in Meetings

| Meeting | Date | Each Person Reports |
|---|---|---|
| Check-in 1 | 7 May | Branch name · first endpoint or page · status |
| Check-in 2 | 10 May | Endpoints or pages done · what is blocking · what is needed from other roles |
| Check-in 3 | 13 May | All work merged or PR open · live URL status |
| Check-in 4 | 16 May | Final walkthrough of live URL · every feature confirmed working |

---

*Ubuntu Campus Clinic — Appointment System · Group 19 · CMPG 311 · DBMS Module*
*`TEAM_WORKFLOW.md` · referenced from `README.md` and `CONTRIBUTING.md`*
