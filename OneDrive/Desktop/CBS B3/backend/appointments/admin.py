from django.contrib import admin
from .models import Appointment, QueueEntry, Notification

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient_name', 'doctor_name', 'status', 'appointment_date']
    list_filter = ['status', 'type']

@admin.register(QueueEntry)
class QueueEntryAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient_name', 'status', 'priority', 'check_in_time']
    list_filter = ['status', 'priority']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'is_read', 'created_at']