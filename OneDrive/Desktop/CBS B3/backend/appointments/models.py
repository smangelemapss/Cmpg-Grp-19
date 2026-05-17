from django.db import models
from django.conf import settings


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    TYPE_CHOICES = [
        ('in-person', 'In Person'),
        ('online', 'Online'),
    ]

    doctor_id = models.IntegerField(default=0)
    patient_id = models.IntegerField(default=0)
    doctor_name = models.CharField(max_length=100, blank=True, default='')
    patient_name = models.CharField(max_length=100, blank=True, default='')
    appointment_date = models.DateField(default='2026-01-01')
    time_slot = models.CharField(max_length=10, default='00:00')
    reason = models.TextField(default='')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='in-person')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    qr_code_token = models.CharField(max_length=100, blank=True, default='')
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, default='')
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Appt #{self.id} — {self.patient_name}"


class QueueEntry(models.Model):
    STATUS_CHOICES = [
        ('WAITING', 'Waiting'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('LEFT_WITHOUT_SEEN', 'Left Without Seen'),
    ]
    PRIORITY_CHOICES = [
        ('NORMAL', 'Normal'),
        ('URGENT', 'Urgent'),
    ]

    appointment = models.ForeignKey(
        Appointment, on_delete=models.CASCADE, related_name='queue_entries'
    )
    patient_id = models.IntegerField(default=0)
    patient_name = models.CharField(max_length=100, default='')
    student_number = models.CharField(max_length=20, blank=True, default='')
    reason = models.TextField(default='')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='NORMAL')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='WAITING')
    check_in_time = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Queue #{self.id} — {self.patient_name} — {self.status}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('confirmation', 'Confirmation'),
        ('reminder', 'Reminder'),
        ('cancellation', 'Cancellation'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    appointment = models.ForeignKey(
        Appointment, on_delete=models.CASCADE,
        related_name='notifications', null=True, blank=True
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.TextField(default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.notification_type} → {self.user}"