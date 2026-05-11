# Contributing to Ubuntu Campus Clinic — Appointment System

Welcome to the team. 🎉

This is a CMPG 311 DBMS module project. The goal is to build a production-grade Clinic Appointment System while practising real-world software engineering — git workflows, database design, code reviews, and API development.

Read this document once before writing any code. Reference it whenever you are unsure about a process.

---

## The Golden Rules

1. **The database is sacred.** The PostgreSQL schema is the primary exam deliverable. No column renames, table renames, or structural changes without S1's written sign-off first.
2. **Be kind.** Constructive feedback is a gift — give it respectfully and receive it gracefully. Everyone is learning.
3. **Code is read more than written.** Write clean, self-documenting code. If a comment is needed to explain what the code does, simplify the code instead.
4. **One concern per branch.** A branch that mixes two modules makes review impossible and rollback destructive.

---

## Branch Model

Three types of branches. Never work directly on `main` or `dev`.

| Branch | Purpose | Who Touches It |
|---|---|---|
| `main` | Production-ready only · examiner accesses live URL from here | S1 merges `dev` into `main` at sprint end |
| `dev` | Integration branch · all PRs target here | Everyone via PR only |
| `feature/your-branch` | Your working branch · one per module or concern | The person who owns that module |

---

## Branch Naming Convention

The team uses the following agreed naming structure. Every branch name starts with `feature/` followed by the role code and a short description.

**Backend branches:**

| Branch | Owner | Purpose |
|---|---|---|
| `feature/b1-auth-api` | B1 | Auth endpoints · JWT · permissions · Django admin |
| `feature/b2-patient-api` | B2 | Patient CRUD · contacts · medical records · timeslots |
| `feature/b3-doctor-api` | B3 | Appointments · QR · queue · notifications logic |
| `feature/b4-integration` | B4 | Audit log · raw SQL reports · pytest suite |

**Frontend branches:**

| Branch | Owner | Purpose |
|---|---|---|
| `feature/f1-design-system` | F1 | App shell · AuthContext · shared components · routing |
| `feature/f2-patient-module` | F2 | Patient profile · medical history · appointment list |
| `feature/f3-doctor-module` | F3 | Doctor dashboard · Big Calendar · booking form · queue board |
| `feature/f4-appointment-booking` | F4 | Reports dashboard · audit log · notifications panel |

**S1 branches:**

| Branch | Owner | Purpose |
|---|---|---|
| `feature/s1-scaffold` | S1 | Django project setup · all 12 models · initial migrations |
| `feature/s1-seed-data` | S1 | `seed_db` management command · all 12 tables |
| `feature/s1-ci-pipeline` | S1 | GitHub Actions CI · pytest on every PR |
| `feature/s1-deployment` | S1 | Render.com config · env vars · CORS · static files |
| `feature/s1-notifications` | S1 | NOTIFICATION model · email backend |

**Additional branches for fixes and maintenance:**

```
fix/short-description          → bug fix on any module
db/short-description           → migration or schema fix
docs/short-description         → documentation update
chore/short-description        → dependency or config update
```

---

## Commits

Follow **Conventional Commits**. The format is `type(scope): description`. Scope is the table name or role code. Keep the description lowercase and imperative.

```bash
# ✅ Correct
feat(b1): add JWT login and register endpoints
feat(b2): add Patient model and CRUD serializer
feat(s1): write all 12 models and run initial migrations
fix(b3): resolve UNIQUE constraint error on slot_id booking
test(b4): add audit log middleware unit tests
db(s1): add composite index on TIMESLOT slot_date and is_available
docs(readme): update live URL after Render deployment
chore(deps): pin psycopg2-binary to 2.9.9

# ❌ Wrong
git commit -m "done"
git commit -m "fixed stuff"
git commit -m "wip"
git commit -m "changes"
```

Commit after every meaningful unit of work — model written, serializer written, view written, test written. The examiner reads git history. Sparse commits look like one person did everything.

---

## Database & Migration Rules

Migration conflicts are the highest-risk failure point in a 9-person Django project. These rules prevent them.

**Before anyone runs `makemigrations`:**

1. Post in the group chat with the exact app name and what is changing
2. Wait for S1 to confirm no conflicts with open branches
3. Run `python manage.py makemigrations <app_name>` only after S1 confirms
4. Do not commit the migration file until S1 has reviewed it in the PR

**S1 must be tagged as a reviewer on every PR that contains a migration file.** This is non-negotiable.

**Schema is locked.** The 12 tables from Phase 2 are agreed. Do not rename a column, change a field type, add a table, or remove a FK constraint without S1's approval. Every other module's FK depends on these exact names.

---

## Pull Requests

### Before Opening a PR — Self-Review Checklist

```
[ ] Branch named correctly per the convention above
[ ] Conventional commit messages throughout
[ ] No print() or console.log statements left in code
[ ] No commented-out code blocks
[ ] No unused imports
[ ] Serializer used for all API responses — no raw model.__dict__
[ ] JWT permission class applied on all protected views
[ ] If migration file present — S1 has reviewed and approved it
[ ] Tests written and passing locally
[ ] PR description filled out completely
[ ] Minimum 2 reviewers assigned
[ ] Linked to the GitHub issue
```

### PR Description Template

```
Title: feat(b2): add Patient model, serializer, and CRUD endpoints

What changed:
  Added Patient model, PatientContact model, PatientSerializer,
  PatientViewSet, URL routing, and 2 migration files.

Why it changed:
  Implements B2 spec — patients need to register and manage profiles.

How to test:
  1. python manage.py migrate
  2. POST /api/v1/patients/ with valid patient data → expect 201
  3. GET /api/v1/patients/ with admin JWT → expect list
  4. SELECT * FROM "PATIENT"; in psql to verify DB record

Migration impact:
  Creates PATIENT and PATIENT_CONTACT tables.
  S1 reviewed migration files — see PR comment thread.

Linked issue: Closes #2
```

### The Rule of Two

Every PR requires 2 approvals before merging:
- 1 peer approval (any teammate)
- 1 S1 approval (mandatory when migration files are present)

No deadline pressure overrides this.

### Merge Method

Always use **Squash and merge** on GitHub. This keeps `dev` history clean — one meaningful commit per feature. Edit the squash message to be a clean conventional commit before confirming.

---

## Coding Standards

### Backend — Django / Python

**Serializers are mandatory for every API response.**

```python
# ❌ Wrong
return Response(patient.__dict__)

# ✅ Correct
serializer = PatientSerializer(patient)
return Response(serializer.data)
```

**ORM for CRUD. Raw SQL only in `admin_reporting/queries.py`.**

```python
# ✅ ORM — all standard queries
Patient.objects.filter(consent_given=True)

# ✅ Raw SQL — reporting endpoints only
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT slot_date, COUNT(*) FROM ...")
```

**`db_table` Meta must match the ERD exactly.**

```python
class Patient(models.Model):
    class Meta:
        db_table = "PATIENT"  # matches Phase 2 ERD — never change this
```

**Permission class on every view.**

```python
class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # never leave this off
```

### Frontend — React

**The Adapter Rule: React never calls the database directly.**

```javascript
// ❌ Wrong — axios or fetch called directly in a component
const res = await fetch('http://localhost:8000/api/v1/patients/');

// ✅ Correct — through a service function
import { getPatients } from '../services/patientService';
const patients = await getPatients();
```

All API calls live in `src/services/`. No component imports axios directly. No hardcoded API URLs inside components.

---

## The Four-Layer Rule

Every data request follows this exact path. No shortcuts. Violating a layer boundary is an automatic PR rejection reason.

```
React Component
      ↓  calls service function
src/services/*.js
      ↓  axios → /api/v1/ endpoint
Django View + Serializer  (Application Layer)
      ↓  ORM method call
Django ORM  (Data Access Layer)
      ↓  SQL
PostgreSQL  (Database Layer)
```

---

## The Proposal Process

If a change affects more than one module — a new shared FK, a change to the JWT payload, a new shared endpoint — post a proposal before coding.

1. Post in the group chat with the `[PROPOSAL]` tag
2. Describe what is changing, which tables or modules it affects, and the migration impact
3. Wait 24 hours for feedback
4. Get S1's written sign-off on any schema-touching change
5. Then code

Skipping the proposal process on cross-module changes is an automatic PR rejection.

---

## Bug Reports

Open a GitHub Issue and include:

- Steps to reproduce
- Expected behaviour
- Actual behaviour
- Full error message or traceback
- Which module and table is affected

*"It doesn't work"* is not a bug report.

---

**Ship clean code. Keep the database intact. Review each other's work.** 🚀
