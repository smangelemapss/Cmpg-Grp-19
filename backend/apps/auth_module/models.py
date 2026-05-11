from django.core.exceptions import ValidationError
from django.db import models


class UserAccount(models.Model):
    """
    Portal login: optional link to a patient row and/or a staff row.
    At least one of patient or staff must be set (SYSTEM_DESIGN CHECK constraint).
    """

    class Role(models.TextChoices):
        PATIENT = "PATIENT", "Patient"
        DOCTOR = "DOCTOR", "Doctor"
        NURSE = "NURSE", "Nurse"
        ADMIN = "ADMIN", "Admin"
        RECEPTIONIST = "RECEPTIONIST", "Receptionist"

    class AccountStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        LOCKED = "LOCKED", "Locked"
        DISABLED = "DISABLED", "Disabled"

    user_account_id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        db_column="patient_id",
        related_name="user_accounts",
    )
    staff = models.ForeignKey(
        "doctors.Staff",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        db_column="staff_id",
        related_name="user_accounts",
    )
    role = models.CharField(max_length=20, choices=Role.choices)
    status = models.CharField(
        max_length=20,
        choices=AccountStatus.choices,
        default=AccountStatus.ACTIVE,
    )

    class Meta:
        db_table = "USER_ACCOUNT"
        constraints = [
            models.CheckConstraint(
                check=models.Q(patient__isnull=False)
                | models.Q(staff__isnull=False),
                name="USER_ACCOUNT_patient_or_staff_chk",
            ),
        ]

    def __str__(self) -> str:
        return self.username

    def clean(self) -> None:
        super().clean()
        if self.patient_id is None and self.staff_id is None:
            raise ValidationError(
                {
                    "patient": "Link at least one of patient or staff.",
                    "staff": "Link at least one of patient or staff.",
                }
            )
