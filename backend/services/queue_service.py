import db.queue_repo as queue_repo


def check_in_patient(appointment_id):
    existing = queue_repo.get_queue_for_appointment(appointment_id)
    if existing:
        return {
            "queue_entry_id": existing[0],
            "appointment_id": existing[1],
            "status": existing[2],
        }
    entry_id = queue_repo.create_queue_entry(appointment_id)
    return {
        "queue_entry_id": entry_id,
        "appointment_id": appointment_id,
        "status": "WAITING",
    }


def get_queue_position(appointment_id):
    entry = queue_repo.get_queue_for_appointment(appointment_id)
    if not entry:
        return None
    return {
        "queue_entry_id": entry[0],
        "appointment_id": entry[1],
        "status": entry[2],
        "checked_in_at": entry[3].isoformat() if entry[3] else None,
        "room_number": entry[6],
    }
