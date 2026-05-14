from werkzeug.security import check_password_hash, generate_password_hash

import db.user_account_repo as user_account_repo
import db.patient_repo as patient_repo
from utils import jwt_helper


def login(username, password):
    row = user_account_repo.get_user_by_username(username)
    if not row:
        raise ValueError("INVALID_CREDENTIALS")

    # row: (user_account_id, username, password_hash, patient_id, staff_id, role, status)
    user_id, uname, password_hash, patient_id, staff_id, role, status = row

    if status != "ACTIVE":
        raise ValueError("ACCOUNT_DISABLED")

    if not check_password_hash(password_hash, password):
        raise ValueError("INVALID_CREDENTIALS")

    user_row = user_account_repo.get_user_by_id(user_id)
    # user_row: (user_account_id, username, email, role, status, patient_id, staff_id, date_joined)
    email = user_row[2] if user_row else ""

    payload = {"user_id": user_id, "username": uname, "role": role}
    access_token = jwt_helper.encode_token(payload)
    refresh_token = jwt_helper.encode_refresh_token(payload)

    return {
        "access": access_token,
        "refresh": refresh_token,
        "role": role,
        "user": {"id": user_id, "username": uname, "email": email},
    }


def register(username, email, password):
    existing = user_account_repo.get_user_by_username(username)
    if existing:
        raise ValueError("USERNAME_EXISTS")

    password_hash = generate_password_hash(password)

    parts = username.split(".", 1)
    first_name = parts[0].capitalize() if parts else username
    last_name = parts[1].capitalize() if len(parts) > 1 else "User"

    patient_id = patient_repo.create_patient(
        student_number=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        contact_number="0000000000",
        date_of_birth="2000-01-01",
        street="Unknown",
        city="Unknown",
        postal_code="0000",
    )

    user_id = user_account_repo.create_patient_user(username, password_hash, patient_id)

    return {
        "message": "Registration successful",
        "user": {"id": user_id, "username": username, "email": email, "role": "PATIENT"},
    }


def logout(refresh_token):
    jwt_helper.blacklist_token(refresh_token)


def get_current_user(user_id):
    row = user_account_repo.get_user_by_id(user_id)
    if not row:
        return None
    # row: (user_account_id, username, email, role, status, patient_id, staff_id, date_joined)
    return {"id": row[0], "username": row[1], "email": row[2], "role": row[3]}
