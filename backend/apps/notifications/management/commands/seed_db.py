from datetime import date, time, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.admin_reporting.models import AuditLog
from apps.appointments.models import Appointment
from apps.auth_module.models import UserAccount
from apps.doctors.models import Department, Doctor, Staff, TimeSlot
from apps.notifications.models import Notification
from apps.patients.models import MedicalRecord, Patient, PatientContact
from apps.queue.models import QueueEntry


class Command(BaseCommand):
    help = "Seed the Ubuntu Clinic database with realistic South African clinic data."

    def handle(self, *args, **options):
        departments = self.seed_departments()
        staff_members = self.seed_staff(departments)
        doctors = self.seed_doctors(staff_members)
        patients = self.seed_patients()
        patient_contacts = self.seed_patient_contacts(patients)
        user_accounts = self.seed_user_accounts(patients, doctors)
        slots = self.seed_timeslots()
        appointments = self.seed_appointments(patients, doctors, slots)
        queue_entries = self.seed_queue_entries(appointments)
        medical_records = self.seed_medical_records(appointments)
        notifications = self.seed_notifications(appointments)
        audit_logs = self.seed_audit_logs(user_accounts, patients, appointments)

        self.stdout.write(
            self.style.SUCCESS(
                "Database seeding complete: all 12 system-design tables are populated."
            )
        )

    def seed_departments(self):
        names = ["Medical", "Nursing", "Pharmacy", "Laboratory", "IT"]
        departments = {}
        for name in names:
            department, _ = Department.objects.get_or_create(department_name=name)
            departments[name] = department

        self.stdout.write(self.style.SUCCESS("Seeded DEPARTMENT table."))
        return departments

    def seed_staff(self, departments):
        staff_data = [
            {
                "email": "dr.naledi.mokoena@ubuntuclinic.ac.za",
                "first_name": "Naledi",
                "last_name": "Mokoena",
                "role": Staff.Role.DOCTOR,
                "department": departments["Medical"],
                "contact_number": "0721234567",
                "working_hours_start": time(8, 0),
                "working_hours_end": time(16, 0),
            },
            {
                "email": "dr.thabo.dlamini@ubuntuclinic.ac.za",
                "first_name": "Thabo",
                "last_name": "Dlamini",
                "role": Staff.Role.DOCTOR,
                "department": departments["Medical"],
                "contact_number": "0732345678",
                "working_hours_start": time(8, 0),
                "working_hours_end": time(16, 0),
            },
            {
                "email": "dr.aisha.patel@ubuntuclinic.ac.za",
                "first_name": "Aisha",
                "last_name": "Patel",
                "role": Staff.Role.DOCTOR,
                "department": departments["Medical"],
                "contact_number": "0743456789",
                "working_hours_start": time(9, 0),
                "working_hours_end": time(17, 0),
            },
            {
                "email": "nurse.lerato.molefe@ubuntuclinic.ac.za",
                "first_name": "Lerato",
                "last_name": "Molefe",
                "role": Staff.Role.NURSE,
                "department": departments["Nursing"],
                "contact_number": "0754567890",
                "working_hours_start": time(7, 30),
                "working_hours_end": time(15, 30),
            },
            {
                "email": "nurse.sipho.khumalo@ubuntuclinic.ac.za",
                "first_name": "Sipho",
                "last_name": "Khumalo",
                "role": Staff.Role.NURSE,
                "department": departments["Nursing"],
                "contact_number": "0765678901",
                "working_hours_start": time(10, 0),
                "working_hours_end": time(18, 0),
            },
            {
                "email": "admin.nomsa.ndlovu@ubuntuclinic.ac.za",
                "first_name": "Nomsa",
                "last_name": "Ndlovu",
                "role": Staff.Role.ADMIN,
                "department": departments["IT"],
                "contact_number": "0776789012",
                "working_hours_start": time(8, 0),
                "working_hours_end": time(16, 0),
            },
        ]

        staff_members = {}
        for data in staff_data:
            email = data.pop("email")
            staff, _ = Staff.objects.get_or_create(email=email, defaults=data)
            staff_members[email] = staff

        self.stdout.write(self.style.SUCCESS("Seeded STAFF table."))
        return staff_members

    def seed_doctors(self, staff_members):
        doctor_data = [
            {
                "staff": staff_members["dr.naledi.mokoena@ubuntuclinic.ac.za"],
                "license_number": "HPCSA-MP-10001",
                "specialisation": "General Practice",
            },
            {
                "staff": staff_members["dr.thabo.dlamini@ubuntuclinic.ac.za"],
                "license_number": "HPCSA-MP-10002",
                "specialisation": "Primary Care",
            },
            {
                "staff": staff_members["dr.aisha.patel@ubuntuclinic.ac.za"],
                "license_number": "HPCSA-MP-10003",
                "specialisation": "Mental Health",
            },
        ]

        doctors = []
        for data in doctor_data:
            doctor, _ = Doctor.objects.get_or_create(
                staff=data["staff"],
                defaults={
                    "license_number": data["license_number"],
                    "specialisation": data["specialisation"],
                },
            )
            doctors.append(doctor)

        self.stdout.write(self.style.SUCCESS("Seeded DOCTOR table."))
        return doctors

    def seed_patients(self):
        patient_data = [
            {
                "student_number": "10012345",
                "first_name": "Karabo",
                "last_name": "Mabena",
                "email": "10012345@student.nwu.ac.za",
                "contact_number": "0781234567",
                "date_of_birth": date(2002, 3, 12),
                "street": "12 Steve Biko Drive",
                "city": "Potchefstroom",
                "postal_code": "2531",
                "consent_given": True,
            },
            {
                "student_number": "10023456",
                "first_name": "Boitumelo",
                "last_name": "Maseko",
                "email": "10023456@student.nwu.ac.za",
                "contact_number": "0782345678",
                "date_of_birth": date(2001, 7, 24),
                "street": "45 Albert Luthuli Avenue",
                "city": "Mahikeng",
                "postal_code": "2745",
                "consent_given": True,
            },
            {
                "student_number": "10034567",
                "first_name": "Minenhle",
                "last_name": "Nkosi",
                "email": "10034567@student.nwu.ac.za",
                "contact_number": "0783456789",
                "date_of_birth": date(2003, 1, 5),
                "street": "8 Nelson Mandela Drive",
                "city": "Vanderbijlpark",
                "postal_code": "1900",
                "consent_given": True,
            },
            {
                "student_number": "10045678",
                "first_name": "Tshegofatso",
                "last_name": "Radebe",
                "email": "10045678@student.nwu.ac.za",
                "contact_number": "0784567890",
                "date_of_birth": date(2000, 11, 18),
                "street": "21 Beyers Naude Avenue",
                "city": "Potchefstroom",
                "postal_code": "2531",
                "consent_given": True,
            },
            {
                "student_number": "10056789",
                "first_name": "Anathi",
                "last_name": "Mthembu",
                "email": "10056789@student.nwu.ac.za",
                "contact_number": "0785678901",
                "date_of_birth": date(2002, 9, 2),
                "street": "6 University Road",
                "city": "Mahikeng",
                "postal_code": "2745",
                "consent_given": True,
            },
        ]

        patients = []
        for data in patient_data:
            student_number = data.pop("student_number")
            patient, _ = Patient.objects.get_or_create(
                student_number=student_number,
                defaults=data,
            )
            patients.append(patient)

        self.stdout.write(self.style.SUCCESS("Seeded PATIENT table."))
        return patients

    def seed_patient_contacts(self, patients):
        contacts = []
        contact_data = [
            ("10012345", "Grace Mabena", "0821234567", "Mother"),
            ("10023456", "Sibusiso Maseko", "0822345678", "Father"),
            ("10034567", "Nokuthula Nkosi", "0823456789", "Aunt"),
            ("10045678", "Refilwe Radebe", "0824567890", "Sister"),
            ("10056789", "Zanele Mthembu", "0825678901", "Guardian"),
        ]
        patients_by_number = {patient.student_number: patient for patient in patients}

        for student_number, name, phone, relationship in contact_data:
            contact, _ = PatientContact.objects.get_or_create(
                patient=patients_by_number[student_number],
                phone_number=phone,
                defaults={
                    "contact_name": name,
                    "relationship": relationship,
                },
            )
            contacts.append(contact)

        self.stdout.write(self.style.SUCCESS("Seeded PATIENT_CONTACT table."))
        return contacts

    def seed_user_accounts(self, patients, doctors):
        accounts = []

        for patient in patients:
            account, _ = UserAccount.objects.get_or_create(
                username=f"student_{patient.student_number}",
                defaults={
                    "password_hash": "pbkdf2_sha256$seeded-demo-password",
                    "patient": patient,
                    "role": UserAccount.Role.PATIENT,
                    "status": UserAccount.AccountStatus.ACTIVE,
                },
            )
            accounts.append(account)

        for doctor in doctors:
            account, _ = UserAccount.objects.get_or_create(
                username=f"doctor_{doctor.staff.last_name.lower()}",
                defaults={
                    "password_hash": "pbkdf2_sha256$seeded-demo-password",
                    "staff": doctor.staff,
                    "role": UserAccount.Role.DOCTOR,
                    "status": UserAccount.AccountStatus.ACTIVE,
                },
            )
            accounts.append(account)

        self.stdout.write(self.style.SUCCESS("Seeded USER_ACCOUNT table."))
        return accounts

    def seed_timeslots(self):
        slots = []
        start_times = [
            time(8, 0),
            time(8, 30),
            time(9, 0),
            time(9, 30),
            time(10, 0),
            time(10, 30),
            time(11, 0),
            time(11, 30),
        ]

        for day_offset in range(1, 8):
            slot_date = date.today() + timedelta(days=day_offset)
            for start_time in start_times:
                end_time = (
                    timezone.datetime.combine(slot_date, start_time)
                    + timedelta(minutes=30)
                ).time()
                slot, _ = TimeSlot.objects.get_or_create(
                    slot_date=slot_date,
                    start_time=start_time,
                    end_time=end_time,
                    defaults={"is_available": True},
                )
                slots.append(slot)

        for day_offset, start_time in [(-3, time(9, 0)), (-2, time(10, 0)), (-1, time(11, 0))]:
            slot_date = date.today() + timedelta(days=day_offset)
            end_time = (
                timezone.datetime.combine(slot_date, start_time)
                + timedelta(minutes=30)
            ).time()
            slot, _ = TimeSlot.objects.get_or_create(
                slot_date=slot_date,
                start_time=start_time,
                end_time=end_time,
                defaults={"is_available": False},
            )
            slots.append(slot)

        self.stdout.write(self.style.SUCCESS("Seeded TIMESLOT table."))
        return slots

    def seed_appointments(self, patients, doctors, slots):
        future_slots = [slot for slot in slots if slot.slot_date > date.today()]
        past_slots = [slot for slot in slots if slot.slot_date < date.today()]
        appointment_specs = [
            (patients[0], doctors[0], past_slots[0], Appointment.Status.COMPLETED),
            (patients[1], doctors[1], past_slots[1], Appointment.Status.COMPLETED),
            (patients[2], doctors[2], past_slots[2], Appointment.Status.COMPLETED),
            (patients[3], doctors[0], future_slots[2], Appointment.Status.SCHEDULED),
            (patients[4], doctors[1], future_slots[10], Appointment.Status.CONFIRMED),
        ]

        appointments = []
        for patient, doctor, slot, status in appointment_specs:
            appointment, _ = Appointment.objects.get_or_create(
                slot=slot,
                defaults={
                    "patient": patient,
                    "staff": doctor.staff,
                    "status": status,
                    "booking_type": Appointment.BookingType.SICK,
                    "priority": Appointment.Priority.NORMAL,
                },
            )
            if slot.is_available:
                slot.is_available = False
                slot.save(update_fields=["is_available"])
            appointments.append(appointment)

        self.stdout.write(self.style.SUCCESS("Seeded APPOINTMENT table."))
        return appointments

    def seed_queue_entries(self, appointments):
        completed_appointments = [
            appointment
            for appointment in appointments
            if appointment.status == Appointment.Status.COMPLETED
        ]
        entries = []

        for appointment in completed_appointments:
            entry, _ = QueueEntry.objects.get_or_create(
                appointment=appointment,
                defaults={
                    "status": QueueEntry.Status.COMPLETED,
                    "consult_start_time": time(9, 15),
                    "consult_end_time": time(9, 45),
                    "room_number": "Room 2",
                },
            )
            entries.append(entry)

        self.stdout.write(self.style.SUCCESS("Seeded QUEUE_ENTRY table."))
        return entries

    def seed_medical_records(self, appointments):
        completed_appointments = [
            appointment
            for appointment in appointments
            if appointment.status == Appointment.Status.COMPLETED
        ]
        record_notes = [
            ("Seasonal flu", "Paracetamol and fluids", "Rest for 48 hours."),
            ("Migraine", "Ibuprofen as needed", "Follow up if symptoms persist."),
            ("Anxiety symptoms", "Referral to counselling", "Breathing exercises discussed."),
        ]
        records = []

        for appointment, notes in zip(completed_appointments, record_notes):
            diagnosis, prescription, treatment_notes = notes
            record, _ = MedicalRecord.objects.get_or_create(
                appointment=appointment,
                patient=appointment.patient,
                defaults={
                    "diagnosis": diagnosis,
                    "prescription": prescription,
                    "treatment_notes": treatment_notes,
                },
            )
            records.append(record)

        self.stdout.write(self.style.SUCCESS("Seeded MEDICAL_RECORD table."))
        return records

    def seed_notifications(self, appointments):
        notifications = []
        for appointment in appointments:
            message = (
                f"Reminder: appointment {appointment.appointment_id} at Ubuntu Clinic "
                f"on {appointment.slot.slot_date} at {appointment.slot.start_time}."
            )
            notification, _ = Notification.objects.get_or_create(
                appointment=appointment,
                patient=appointment.patient,
                channel=Notification.Channel.EMAIL,
                message=message,
                defaults={
                    "status": Notification.Status.PENDING,
                },
            )
            notifications.append(notification)

        self.stdout.write(self.style.SUCCESS("Seeded NOTIFICATION table."))
        return notifications

    def seed_audit_logs(self, user_accounts, patients, appointments):
        logs = []
        admin_or_first_user = user_accounts[-1]

        audit_specs = [
            (admin_or_first_user, AuditLog.Action.CREATE, "PATIENT", patients[0].patient_id),
            (admin_or_first_user, AuditLog.Action.CREATE, "PATIENT", patients[1].patient_id),
            (
                admin_or_first_user,
                AuditLog.Action.CREATE,
                "APPOINTMENT",
                appointments[0].appointment_id,
            ),
            (
                admin_or_first_user,
                AuditLog.Action.UPDATE,
                "APPOINTMENT",
                appointments[1].appointment_id,
            ),
            (
                admin_or_first_user,
                AuditLog.Action.READ,
                "MEDICAL_RECORD",
                appointments[0].appointment_id,
            ),
        ]

        for user, action, table_name, record_id in audit_specs:
            log, _ = AuditLog.objects.get_or_create(
                user=user,
                action=action,
                table_affected=table_name,
                record_affected_id=record_id,
                ip_address="127.0.0.1",
            )
            logs.append(log)

        self.stdout.write(self.style.SUCCESS("Seeded AUDIT_LOG table."))
        return logs
