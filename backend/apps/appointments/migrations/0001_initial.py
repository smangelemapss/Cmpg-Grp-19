# Full APPOINTMENT — depends on PATIENT, STAFF, TIMESLOT

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("doctors", "0002_department_staff_doctor"),
        ("patients", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Appointment",
            fields=[
                ("appointment_id", models.BigAutoField(primary_key=True, serialize=False)),
                (
                    "slot",
                    models.OneToOneField(
                        db_column="slot_id",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="appointment",
                        to="doctors.timeslot",
                        unique=True,
                    ),
                ),
                (
                    "patient",
                    models.ForeignKey(
                        db_column="patient_id",
                        db_index=False,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="appointments",
                        to="patients.patient",
                    ),
                ),
                (
                    "staff",
                    models.ForeignKey(
                        db_column="staff_id",
                        db_index=False,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="appointments",
                        to="doctors.staff",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("SCHEDULED", "Scheduled"),
                            ("CONFIRMED", "Confirmed"),
                            ("COMPLETED", "Completed"),
                            ("CANCELLED", "Cancelled"),
                            ("NO_SHOW", "No show"),
                        ],
                        default="SCHEDULED",
                        max_length=20,
                    ),
                ),
                (
                    "booking_type",
                    models.CharField(
                        choices=[
                            ("SICK", "Sick visit"),
                            ("FOLLOW_UP", "Follow-up"),
                            ("WALK_IN", "Walk-in"),
                            ("VIRTUAL_TRIAGE", "Virtual triage"),
                        ],
                        default="SICK",
                        max_length=20,
                    ),
                ),
                (
                    "priority",
                    models.CharField(
                        choices=[("NORMAL", "Normal"), ("URGENT", "Urgent")],
                        default="NORMAL",
                        max_length=10,
                    ),
                ),
                (
                    "qr_code_token",
                    models.UUIDField(blank=True, null=True, unique=True),
                ),
            ],
            options={
                "db_table": "APPOINTMENT",
                "indexes": [
                    models.Index(
                        fields=["patient_id"],
                        name="APPOINTMENT_patient_id_idx",
                    ),
                    models.Index(
                        fields=["staff_id"],
                        name="APPOINTMENT_staff_id_idx",
                    ),
                ],
            },
        ),
    ]
