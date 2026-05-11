from django.db import models


class Department(models.Model):
    """Clinic org structure; optional department head (staff)."""

    department_id = models.BigAutoField(primary_key=True)
    department_name = models.CharField(max_length=200, unique=True)
    head_staff = models.ForeignKey(
        "Staff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="head_staff_id",
        related_name="headed_departments",
    )

    class Meta:
        db_table = "DEPARTMENT"

    def __str__(self) -> str:
        return self.department_name


class Staff(models.Model):
    """Clinic employees: department membership, role, and working hours."""

    class Role(models.TextChoices):
        DOCTOR = "DOCTOR", "Doctor"
        NURSE = "NURSE", "Nurse"
        ADMIN = "ADMIN", "Admin"

    staff_id = models.BigAutoField(primary_key=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="department_id",
        related_name="staff_members",
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=Role.choices)
    email = models.EmailField(max_length=254, unique=True)
    contact_number = models.CharField(max_length=20)
    working_hours_start = models.TimeField()
    working_hours_end = models.TimeField()

    class Meta:
        db_table = "STAFF"

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.email})"


class Doctor(models.Model):
    """Doctor subtype of staff — PK is the same as staff_id (subtype pattern)."""

    staff = models.OneToOneField(
        Staff,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column="staff_id",
        related_name="doctor_profile",
    )
    license_number = models.CharField(max_length=50, unique=True)
    specialisation = models.CharField(max_length=150)

    class Meta:
        db_table = "DOCTOR"

    def __str__(self) -> str:
        return f"Dr {self.staff.last_name} ({self.license_number})"


class TimeSlot(models.Model):
    """Available date and time blocks for booking."""

    slot_id = models.BigAutoField(primary_key=True)
    slot_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = "TIMESLOT"
        indexes = [
            models.Index(fields=["slot_date"], name="TIMESLOT_slot_date_idx"),
            models.Index(
                fields=["slot_date", "is_available"],
                name="TIMESLOT_slot_date_avail_idx",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.slot_date} {self.start_time}–{self.end_time} (available={self.is_available})"
