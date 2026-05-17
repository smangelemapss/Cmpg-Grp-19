import base64
import io
from datetime import datetime, timedelta, timezone

import qrcode

import db.patient_repo as patient_repo


def _get_patient_id(user_id):
    row = patient_repo.get_patient_by_user_id(user_id)
    if not row:
        raise ValueError("PATIENT_NOT_FOUND")
    return row[0]


def get_dashboard(user_id):
    patient_id = _get_patient_id(user_id)
    upcoming, past, pending, cancelled = patient_repo.get_dashboard_counts(patient_id)
    return {
        "upcomingCount": upcoming,
        "pastVisitsCount": past,
        "pendingResultsCount": pending,
        "cancelledCount": cancelled,
    }


def get_qr_code(user_id):
    patient_id = _get_patient_id(user_id)
    row = patient_repo.get_qr_code_data(patient_id)
    if not row:
        raise ValueError("PATIENT_NOT_FOUND")

    pid, student_number, first_name, last_name, email = row
    qr_payload = f"patient_id={pid}&student={student_number}&name={first_name} {last_name}"

    qr_img = qrcode.make(qr_payload)
    buffer = io.BytesIO()
    qr_img.save(buffer, format="PNG")
    qr_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    expires_at = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    return {
        "qr_data": f"data:image/png;base64,{qr_b64}",
        "patient_id": pid,
        "expires_at": expires_at,
    }


def get_medical_records(user_id):
    patient_id = _get_patient_id(user_id)
    rows = patient_repo.get_medical_records(patient_id)
    return [
        {
            "id": r[0],
            "date": r[1],
            "doctor": r[2],
            "diagnosis": r[3],
            "department": r[4],
        }
        for r in rows
    ]


def get_medical_record_detail(user_id, record_id):
    patient_id = _get_patient_id(user_id)
    row = patient_repo.get_medical_record_by_id(record_id, patient_id)
    if not row:
        return None
    return {
        "id": row[0],
        "date": row[1],
        "doctor": row[2],
        "diagnosis": row[3],
        "symptoms": row[4],
        "prescription": row[5],
        "department": row[6],
    }


def get_emergency_contacts(user_id):
    patient_id = _get_patient_id(user_id)
    rows = patient_repo.get_emergency_contacts(patient_id)
    result = []
    for r in rows:
        contact_id, name, phone, relationship = r
        if relationship and "|" in relationship:
            label, rel = relationship.split("|", 1)
        else:
            label = "Emergency"
            rel = relationship or ""
        result.append({
            "id": contact_id,
            "name": name,
            "relationship": rel,
            "phone": phone,
            "label": label,
        })
    return result


def add_emergency_contact(user_id, data):
    required = ["name", "relationship", "phone"]
    for field in required:
        if not data.get(field):
            raise ValueError(f"MISSING_FIELD:{field}")

    patient_id = _get_patient_id(user_id)
    label = data.get("label", "Emergency")
    contact_id = patient_repo.create_emergency_contact(
        patient_id=patient_id,
        name=data["name"],
        relationship=data["relationship"],
        phone=data["phone"],
        label=label,
    )
    return {
        "id": contact_id,
        "name": data["name"],
        "relationship": data["relationship"],
        "phone": data["phone"],
        "label": label,
    }


def update_emergency_contact(user_id, contact_id, data):
    patient_id = _get_patient_id(user_id)
    result = patient_repo.update_emergency_contact(contact_id, patient_id, **data)
    if result is None:
        return None

    rows = patient_repo.get_emergency_contacts(patient_id)
    for r in rows:
        cid, name, phone, relationship = r
        if cid == contact_id:
            if relationship and "|" in relationship:
                label, rel = relationship.split("|", 1)
            else:
                label = "Emergency"
                rel = relationship or ""
            return {
                "id": cid,
                "name": name,
                "relationship": rel,
                "phone": phone,
                "label": label,
            }
    return None


def delete_emergency_contact(user_id, contact_id):
    patient_id = _get_patient_id(user_id)
    return patient_repo.delete_emergency_contact(contact_id, patient_id)
