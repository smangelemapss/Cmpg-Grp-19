from django.db import models


class Appointment(models.Model):
    """
    Core booking row: one appointment per timeslot (UNIQUE slot_id at DB level).
    Patient, staff, and slot deletes are guarded with PROTECT where required by design.
    """

    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        CONFIRMED = "CONFIRMED", "Confirmed"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        NO_SHOW = "NO_SHOW", "No show"

    class BookingType(models.TextChoices):
        SICK = "SICK", "Sick visit"
        FOLLOW_UP = "FOLLOW_UP", "Follow-up"
        WALK_IN = "WALK_IN", "Walk-in"
        VIRTUAL_TRIAGE = "VIRTUAL_TRIAGE", "Virtual triage"

    class Priority(models.TextChoices):
        NORMAL = "NORMAL", "Normal"
        URGENT = "URGENT", "Urgent"

    appointment_id = models.BigAutoField(primary_key=True)
    slot = models.OneToOneField(
        "doctors.TimeSlot",
        on_delete=models.PROTECT,
        db_column="slot_id",
        related_name="appointment",
        unique=True,
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.PROTECT,
        db_column="patient_id",
        related_name="appointments",
        db_index=False,
    )
    staff = models.ForeignKey(
        "doctors.Staff",
        on_delete=models.PROTECT,
        db_column="staff_id",
        related_name="appointments",
        db_index=False,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
    )
    booking_type = models.CharField(
        max_length=20,
        choices=BookingType.choices,
        default=BookingType.SICK,
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.NORMAL,
    )
    qr_code_token = models.UUIDField(null=True, blank=True, unique=True)

    class Meta:
        db_table = "APPOINTMENT"
        indexes = [
            models.Index(fields=["patient_id"], name="APPOINTMENT_patient_id_idx"),
            models.Index(fields=["staff_id"], name="APPOINTMENT_staff_id_idx"),
        ]

    def __str__(self) -> str:
        return f"Appointment {self.appointment_id} ({self.status})"
