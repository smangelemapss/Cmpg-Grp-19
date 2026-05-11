from django.db import models


class Patient(models.Model):
    """Core patient entity — student profile, address (1NF), and consent."""

    patient_id = models.BigAutoField(primary_key=True)
    student_number = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=254, unique=True)
    contact_number = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    consent_given = models.BooleanField(default=False)
    registration_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "PATIENT"

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.student_number})"


class PatientContact(models.Model):
    """Multi-value emergency contact phone numbers per patient (1NF)."""

    patient_contact_id = models.BigAutoField(primary_key=True)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        db_column="patient_id",
        related_name="contacts",
    )
    contact_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20)
    relationship = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = "PATIENT_CONTACT"

    def __str__(self) -> str:
        return f"{self.contact_name} — {self.phone_number} ({self.patient})"


class MedicalRecord(models.Model):
    """Diagnosis, prescription, and treatment notes linked to a consultation (appointment)."""

    medical_record_id = models.BigAutoField(primary_key=True)
    appointment = models.ForeignKey(
        "appointments.Appointment",
        on_delete=models.PROTECT,
        db_column="appointment_id",
        related_name="medical_records",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        db_column="patient_id",
        related_name="medical_records",
    )
    diagnosis = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    treatment_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "MEDICAL_RECORD"

    def __str__(self) -> str:
        return f"MedicalRecord {self.medical_record_id} — appointment {self.appointment_id} ({self.patient})"
