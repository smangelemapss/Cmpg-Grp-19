from flask import Blueprint, g, request

import services.appointment_service as appointment_service
from utils.error_handler import error_response, success_response
from utils.jwt_helper import require_auth

appointments_bp = Blueprint("appointments", __name__, url_prefix="/api/v1")


@appointments_bp.route("/appointments/upcoming/", methods=["GET"])
@require_auth(roles=["PATIENT"])
def upcoming_appointments():
    try:
        data = appointment_service.get_upcoming(g.user_id)
    except ValueError:
        return error_response("Patient profile not found", "NOT_FOUND", 404)
    except Exception:
        return error_response("Unable to load appointments", "SERVER_ERROR", 500)
    return success_response(data)


@appointments_bp.route("/appointments/history/", methods=["GET"])
@require_auth(roles=["PATIENT"])
def appointment_history():
    try:
        data = appointment_service.get_history(g.user_id)
    except ValueError:
        return error_response("Patient profile not found", "NOT_FOUND", 404)
    except Exception:
        return error_response("Unable to load visit history", "SERVER_ERROR", 500)
    return success_response(data)


@appointments_bp.route("/appointments/pending-results/", methods=["GET"])
@require_auth(roles=["PATIENT"])
def pending_results():
    try:
        data = appointment_service.get_pending_results(g.user_id)
    except ValueError:
        return error_response("Patient profile not found", "NOT_FOUND", 404)
    except Exception:
        return error_response("Unable to load pending results", "SERVER_ERROR", 500)
    return success_response(data)


@appointments_bp.route("/appointments/book/", methods=["POST"])
@require_auth(roles=["PATIENT"])
def book_appointment():
    data = request.get_json(silent=True) or {}
    try:
        result = appointment_service.book_appointment(g.user_id, data)
    except ValueError as exc:
        msg = str(exc)
        if msg.startswith("MISSING_FIELD:"):
            field = msg.split(":")[1]
            return error_response(f"Field '{field}' is required", "VALIDATION_ERROR", 400)
        return error_response(msg, "VALIDATION_ERROR", 400)
    except LookupError:
        return error_response("No available slot found for the given time", "NO_SLOT_FOUND", 404)
    except ValueError as exc:
        if "SLOT_UNAVAILABLE" in str(exc):
            return error_response("Slot already booked", "SLOT_UNAVAILABLE", 409)
        return error_response(str(exc), "VALIDATION_ERROR", 400)
    except Exception as exc:
        if "SLOT_UNAVAILABLE" in str(exc):
            return error_response("Slot already booked", "SLOT_UNAVAILABLE", 409)
        return error_response("Failed to book appointment", "SERVER_ERROR", 500)
    return success_response(result, 201)


@appointments_bp.route("/doctors/", methods=["GET"])
@require_auth(roles=["PATIENT"])
def list_doctors():
    try:
        data = appointment_service.get_all_doctors()
    except Exception:
        return error_response("Unable to load doctors", "SERVER_ERROR", 500)
    return success_response(data)


@appointments_bp.route("/timeslots/", methods=["GET"])
@require_auth(roles=["PATIENT"])
def available_timeslots():
    date_str = request.args.get("date")
    if not date_str:
        return error_response("Query parameter 'date' is required", "MISSING_DATE", 400)

    doctor_id = request.args.get("doctor_id")
    if doctor_id:
        try:
            doctor_id = int(doctor_id)
        except ValueError:
            return error_response("doctor_id must be an integer", "VALIDATION_ERROR", 400)

    try:
        data = appointment_service.get_available_slots(date_str, doctor_id)
    except Exception:
        return error_response("Unable to load timeslots", "SERVER_ERROR", 500)
    return success_response(data)
