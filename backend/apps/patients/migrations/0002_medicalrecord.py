# Generated manually — MEDICAL_RECORD depends on APPOINTMENT

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0001_initial"),
        ("patients", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="MedicalRecord",
            fields=[
                ("medical_record_id", models.BigAutoField(primary_key=True, serialize=False)),
                ("diagnosis", models.TextField(blank=True)),
                ("prescription", models.TextField(blank=True)),
                ("treatment_notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "appointment",
                    models.ForeignKey(
                        db_column="appointment_id",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="medical_records",
                        to="appointments.appointment",
                    ),
                ),
                (
                    "patient",
                    models.ForeignKey(
                        db_column="patient_id",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="medical_records",
                        to="patients.patient",
                    ),
                ),
            ],
            options={
                "db_table": "MEDICAL_RECORD",
            },
        ),
    ]
