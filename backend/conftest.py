from datetime import date, time, timedelta

import pytest

from apps.appointments.models import Appointment
from apps.auth_module.models import UserAccount
from apps.doctors.models import Department, Doctor, Staff, TimeSlot
from apps.patients.models import Patient


@pytest.fixture
@pytest.mark.django_db
def test_department(db):
    return Department.objects.create(department_name="Medical")


@pytest.fixture
@pytest.mark.django_db
def test_staff(db, test_department):
    return Staff.objects.create(
        department=test_department,
        first_name="Thabo",
        last_name="Mokoena",
        role=Staff.Role.DOCTOR,
        email="doctor.fixture@ubuntuclinic.test",
        contact_number="0712345678",
        working_hours_start=time(8, 0),
        working_hours_end=time(16, 0),
    )


@pytest.fixture
@pytest.mark.django_db
def test_doctor(db, test_staff):
    return Doctor.objects.create(
        staff=test_staff,
        license_number="HPCSA-FIXTURE-001",
        specialisation="General Practice",
    )


@pytest.fixture
@pytest.mark.django_db
def test_patient(db):
    return Patient.objects.create(
        student_number="12345678",
        first_name="Amina",
        last_name="Dlamini",
        email="patient.fixture@ubuntuclinic.test",
        contact_number="0798765432",
        date_of_birth=date(2001, 5, 14),
        street="1 Clinic Road",
        city="Mahikeng",
        postal_code="2745",
        consent_given=True,
    )


@pytest.fixture
@pytest.mark.django_db
def test_user_patient(db, test_patient):
    return UserAccount.objects.create(
        username="test_patient",
        password_hash="pbkdf2_sha256$fixture",
        patient=test_patient,
        role=UserAccount.Role.PATIENT,
        status=UserAccount.AccountStatus.ACTIVE,
    )


@pytest.fixture
@pytest.mark.django_db
def test_user_doctor(db, test_staff):
    return UserAccount.objects.create(
        username="test_doctor",
        password_hash="pbkdf2_sha256$fixture",
        staff=test_staff,
        role=UserAccount.Role.DOCTOR,
        status=UserAccount.AccountStatus.ACTIVE,
    )


@pytest.fixture
@pytest.mark.django_db
def test_timeslot(db):
    tomorrow = date.today() + timedelta(days=1)
    return TimeSlot.objects.create(
        slot_date=tomorrow,
        start_time=time(9, 0),
        end_time=time(9, 30),
        is_available=True,
    )


@pytest.fixture
@pytest.mark.django_db
def test_appointment(db, test_patient, test_doctor, test_timeslot):
    return Appointment.objects.create(
        patient=test_patient,
        staff=test_doctor.staff,
        slot=test_timeslot,
        status=Appointment.Status.SCHEDULED,
        booking_type=Appointment.BookingType.SICK,
        priority=Appointment.Priority.NORMAL,
    )
