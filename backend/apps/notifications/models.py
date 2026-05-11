from django.core.exceptions import ValidationError
from django.db import models


class Notification(models.Model):
    """
    Email and notification delivery log. Optional patient and/or staff recipient.
    At least one of patient or staff must be set (CHECK constraint enforced at DB level).
    """

    class Channel(models.TextChoices):
        EMAIL = "EMAIL", "Email"
        SMS = "SMS", "SMS"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SENT = "SENT", "Sent"
        FAILED = "FAILED", "Failed"

    notification_id = models.BigAutoField(primary_key=True)
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="patient_id",
        related_name="notifications",
    )
    staff = models.ForeignKey(
        "doctors.Staff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="staff_id",
        related_name="notifications",
    )
    appointment = models.ForeignKey(
        "appointments.Appointment",
        on_delete=models.CASCADE,
        db_column="appointment_id",
        related_name="notifications",
    )
    channel = models.CharField(max_length=10, choices=Channel.choices)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "NOTIFICATION"
        constraints = [
            models.CheckConstraint(
                check=models.Q(patient__isnull=False)
                | models.Q(staff__isnull=False),
                name="check_notification_patient_or_staff",
            ),
        ]
        indexes = [
            models.Index(fields=["appointment_id"], name="NOTIF_appointment_id_idx"),
        ]

    def __str__(self) -> str:
        recipient = self.patient or self.staff
        return f"Notification {self.notification_id} — {self.status} to {recipient}"

    def clean(self) -> None:
        super().clean()
        if self.patient_id is None and self.staff_id is None:
            raise ValidationError(
                {
                    "patient": "Link at least one of patient or staff.",
                    "staff": "Link at least one of patient or staff.",
                }
            )
