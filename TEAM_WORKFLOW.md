# Ubuntu Campus Clinic — Team Contribution & Git Workflow
## The Complete Operational Guide

> **Group 19 · CMPG 311 · DBMS Module · Phase 3**
> This document covers exactly how every team member works — day to day, commit by commit, PR by PR. It is not a rules document. It is an operational guide. Read it once before you write a single line of code. Reference it whenever you are unsure what to do next.

---

## Table of Contents

1. [How the Repo Is Organized](#1-how-the-repo-is-organized)
2. [The Daily Workflow Loop](#2-the-daily-workflow-loop)
3. [Git Deep Dive](#3-git-deep-dive)
4. [S1 DB Lead Workflow](#4-s1-db-lead-workflow)
5. [Backend Module Workflow](#5-backend-module-workflow)
6. [Frontend Workflow](#6-frontend-workflow)
7. [Cross-Module Collaboration](#7-cross-module-collaboration)
8. [Pull Request Workflow on GitHub](#8-pull-request-workflow-on-github)
9. [When Things Go Wrong](#9-when-things-go-wrong)
10. [Sprint Timeline](#10-sprint-timeline)

---

## 1. How the Repo Is Organized

### Repository Structure

```
ubuntu-campus-clinic/          ← root of everything
├── .github/workflows/         ← CI pipeline lives here
├── backend/                   ← Django project
├── frontend/                  ← React project
├── docs/SYSTEM_DESIGN.md      ← system design blueprint
├── README.md                  ← setup guide
├── CONTRIBUTING.md            ← rules and standards
└── TEAM_WORKFLOW.md           ← this document
```

### Branch Model

The repository has three types of branches. Understanding what each one is for prevents 90% of team conflicts.

```
main
 └── Production-ready code only.
     Never worked on directly.
     Receives one merge at the end of the sprint from dev.
     The examiner accesses the live URL built from this branch.

dev
 └── Integration branch.
     This is where all completed work comes together.
     Every Pull Request targets dev.
     Never commit directly to dev.
     S1 merges dev into main at sprint end.

feat/your-branch
 └── Your working branch.
     Created fresh for every module or feature.
     Lives as long as your PR.
     Deleted after your PR merges.
     Never shared with another team member.
```

### Branch Protection Rules

These are configured on GitHub by S1 on Day 1:

- `main` — direct push blocked · requires PR · requires 2 approvals · requires CI pass
- `dev` — direct push blocked · requires PR · requires 2 approvals · requires CI pass
- Feature branches — no protection · you control your own branch

### Who Owns What

| Area | Owner | Responsibility |
|---|---|---|
| All migrations | S1 | Reviews and approves every migration before it merges |
| `config/settings.py` | S1 | No one edits this without telling S1 |
| `conftest.py` | S1 | Shared fixtures — S1 writes and maintains |
| `requirements.txt` | S1 | Pin dependencies here — no one adds packages silently |
| `.github/workflows/ci.yml` | S1 | CI pipeline — S1 owns and maintains |
| `apps/auth_module/` | Module 1 | JWT, permissions — touches USER_ACCOUNT only |
| `apps/patients/` | Module 2 | Patient, Contact, Medical Record |
| `apps/doctors/` | Module 3 | Staff, Doctor, Timeslot, Department |
| `apps/appointments/` | Module 4 | Appointment, booking logic, QR |
| `apps/queue/` | Module 5 | Queue Entry, check-in |
| `apps/admin_reporting/` | Module 6 | Audit Log, reports |
| `apps/notifications/` | Module 7 | Notification, email, seed_db |
| `frontend/src/` | Module 8 | React pages, components, services |
| `README.md` | Module 8 | Keeps it updated |

---

## 2. The Daily Workflow Loop

This is the exact sequence every team member follows every single working day. No exceptions.

### Before You Start Coding

```bash
# 1. Check which branch you are currently on
git branch
# You should see your feature branch highlighted with *
# If you see * dev or * main — STOP. Create your feature branch first.

# 2. Make sure dev is up to date locally
git checkout dev
git pull origin dev

# 3. Switch back to your feature branch
git checkout feat/your-module

# 4. Bring the latest dev changes into your branch
git merge dev
# This keeps your branch current with everyone else's merged work
# If there are conflicts — see Section 9
```

### While You Are Coding

```bash
# Check what has changed at any point
git status

# See the exact changes line by line
git diff

# Stage specific files you want to commit
git add apps/patients/models.py
git add apps/patients/serializers.py

# Stage everything changed in your module folder
git add apps/patients/

# Never do this blindly — always check git status first
git add .

# Commit with a conventional message
git commit -m "feat(patients): add Patient model and migrations"

# Push your branch to GitHub
git push origin feat/your-module

# First push from a new branch — set the upstream
git push -u origin feat/your-module
# After this first push, git push alone is enough
```

### Commit Frequently — The Rule

Commit after every meaningful unit of work. Not at the end of the day. Not when the whole feature is done.

```
✅ After writing the model
✅ After writing the serializer
✅ After writing the views
✅ After writing the URLs
✅ After writing the tests
✅ After fixing a bug
✅ Before you close your laptop for the night
```

The examiner reads your git history. Frequent, well-named commits show real work. One commit with everything shows nothing.

### Before You Close Your Laptop

```bash
# Check for anything uncommitted
git status

# If there is uncommitted work — commit it even if unfinished
git add .
git commit -m "wip(patients): patient serializer in progress"

# Push everything to GitHub
git push origin feat/your-module
```

Never lose work because you forgot to push. Push every session.

---

## 3. Git Deep Dive

### How Git Actually Works — The Mental Model

Git does not save files. Git saves **snapshots of your project at a point in time**. Each snapshot is called a commit. Every commit knows who made it, when, and what changed since the last snapshot.

```
commit A  →  commit B  →  commit C  →  commit D  (HEAD)
  │              │              │              │
"initial     "add Patient   "add           "add
 scaffold"    model"         serializer"    views"
```

`HEAD` is where you currently are. When you commit, HEAD moves forward.

### The Three States of a File

Every file in your project is always in one of three states:

```
MODIFIED                STAGED                 COMMITTED
(changed but           (marked for            (saved in
 not saved             next commit)            git history)
 to git yet)
     │                      │                      │
     │  git add <file>       │  git commit -m "..."  │
     └──────────────────────►└──────────────────────►
```

`git status` shows you which state each file is in.
`git diff` shows you what changed in MODIFIED files.
`git diff --staged` shows you what is in STAGED files.

### What a Branch Actually Is

A branch is just a pointer to a specific commit. That is all it is.

```
main     →  points to commit X
dev      →  points to commit Y
feat/patients  →  points to commit Z
```

When you commit on `feat/patients`, the branch pointer moves forward. `main` and `dev` are completely unaffected. This is why branches are safe to work on — you cannot break what you cannot touch.

### How Merging Works

When you run `git merge dev` on your feature branch, git finds the common ancestor commit between your branch and dev, then combines the changes from both.

```
Before merge:
dev:           A → B → C → D
feat/patients: A → B → E → F

After git merge dev on feat/patients:
feat/patients: A → B → E → F → M
                              ↑
                         merge commit
                    (combines C+D with E+F)
```

The team uses **merge, not rebase**. Rebase rewrites history and causes problems in shared branches.

### git pull vs git fetch — The Difference

```bash
# git fetch
# Downloads changes from GitHub but does NOT apply them
# Safe to run at any time — nothing in your working directory changes
git fetch origin

# git pull
# Downloads changes AND immediately merges them into your current branch
# = git fetch + git merge
git pull origin dev

# Best practice for this project:
# Always pull on dev to update it
# Then merge dev into your feature branch manually
git checkout dev
git pull origin dev
git checkout feat/your-module
git merge dev
```

### Reading Git Log — Understanding Branch History

```bash
# See a clean one-line history
git log --oneline

# See the full branch graph — most useful command for understanding state
git log --oneline --graph --all

# Example output:
# * f3a1c2d (HEAD -> feat/patients) feat(patients): add views
# * 8b2e4a1 feat(patients): add serializer
# * 3c9d7f2 feat(patients): add Patient model
# | * 2a8c1b4 (dev) feat(auth): add JWT login endpoint
# |/
# * 1e4f9d3 chore: initial Django scaffold
```

The `*` is a commit. The `|` and `/` show branch lines. This tells you exactly where every branch diverged and what work exists where.

### How to Undo Things Safely

**Scenario 1 — You edited a file but have not staged it yet. You want to discard the changes.**

```bash
git restore apps/patients/models.py
# File goes back to what it was at the last commit
# WARNING: this is permanent — the changes are gone
```

**Scenario 2 — You staged a file with git add but have not committed yet. You want to unstage it.**

```bash
git restore --staged apps/patients/models.py
# File goes back to MODIFIED state — your changes are kept
# You can now edit it more or discard it with git restore
```

**Scenario 3 — You committed something but have not pushed it yet. You want to undo the commit but keep your changes.**

```bash
git reset --soft HEAD~1
# Undoes the last commit
# Your changes go back to STAGED state
# You can fix them and recommit
```

**Scenario 4 — You committed something and pushed it. You want to undo it safely.**

```bash
# NEVER use git reset on pushed commits — it rewrites history
# Use git revert instead — it creates a new commit that undoes the change

git revert HEAD
# Creates a new commit that reverses the last commit
# History is preserved — safe for shared branches
```

**Scenario 5 — You want to see what a file looked like at a specific commit.**

```bash
git log --oneline              # find the commit hash
git show abc1234:apps/patients/models.py
# Shows the file content at that commit without changing anything
```

### How to Handle a Merge Conflict — Step by Step

A merge conflict happens when two branches changed the same line of the same file. Git cannot decide which version to keep — it asks you to decide.

```bash
# You ran git merge dev and got this:
# CONFLICT (content): Merge conflict in apps/patients/models.py
# Automatic merge failed; fix conflicts and then commit the result.

# Step 1 — See which files have conflicts
git status
# Files listed under "both modified" have conflicts

# Step 2 — Open the conflicting file
# Git marks the conflict like this:
<<<<<<< HEAD
    email = models.EmailField(max_length=100, unique=True)
=======
    email = models.EmailField(max_length=150, unique=True)
>>>>>>> dev

# Everything between <<<<<<< HEAD and ======= is YOUR version
# Everything between ======= and >>>>>>> dev is the incoming version

# Step 3 — Decide which version is correct and edit the file
# Remove ALL conflict markers (<<<<<<, =======, >>>>>>>)
# Leave only the correct final version:
    email = models.EmailField(max_length=100, unique=True)

# Step 4 — Stage the resolved file
git add apps/patients/models.py

# Step 5 — Complete the merge
git commit -m "merge: resolve conflict in Patient email field"

# Step 6 — Push
git push origin feat/your-module
```

### The Most Common Mistakes and How to Recover

**Mistake 1 — You started coding on dev instead of a feature branch.**

```bash
# Do NOT commit. Do NOT push.

# Create your feature branch from where you are
git checkout -b feat/your-module
# Your uncommitted changes move with you to the new branch
# You are now safely on the correct branch
```

**Mistake 2 — You committed to dev directly and have not pushed yet.**

```bash
# Step 1 — Create a feature branch at the current state
git checkout -b feat/your-module

# Step 2 — Go back to dev and undo the commit
git checkout dev
git reset --soft HEAD~1
# Your changes are now unstaged on dev

# Step 3 — Discard the changes on dev
git restore .

# Step 4 — Go to your feature branch and work there
git checkout feat/your-module
```

**Mistake 3 — You forgot to pull dev before starting. Your branch is behind.**

```bash
git checkout dev
git pull origin dev
git checkout feat/your-module
git merge dev
# Resolve any conflicts if they appear
```

**Mistake 4 — You pushed to dev directly (this should be blocked by branch protection — but just in case).**

```bash
# Tell S1 immediately — do not try to fix it alone
# S1 will force-reset dev to the last clean state
# Everyone will need to re-pull dev
```

**Mistake 5 — You deleted a file you needed.**

```bash
git restore apps/patients/models.py
# Restores from the last commit
# Only works if you have not committed the deletion yet
```

**Mistake 6 — Your branch has diverged badly from dev and merging is a mess.**

```bash
# Tell S1 — do not try to force merge
# S1 will help you cherry-pick your commits onto a fresh branch
```

---

## 4. S1 DB Lead Workflow

Your role is the most critical in the project. Every other module depends on what you do first. You are not just a developer — you are the architect and the infrastructure owner.

### Day 1 Responsibilities — Do These Before Anyone Else Codes

**Step 1 — Create and configure the GitHub repository**

```bash
# Create the repo on GitHub (private, Group 19 as org or owner)
# Add all 9 team members as collaborators with Write access
# Clone it locally
git clone https://github.com/your-org/ubuntu-campus-clinic.git
cd ubuntu-campus-clinic
```

**Step 2 — Configure branch protection on GitHub**

Go to GitHub → Settings → Branches → Add branch protection rule:

For `main`:
- Check: Require a pull request before merging
- Check: Require approvals → set to 2
- Check: Require status checks to pass → select the pytest CI job
- Check: Do not allow bypassing the above settings

Repeat for `dev` with the same settings.

**Step 3 — Scaffold the Django project**

```bash
# Create the branch
git checkout -b feat/s1-scaffold

# Create Django project structure
django-admin startproject config .
python manage.py startapp auth_module apps/auth_module
python manage.py startapp patients apps/patients
python manage.py startapp doctors apps/doctors
python manage.py startapp appointments apps/appointments
python manage.py startapp queue apps/queue
python manage.py startapp admin_reporting apps/admin_reporting
python manage.py startapp notifications apps/notifications

# Create requirements.txt with pinned versions
# Create .env.example
# Create pytest.ini
# Create conftest.py skeleton
# Create .github/workflows/ci.yml

# Commit the scaffold
git add .
git commit -m "chore: initial Django project scaffold — all 7 apps registered"
git push -u origin feat/s1-scaffold
```

**Step 4 — Write ALL 12 models**

You write every model across all apps. This is non-negotiable. If a teammate writes their own model, it may conflict with another module's FK. You own the schema.

```bash
# Write models in migration dependency order:
# 1. patients/models.py     — Patient, PatientContact
# 2. doctors/models.py      — Department, Staff, Doctor, TimeSlot
# 3. auth_module/models.py  — UserAccount
# 4. appointments/models.py — Appointment
# 5. queue/models.py        — QueueEntry
# 6. patients/models.py     — MedicalRecord (add to existing file)
# 7. admin_reporting/models.py — AuditLog
# 8. notifications/models.py   — Notification

git add .
git commit -m "feat(db): write all 12 models across all apps"
```

**Step 5 — Run migrations in dependency order**

```bash
python manage.py makemigrations patients
python manage.py makemigrations doctors
python manage.py makemigrations auth_module
python manage.py makemigrations appointments
python manage.py makemigrations queue
python manage.py makemigrations admin_reporting
python manage.py makemigrations notifications

python manage.py migrate

# Verify schema in psql
psql -U postgres -d ubuntu_clinic
\dt                    # list all tables
\d "APPOINTMENT"       # inspect a specific table
\d "USER_ACCOUNT"

git add .
git commit -m "db: run all initial migrations — 12 tables created"
```

**Step 6 — Write shared fixtures in conftest.py**

```bash
git add conftest.py
git commit -m "test: write shared fixtures for all 12 tables"
```

**Step 7 — Write the GitHub Actions CI pipeline**

```bash
git add .github/workflows/ci.yml
git commit -m "chore: add GitHub Actions CI — pytest on every PR to dev"
```

**Step 8 — Push, open PR, merge to dev**

```bash
git push origin feat/s1-scaffold
# Open PR on GitHub targeting dev
# This is the only PR with no migration review needed — you wrote everything
# Merge after self-review
# Everyone clones dev after this
```

Post in group chat: **"Repo is live. Schema is in dev. Everyone clone from dev now. Do NOT start coding until you have cloned."**

---

### Migration Governance — Your Ongoing Responsibility

After Day 1, your most important ongoing job is migration governance. This is how you manage it.

**The Rule:**

No migration file reaches `dev` without your approval. Every teammate who changes a model must tell you before running `makemigrations`.

**The Protocol — what happens when a teammate needs a migration:**

```
1. Teammate posts in group chat:
   "Need to add a field to APPOINTMENT — cancelled_reason TEXT nullable.
   No FK changes. Can I run makemigrations?"

2. You check:
   - Does this change conflict with any other open migration?
   - Does this affect any FK in another module?
   - Is the migration dependency order still correct?

3. You reply:
   "Approved. Run makemigrations appointments only.
   Send me the migration file in the PR before merging."

4. Teammate runs makemigrations, commits the file, opens PR.

5. You review the migration file specifically:
   - Does it match what was discussed?
   - Are the dependencies correct?
   - Does it apply cleanly on a fresh DB?

6. You approve the PR only after the migration file is verified.
```

**How to test a migration file before approving:**

```bash
# Checkout the teammate's branch locally
git fetch origin
git checkout feat/their-module

# Apply their migration on your local DB
python manage.py migrate

# Check if it applied correctly
psql -U postgres -d ubuntu_clinic
\d "APPOINTMENT"     # verify the new field is there

# Roll it back to verify reversibility
python manage.py migrate appointments 0001
# If this fails — the migration is not reversible — reject the PR
```

---

### How Your Database Work Connects to the Backend

You wrote the models. Every backend module builds on top of them. Here is how that connection works.

**What you give each module:**

- The model class — `Patient`, `Staff`, `Appointment`, etc.
- The `db_table` Meta name — must match the ERD exactly
- The field definitions — data types, constraints, defaults
- The FK relationships — which model references which

**What each module does with it:**

```python
# Module 2 does NOT rewrite the Patient model
# It imports it and writes a serializer and view on top

from patients.models import Patient

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient           # ← the model you wrote
        fields = [...]

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()   # ← ORM on your model
    serializer_class = PatientSerializer
```

**The contract between you and the backend modules:**

You guarantee:
- Model field names are stable and match the ERD
- FK relationships are correctly defined
- `db_table` names match Phase 2 exactly
- Migrations run cleanly in dependency order

They guarantee:
- They do not modify model files — they only import them
- They tell you before adding any field
- They never run `makemigrations` without your approval

---

### How the Backend Connects to the Frontend

The frontend never touches your database. The connection happens through the API layer. Here is exactly how it flows:

```
Your PostgreSQL schema
         │
         │  Django ORM (Data Access Layer)
         ▼
Django View + Serializer (Application Layer)
         │
         │  HTTP JSON response at /api/v1/endpoint/
         ▼
React service function in src/services/
         │
         │  Data passed as props
         ▼
React component renders it
```

**Your responsibility in this chain:**

- Schema is correct and stable — the foundation everything else builds on
- Models expose the right fields — serializers can only work with what you defined
- Migrations run on the production DB — Render deployment depends on this

**What the frontend contract looks like:**

When Module 4 books an appointment, the frontend calls:

```
POST /api/v1/appointments/
```

The Django view queries your `APPOINTMENT` table via the ORM, creates the record, and returns JSON. The frontend never knows or cares what the table looks like — it only sees the JSON response. Your schema is invisible to React.

This is why schema stability is your most important responsibility. If you rename `slot_id` to `timeslot_id` mid-sprint, Module 4's serializer breaks, Module 5's check-in breaks, Module 7's notification breaks, and the frontend booking page breaks — all from one field rename.

---

### Seed Data — `python manage.py seed_db`

You write the seed data management command in `apps/notifications/management/commands/seed_db.py`. It must populate all 12 tables with realistic, FK-linked data.

**Order of seeding matches migration dependency order:**

```python
def handle(self, *args, **options):
    self._seed_departments()      # Level 1
    self._seed_staff()            # Level 2
    self._seed_doctors()          # Level 3 — links to staff
    self._seed_patients()         # Level 1
    self._seed_user_accounts()    # Level 3 — links to patient + staff
    self._seed_timeslots()        # Level 1
    self._seed_appointments()     # Level 4 — links patient+staff+slot
    self._seed_queue_entries()    # Level 5 — links to appointment
    self._seed_medical_records()  # Level 5 — links to appointment+patient
    self._seed_notifications()    # Level 5 — links to appointment
    self._seed_audit_logs()       # Level 4 — links to user_account
```

Run after first deployment:

```bash
python manage.py seed_db
```

---

### CI Pipeline Ownership

You own `.github/workflows/ci.yml`. It runs on every PR to `dev`. The pipeline:

1. Spins up Ubuntu 22.04
2. Starts PostgreSQL 15 container
3. Installs dependencies
4. Runs all migrations
5. Runs pytest

If the pipeline fails, you investigate first. If it is a migration issue, you fix it. If it is a module test issue, you tell the relevant module owner.

---

### Deployment Ownership

You manage the Render.com deployment. Three services:

1. **PostgreSQL** — create first, copy `DATABASE_URL`
2. **Backend** — connect to GitHub repo, set env vars, build command
3. **Frontend** — connect to GitHub repo, build command

Build command for backend:

```bash
pip install -r requirements.txt && python manage.py migrate && gunicorn config.wsgi
```

First deploy only — after migrate completes:

```bash
python manage.py seed_db
```

---

## 5. Backend Module Workflow

This applies to Modules 1 through 7. You are building on top of the schema S1 created.

### Getting Started on Your Module

```bash
# Make sure you have the latest dev
git checkout dev
git pull origin dev

# Create your feature branch
git checkout -b feat/module-N-description
# Examples:
# feat/auth
# feat/patients
# feat/appointments

# Verify you are on the right branch
git branch
# Should show * feat/module-N-description
```

### What You Build — The Layer Order

Build in this exact order. Every layer depends on the one below it.

**Step 1 — Import and verify the model S1 wrote**

```python
# You do NOT write the model
# You import it from the app S1 created
from patients.models import Patient

# Verify the fields are what you expect
# Check apps/patients/models.py if unsure
```

**Step 2 — Write the serializer**

```python
# apps/patients/serializers.py
from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'patient_id', 'student_number', 'first_name',
            'last_name', 'email', 'date_of_birth',
            'registration_date', 'consent_given'
        ]
        read_only_fields = ['patient_id', 'registration_date']

    def validate_student_number(self, value):
        if not value.isdigit() or not 8 <= len(value) <= 10:
            raise serializers.ValidationError(
                "Student number must be 8 to 10 digits."
            )
        return value
```

Commit:

```bash
git add apps/patients/serializers.py
git commit -m "feat(patients): add PatientSerializer with validation"
```

**Step 3 — Write the view**

```python
# apps/patients/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Patient
from .serializers import PatientSerializer
from auth_module.permissions import IsPatient, IsAdmin

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    def get_permissions(self):
        if self.action in ['list']:
            return [IsAdmin()]
        return [IsPatient()]
```

Commit:

```bash
git add apps/patients/views.py
git commit -m "feat(patients): add PatientViewSet with RBAC permissions"
```

**Step 4 — Write the URL routing**

```python
# apps/patients/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')

urlpatterns = [
    path('', include(router.urls)),
]
```

Register in `config/urls.py`:

```python
path('api/v1/', include('patients.urls')),
```

Commit:

```bash
git add apps/patients/urls.py config/urls.py
git commit -m "feat(patients): register patient URLs at /api/v1/patients/"
```

**Step 5 — Write tests**

```python
# apps/patients/tests.py
import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_register_patient(test_user_patient):
    client = APIClient()
    response = client.post('/api/v1/patients/', {
        'student_number': '12345678',
        'first_name': 'Thabo',
        'last_name': 'Nkosi',
        'email': 'thabo@nwu.ac.za',
        'date_of_birth': '2000-01-15',
        'contact_number': '0712345678',
        'consent_given': True
    })
    assert response.status_code == 201
```

Commit:

```bash
git add apps/patients/tests.py
git commit -m "test(patients): add patient registration test"
```

### Telling S1 You Need a Migration

If you need to add a field or change a model:

1. Post in group chat: **"[MIGRATION REQUEST] I need to add `allergies TEXT NULL` to PATIENT. No FK impact. Can I run makemigrations?"**
2. Wait for S1 to confirm
3. Run `python manage.py makemigrations patients` only after confirmation
4. Commit the migration file
5. Tag S1 as reviewer on your PR

Never run `makemigrations` without S1 approval.

### Testing Your Endpoints Before Frontend Exists

Use curl or Postman to verify your endpoints work before Module 8 connects them.

```bash
# Get a JWT token first
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testpatient", "password": "testpass"}'

# Use the token to call your endpoint
curl -X GET http://localhost:8000/api/v1/patients/1/ \
  -H "Authorization: Bearer <your_access_token>"
```

Post in group chat when your endpoints are ready: **"Module 2 endpoints are live on dev. /api/v1/patients/ and /api/v1/patients/{id}/records/ are working. Module 8 can connect."**

---

## 6. Frontend Workflow

This applies to Module 8 and anyone building React pages.

### The Core Rule

React never calls the database. React never calls axios directly in a component. All HTTP calls go through a service function in `src/services/`.

```javascript
// ❌ Wrong — axios called directly in a component
const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  useEffect(() => {
    axios.get('/api/v1/patients/1/').then(res => setPatient(res.data));
  }, []);
};

// ✅ Correct — service function called from component
import { getPatient } from '../services/patientService';

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  useEffect(() => {
    getPatient(1).then(data => setPatient(data));
  }, []);
};
```

### Setting Up the Axios Instance

All service files import from one shared axios instance:

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Writing a Service File

One service file per backend app:

```javascript
// src/services/patientService.js
import api from './api';

export const getPatient = async (id) => {
  const response = await api.get(`/api/v1/patients/${id}/`);
  return response.data;
};

export const updatePatient = async (id, data) => {
  const response = await api.patch(`/api/v1/patients/${id}/`, data);
  return response.data;
};

export const getMedicalRecords = async (patientId) => {
  const response = await api.get(`/api/v1/patients/${patientId}/records/`);
  return response.data;
};
```

### Working Before the Backend Is Ready — Mocking

When a backend endpoint is not yet merged, mock the response temporarily:

```javascript
// src/services/patientService.js
export const getPatient = async (id) => {
  // TODO: remove mock when Module 2 is merged to dev
  return {
    patient_id: 1,
    first_name: "Thabo",
    last_name: "Nkosi",
    email: "thabo@nwu.ac.za"
  };
};
```

When the real endpoint is merged, replace the mock with the real call. The component never changes — only the service function changes.

### AuthContext — JWT Management

```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import { loginUser, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const login = async (username, password) => {
    const data = await loginUser(username, password);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data);
    setRole(data.role);
  };

  const logout = async () => {
    await logoutUser(localStorage.getItem('refresh_token'));
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Protected Routes

```javascript
// src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### Frontend Git Workflow

Same as backend — feature branches, conventional commits, PR to dev.

```bash
git checkout -b feat/patient-dashboard
# Build the page
git add frontend/src/pages/patient/
git commit -m "feat(patient-dashboard): add appointment list and profile view"
git push origin feat/patient-dashboard
# Open PR targeting dev
```

---

## 7. Cross-Module Collaboration

### The Dependency Rules in Practice

**Module 4 (Appointment) depends on Module 2 and 3**

Module 4 cannot fully build its booking endpoint until:
- `PATIENT` table exists — for `patient_id` FK ✅ (S1 wrote this on Day 1)
- `STAFF` table exists — for `staff_id` FK ✅ (S1 wrote this on Day 1)
- `TIMESLOT` table exists — for `slot_id` FK ✅ (S1 wrote this on Day 1)
- Module 2 endpoint `/api/v1/patients/{id}/` works — so frontend can pre-fill patient info
- Module 3 endpoint `/api/v1/timeslots/?date=&available=true` works — so frontend can show available slots

Module 4 can build the booking logic from Day 1 because S1 wrote all the models. Module 4 only needs to wait for Module 2 and 3 endpoints before the full booking flow works end-to-end.

**Module 5 (Queue) depends on Module 4**

Module 5 cannot create `QUEUE_ENTRY` records without `APPOINTMENT` records existing. Module 5 waits for Module 4 to merge before testing the check-in flow end-to-end.

**Module 7 (Notifications) depends on Module 4**

Notifications are triggered by appointment events. Module 7 writes the notification logic and connects it to Module 4 via a Django post-save signal. Module 7 can write the logic independently — it just needs Module 4 merged to test it.

### Communication Protocol

Post in the group chat at these moments — every time, no exceptions:

| When | What to Post | Example |
|---|---|---|
| Starting a module | What you are building today | "Starting Module 3 — building Staff model views and timeslot availability endpoint" |
| Finishing an endpoint | Endpoint is ready for integration | "Module 2 done — GET /api/v1/patients/{id}/ and GET /api/v1/patients/{id}/records/ are live on dev" |
| Needing a migration | Migration request with details | "[MIGRATION REQUEST] Adding priority field to APPOINTMENT — VARCHAR(10) DEFAULT NORMAL — no FK impact" |
| Opening a PR | PR link + what it contains | "PR open — feat/patients — adds Patient CRUD endpoints. S1 tagged for migration review" |
| Blocked | What is blocking you | "Blocked on Module 4 — need APPOINTMENT endpoint before I can test queue check-in" |
| Finding a bug in another module | Describe it clearly | "Bug in Module 4 — POST /api/v1/appointments/ returns 500 when slot_id is invalid instead of 400" |

### API Contract Agreement

Before Module 8 connects a frontend page to a backend endpoint, both sides agree on the exact request and response shape. This is done in the group chat.

**Example contract agreement:**

```
Module 4 posts:
"Booking endpoint contract:

POST /api/v1/appointments/
Request:  { slot_id: int, staff_id: int, reason_for_visit: string, booking_type: string }
Response 201: { appointment_id: int, qr_code_token: string, scheduled_for: datetime }
Response 409: { error: string, code: "SLOT_UNAVAILABLE" }
Response 400: { error: string, code: "INVALID_DATE" }

Module 8 — does this work for the booking form?"

Module 8 replies: "Confirmed. Building the booking form against this contract."
```

---

## 8. Pull Request Workflow on GitHub

### Step 1 — Prepare Your Branch

Before opening a PR, complete the self-review checklist:

```
[ ] I am on my feature branch — not dev, not main
[ ] My branch is up to date with dev (ran git merge dev)
[ ] All commits follow conventional commit format
[ ] No print() or console.log statements in the code
[ ] No commented-out code blocks
[ ] No unused imports
[ ] Serializer used for all API responses
[ ] JWT permission class applied on all protected views
[ ] If migration files present — S1 has reviewed them
[ ] Tests written and passing locally (pytest passes)
```

### Step 2 — Push Your Final Commits

```bash
git push origin feat/your-module
```

### Step 3 — Open the PR on GitHub

1. Go to the repository on GitHub
2. You will see a yellow banner: **"feat/your-module had recent pushes"** → click **"Compare & pull request"**
3. If the banner is gone: click **"Pull requests"** tab → click **"New pull request"**

**Set the base branch correctly:**

```
base: dev  ←  THIS IS CRITICAL
compare: feat/your-module
```

Never set base to `main`.

### Step 4 — Fill in the PR Description

Every field is required. A vague description is a rejection reason.

**Title format:**

```
feat(patients): add Patient CRUD endpoints and medical record access
```

**Description template:**

```markdown
## What changed
Added PatientViewSet with full CRUD, PatientSerializer with validation,
medical record endpoint, and URL routing at /api/v1/patients/.

## Why it changed
Implements Module 2 spec — patients need to register, view, and
update their profiles and access medical history.

## How to test
1. python manage.py migrate
2. POST /api/v1/patients/ with valid patient data → expect 201
3. GET /api/v1/patients/1/ with JWT → expect 200 with patient data
4. GET /api/v1/patients/1/records/ with doctor JWT → expect 200
5. SELECT * FROM "PATIENT"; in psql to verify DB record

## Migration impact
No new migrations. Uses existing PATIENT and MEDICAL_RECORD tables
created by S1 in the initial scaffold.

## Linked issue
Closes #2
```

### Step 5 — Assign Reviewers

On the right sidebar of the PR:

- Click **Reviewers**
- Add at minimum 2 teammates
- If your PR contains migration files — **S1 must be one of the reviewers**
- Add a label: `feat`, `fix`, `db`, or `docs`
- Link the issue under **Development**

### Step 6 — Wait for Review

While waiting:
- Do not force-push to your branch — it resets the reviewer's view
- Do not merge without approvals — even if you are in a hurry
- Check the CI status — a red X means tests are failing — fix before asking for review

### Step 7 — Responding to Review Comments

When a reviewer leaves a comment:

**On GitHub:**
1. Read every comment before making any changes
2. Categorize each comment — Must Fix / Suggestion / Nitpick
3. Fix all Must Fix items first
4. Reply to each comment with what you did: **"Fixed in commit abc1234"**
5. Click **Resolve conversation** after fixing

**In your code:**

```bash
# Make the fix on your feature branch
git add apps/patients/views.py
git commit -m "fix(patients): address PR review — add missing permission check"
git push origin feat/your-module
# GitHub auto-updates the PR — no need to close and reopen
```

After all fixes are pushed — click **Re-request review** next to each reviewer's name.

### Step 8 — Merging the PR

Once you have 2 approvals and CI is green:

1. Click the **Merge pull request** dropdown arrow
2. Select **Squash and merge** — never use regular merge or rebase
3. Edit the squash commit message to be a clean conventional commit:

```
feat(patients): add Patient CRUD endpoints and medical record access
```

4. Click **Confirm squash and merge**
5. Click **Delete branch** — always delete the feature branch after merge

### Step 9 — After Merge

```bash
# Update your local dev
git checkout dev
git pull origin dev

# Delete the local feature branch
git branch -d feat/your-module

# Post in group chat
# "Module 2 merged to dev — Patient CRUD and /records/ endpoint live"
```

---

## 9. When Things Go Wrong

### Migration Conflict

**Symptoms:** `python manage.py migrate` fails with an inconsistent migration history error.

**Cause:** Two team members created migrations for the same app without coordinating.

**Fix:**

```bash
# Step 1 — Tell S1 immediately
# Do not try to fix this alone

# Step 2 — S1 identifies which migrations conflict
python manage.py showmigrations

# Step 3 — S1 resolves by:
# - Deleting the conflicting migration file
# - Regenerating a clean migration that combines both changes
python manage.py makemigrations --merge

# Step 4 — Everyone pulls dev and re-migrates
git checkout dev
git pull origin dev
python manage.py migrate
```

**Prevention:** Always ask S1 before running `makemigrations`. Always.

---

### Merge Conflict

**Symptoms:** `git merge dev` outputs: `CONFLICT (content): Merge conflict in <filename>`

**Fix:**

```bash
# Step 1 — See all conflicting files
git status

# Step 2 — Open each conflicting file
# Find the conflict markers:
<<<<<<< HEAD         ← your version
your code here
=======
their code here
>>>>>>> dev          ← incoming version

# Step 3 — Decide the correct version
# Edit the file to remove all markers and keep the right code

# Step 4 — Stage resolved files
git add <resolved-file>

# Step 5 — Complete the merge
git commit -m "merge: resolve conflict in <filename>"

# Step 6 — Push
git push origin feat/your-module
```

---

### Broken CI — Tests Failing on Your PR

**Symptoms:** Red X on your PR — CI failed.

**Fix:**

```bash
# Step 1 — Click the red X on GitHub to see which tests failed
# Read the full error message

# Step 2 — Reproduce locally
cd backend
pytest --tb=short -v

# Step 3 — Fix the failing test or the code it is testing
# Commit and push the fix
git add .
git commit -m "fix(patients): fix failing serializer test"
git push origin feat/your-module

# Step 4 — CI re-runs automatically on push
# Wait for the green checkmark before asking for re-review
```

---

### Someone Pushed Directly to Dev

**Symptoms:** `git log --oneline dev` shows a commit that was not from a PR.

**Action:** Tell S1 immediately.

**S1 fix:**

```bash
# Identify the bad commit hash
git log --oneline dev

# Reset dev to before the bad commit
git checkout dev
git reset --hard <last-clean-commit-hash>
git push origin dev --force-with-lease

# Tell everyone
# "Dev was force-reset. Everyone must re-pull dev now."
```

**Everyone else:**

```bash
git checkout dev
git fetch origin
git reset --hard origin/dev
```

---

### Your Branch Is Far Behind Dev

**Symptoms:** PR shows "This branch is out of date with the base branch."

**Fix:**

```bash
git checkout dev
git pull origin dev
git checkout feat/your-module
git merge dev
# Resolve any conflicts
git push origin feat/your-module
```

---

### You Accidentally Committed Sensitive Data (API Key, Password)

**Action:** Tell S1 immediately. Do not push.

**If not yet pushed:**

```bash
git reset --soft HEAD~1
# Remove the sensitive file
git restore <file>
# Add the file to .gitignore
echo "backend/.env" >> .gitignore
git add .gitignore
git commit -m "chore: remove sensitive data and update gitignore"
```

**If already pushed:** Tell S1 — the secret must be rotated (regenerated) immediately because it is now in git history permanently.

---

## 10. Sprint Timeline

### Day-by-Day Schedule

| Day | Date | S1 DB Lead | Module 1 Auth | Modules 2 + 3 | Module 4 | Modules 5 + 6 + 7 | Module 8 |
|---|---|---|---|---|---|---|---|
| 1 | 4 May | Repo setup · scaffold · all 12 models · migrations · push to dev | Clone dev · read models · plan endpoints | Clone dev · read models · plan endpoints | Clone dev · read models · plan endpoints | Clone dev · read models | Clone dev |
| 2 | 5 May | CI pipeline · conftest.py · seed_db skeleton | JWT login + register endpoints | Start serializers | Wait for Gate 1 | Wait for Gate 1 | Start mocking service files |
| 3 | 6 May | Review Module 1 migration if any · support team | JWT refresh + logout · permission classes | Finish serializers · start views | Wait for Gate 1 | Wait for Gate 1 | Build login + register pages |
| 4 | 7 May | Review PRs · migration governance | Open PR · **GATE 1 — merge to dev** | Finish views + URLs | Clone dev after Gate 1 · start booking logic | Start building after Gate 1 | Wire auth pages to real API |
| 5 | 8 May | Support all modules · review PRs | Done — support Module 8 | Write tests · open PRs | Booking endpoint · transaction lock | Build endpoints | Build patient + doctor pages |
| 6 | 9 May | Review migration PRs | — | Merge to dev | QR generation · cancel endpoint | Build endpoints | Continue pages |
| 7 | 10 May | Check-in meeting · review all open PRs | — | Done | Open PR · **GATE 2 — merge to dev** | Start building after Gate 2 | Wire pages to real API |
| 8 | 11 May | Support deployment prep | — | — | Done — support Module 8 | Build and test endpoints | Full integration sprint |
| 9 | 12 May | Seed data complete · test full flow | — | — | — | Open PRs · merge to dev | pytest suite |
| 10 | 13 May | Check-in meeting · pre-deploy check | — | — | — | Done | Fix failing tests |
| 11 | 14 May | Deploy to Render · verify live URL | — | — | — | — | Final integration |
| 12 | 15 May | Verify seed data on production DB | — | — | — | — | README update |
| 13 | 16 May | Final sign-off meeting · verify examiner URL | All | All | All | All | All |
| 14 | 17 May | Buffer — fix critical bugs only | — | — | — | — | — |
| **Sub** | **18 May** | **Submit GitHub repo + live Render URL** | | | | | |

### The Two Non-Negotiable Gates

```
GATE 1 — Day 4
Module 1 (Auth) merges to dev
JWT login, register, refresh, logout all working
Three permission classes defined and tested
NO ONE builds protected endpoints until this is green

GATE 2 — Day 7
Module 4 (Appointment) merges to dev
Booking with transaction lock working
QR generation working
Cancel endpoint working
Module 5 and Module 7 cannot test end-to-end until this is green
```

### The Four Check-In Meetings

| Meeting | Date | Each Person Reports |
|---|---|---|
| **Check-in 1** | 7 May | "My module is on feat/X. Model imported. First endpoint: [URL]. Status: in progress / done." |
| **Check-in 2** | 10 May | "My endpoints: [list]. My React page: [done / in progress]. I need from: [module name]." |
| **Check-in 3** | 13 May | "All my endpoints return correct data from PostgreSQL. My PR is open / merged. My React page is connected." |
| **Check-in 4** | 16 May | "Final sign-off. Everyone opens live Render URL together. Every feature walked through once." |

---

*Ubuntu Campus Clinic — Appointment System · Group 19 · CMPG 311 · DBMS Module*
*Document lives at `TEAM_WORKFLOW.md` · Referenced from `README.md` and `CONTRIBUTING.md`*
