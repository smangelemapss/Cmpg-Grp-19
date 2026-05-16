"""
Admin reporting service.
Business logic for aggregated stats and audit log queries.
All DB access goes through db/audit_repo.py and db/doctor_repo.py.

B4 (Imamelengmakutoane): implement functions here. Call repo functions,
do NOT put SQL strings in this file.
"""


def get_summary_stats(conn):
    """
    Returns dict with total_patients, total_doctors,
    appointments_today, cancellation_rate.
    """
    # TODO (B4): import audit_repo / doctor_repo and call the relevant functions
    raise NotImplementedError("admin_service.get_summary_stats not yet implemented")


def get_appointments_by_doctor(conn):
    """
    Returns list of {doctor_name, count} for chart rendering.
    """
    raise NotImplementedError("admin_service.get_appointments_by_doctor not yet implemented")


def get_daily_counts(conn, days=30):
    """
    Returns list of {date, count} for the last `days` days.
    """
    raise NotImplementedError("admin_service.get_daily_counts not yet implemented")
