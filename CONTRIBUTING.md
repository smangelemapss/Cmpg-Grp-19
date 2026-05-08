# Contributing to CBS — Clinic Booking System

Welcome to the team! 🎉

CBS is a CMPG 311 DBMS module project. Our goal is to build a production-grade Clinic Appointment System while mastering real-world software engineering practices — git workflows, code reviews, database design, and API development.

We want this to be a place where you can learn, make mistakes safely, and grow. To keep our codebase clean and our collaboration smooth, please follow the guidelines below.

---

## 🚀 The Golden Rules

1. **Be Kind:** We are all learning. Constructive feedback is a gift — give it respectfully and receive it gracefully.
2. **The Database is Sacred:** Our primary exam deliverable is the PostgreSQL schema. No column renames, table renames, or structural changes without telling S1 (DB Lead) first.
3. **Code is Read More Than Written:** Write clean, self-documenting code. If you need a comment to explain _what_ the code does, simplify the code first.
4. **Leave It Better Than You Found It:** If you spot a typo or messy formatting in a file you are already touching, fix it.

---

## 🛠 Workflow & Branching

We follow a strict **Feature Branch Workflow**. We never push directly to `main` or `dev`.

### Branch Structure

- **`main`** — Production-ready code only. Receives merges from `dev` at the end of the sprint. Do not touch.
- **`dev`** — Integration branch. **All Pull Requests target `dev`.** This is where the team's work comes together.
- **`feat/your-branch`** — Your working branch. One branch per module or concern.

### Branch Naming Convention

```
type/short-description
```

| Prefix | Use For | Example |
|---|---|---|
| `feat/` | New module or feature | `feat/patients` |
| `fix/` | Bug fix | `fix/appointment-double-booking` |
| `db/` | Migration or schema change | `db/add-queue-index` |
| `docs/` | Documentation changes | `docs/update-readme` |
| `chore/` | Maintenance, dependency updates | `chore/update-requirements` |
| `refactor/` | Code restructure, no feature change | `refactor/patient-serializer` |

> **One module per branch. Never mix concerns.** A branch that touches both patients and appointments makes review and rollback impossible.

---

## 📝 Commits

We follow **Conventional Commits**. This keeps history readable, helps the team debug, and makes the examiner's git log review impressive.

**Format:** `type(scope): description`

The scope should be the table name or module name — keep it specific.

**Examples:**

```bash
# ✅ Correct
feat(patients): add Patient model and initial migration
feat(auth): add JWT login and register endpoints
fix(appointments): resolve UNIQUE constraint on slot_id
db(queue): add index on check_in_time column
docs(readme): add API endpoints table
test(patients): add PatientSerializer unit tests
chore(deps): pin psycopg2-binary to 2.9.9

# ❌ Wrong
git commit -m "done"
git commit -m "fixed stuff"
git commit -m "wip"
git commit -m "changes"
```

**Commit as you go.** One commit per meaningful unit of work — not one giant commit at the end of the sprint. The examiner reads git history. Sparse commits look like one person did everything.

---

## 🗄 Database & Migration Rules

These rules exist because migration conflicts are the single biggest risk in a 9-person Django project.

### Before Running `makemigrations`

1. Post in the group chat: _"About to makemigrations for \[app name\] — anyone else busy with that app?"_
2. Wait for S1 to confirm no conflicts.
3. Run `python manage.py makemigrations <app_name>`.
4. Do **not** commit the migration file until S1 has reviewed it.

### The Migration Review Rule

**Every migration file must be reviewed by S1 before it is committed to `dev`.**

Tag S1 as a reviewer on any PR that includes a file matching `*/migrations/*.py`. This is non-negotiable — a bad migration that gets merged can break `python manage.py migrate` for everyone on the team.

### Schema Is Locked

The 12 tables from Phase 2 are the agreed schema. Do not:
- Rename a column
- Add a new table
- Change a field type
- Add or remove a FK constraint

...without posting in the group chat first and getting S1's written sign-off. Everyone's foreign keys depend on these exact names.

---

## 📝 Pull Requests (PRs)

The PR is where learning happens. Take it seriously.

### Step 1 — Self-Review First

Before opening a PR, review your own code as if you are a stranger reading it. Check for:

- No `print()` or `console.log` statements left behind
- No commented-out code blocks
- No unused imports
- All error cases return proper HTTP status codes (not just 200)
- Serializer used for all API responses — no raw `model.__dict__` returns
- Migration files reviewed by S1

### Step 2 — PR Description

Every field is required. A vague PR description signals you did not review your own work.

```
Title:      feat(patients): add Patient model, serializer, and CRUD API

What changed:
  Added Patient model, PatientContact model, PatientSerializer,
  PatientViewSet, URL routing, and 2 migration files.

Why it changed:
  Implements Module 2 spec — patients need to register and manage profiles.

How to test:
  1. python manage.py migrate
  2. POST /api/patients/ with { "student_number": "43224105", ... }
  3. GET /api/patients/ — verify list returns
  4. Check PATIENT table in psql: SELECT * FROM "PATIENT";

Migration impact:
  Creates PATIENT and PATIENT_CONTACT tables.
  S1 reviewed migration files — see PR comment thread.

Linked issue: Closes #2
```

### Step 3 — The Rule of Two

A PR requires **2 approvals** to merge into `dev`:

- 1 peer approval (any teammate)
- 1 S1 approval (required if migration files are present)

No exceptions. No deadline pressure overrides this.

### Step 4 — Squash and Merge

When merging, always choose **Squash and merge** on GitHub. This keeps the `dev` branch history clean — one meaningful commit per feature, not forty "wip" commits.

Edit the squash message to be a clean conventional commit.

### After Merge

1. Delete your branch on GitHub (GitHub will prompt you).
2. `git checkout dev && git pull origin dev` locally.
3. `git branch -d feat/your-branch` to remove the local copy.
4. Post a brief update in the group chat: what shipped, any follow-up needed.

---

## 🎨 Coding Standards

### Backend — Django / Python

**Serializers are mandatory.**

```python
# ❌ Wrong — raw data, no validation
return Response(patient.__dict__)

# ✅ Correct — through serializer
serializer = PatientSerializer(patient)
return Response(serializer.data)
```

**ORM for CRUD, Raw SQL for reports only.**

```python
# ✅ ORM — use for all standard queries
Patient.objects.filter(consent_given=True)

# ✅ Raw SQL — only in Module 6 reporting endpoints
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT slot_date, COUNT(*) FROM ...")
```

**Model `Meta` table names must match the ERD exactly.**

```python
class Patient(models.Model):
    class Meta:
        db_table = "PATIENT"   # Must match Phase 2 ERD — no changes
```

**Permissions on every view.**

```python
class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # Never leave this off
```

**No business logic in views.** Views call serializers and return responses. Logic lives in model methods or service functions.

### Frontend — React

**The Adapter Rule: React never calls the database.**

```javascript
// ❌ Wrong — calling backend directly in a component
const res = await fetch('http://localhost:8000/api/patients/');

// ✅ Correct — through a service function
import { getPatients } from '../services/patientsService';
const patients = await getPatients();
```

All API calls live in `src/services/`. Components import service functions, not axios directly.

**No hardcoded API URLs in components.** Use the base URL from a config or environment variable.

---

## 🏗 Architecture: The Three-Layer Rule

Every data request in CBS follows this exact path — no shortcuts:

```
React Component
      ↓  (calls service function)
src/services/*.js
      ↓  (axios → /api/ endpoint)
Django View + Serializer
      ↓  (ORM or raw SQL)
PostgreSQL
```

Violating any layer boundary is a PR rejection reason.

---

## 🐞 Reporting Bugs

Found a bug? Open a GitHub Issue. Include:

- Steps to reproduce (exact commands or clicks)
- Expected behaviour
- Actual behaviour
- Error message or traceback (paste the full thing)
- Which module/table is affected

Vague bug reports waste debugging time. _"It doesn't work"_ is not a bug report.

---

## 🧠 The Proposal Process

If your module requires a design decision that affects other modules — for example, a new shared FK, a change to how JWT payload is structured, or a new shared endpoint — do not just start coding.

1. **Post in the group chat** with the `[PROPOSAL]` tag.
2. **Describe your approach briefly:**
   - What are you changing or adding?
   - Which tables or modules does it affect?
   - What is the migration impact?
3. **Wait for feedback** — minimum 24 hours.
4. **Get S1's sign-off** on any schema-touching proposals.
5. **Then code.**

Skipping the proposal process on cross-module changes = automatic PR rejection.

---

## 📋 Quick Reference Checklist

Before opening any PR, run through this list:

```
[ ] Branch named correctly (feat/, fix/, db/, etc.)
[ ] Conventional commit messages throughout the branch
[ ] No direct push to dev or main
[ ] No print() or console.log left in code
[ ] No commented-out blocks
[ ] Serializer used for all API responses
[ ] JWT permission applied on all protected views
[ ] If migration present — S1 has reviewed the file
[ ] PR description filled out completely (what, why, how to test)
[ ] Minimum 2 reviewers assigned
[ ] Linked to the GitHub issue
```

---

**Happy coding. Ship clean code. Keep the database intact.** 🚀
