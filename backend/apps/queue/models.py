from django.db import models


class QueueEntry(models.Model):
    """
    Check-in record: one per appointment. Tracks queue position, consultation start/end times,
    and room assignment. Status transitions: WAITING → IN_PROGRESS → COMPLETED or LEFT_WITHOUT_SEEN.
    """

    class Status(models.TextChoices):
        WAITING = "WAITING", "Waiting"
        IN_PROGRESS = "IN_PROGRESS", "In progress"
        COMPLETED = "COMPLETED", "Completed"
        LEFT_WITHOUT_SEEN = "LEFT_WITHOUT_SEEN", "Left without being seen"

    queue_entry_id = models.BigAutoField(primary_key=True)
    appointment = models.OneToOneField(
        "appointments.Appointment",
        on_delete=models.PROTECT,
        db_column="appointment_id",
        related_name="queue_entry",
        unique=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.WAITING,
    )
    checked_in_at = models.DateTimeField(auto_now_add=True)
    consult_start_time = models.TimeField(null=True, blank=True)
    consult_end_time = models.TimeField(null=True, blank=True)
    room_number = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = "QUEUE_ENTRY"
        indexes = [
            models.Index(fields=["appointment_id"], name="QUEUE_ENTRY_appointment_id_idx"),
        ]

    def __str__(self) -> str:
        return f"QueueEntry {self.queue_entry_id} — {self.appointment} ({self.status})"
