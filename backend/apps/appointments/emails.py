from django.core.mail import send_mail
from django.conf import settings

def send_appointment_confirmation(appointment):
    subject = f"Appointment Confirmed — #{appointment.id}"
    message = (
        f"Your appointment has been confirmed.\n"
        f"Reference: #{appointment.id}\n\n"
        f"Please show your QR code at the clinic.\n\n"
        f"— CBS Clinic"
    )
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [appointment.patient.email],
        fail_silently=True,
    )

def send_cancellation_email(appointment):
    send_mail(
        f"Appointment Cancelled — #{appointment.id}",
        f"Your appointment #{appointment.id} has been cancelled.",
        settings.DEFAULT_FROM_EMAIL,
        [appointment.patient.email],
        fail_silently=True,
    )