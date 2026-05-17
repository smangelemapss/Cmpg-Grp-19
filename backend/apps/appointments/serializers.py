from rest_framework import serializers
from .models import Appointment, QueueEntry, Notification

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['qr_code', 'created_at', 'updated_at']

class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['patient', 'timeslot_id', 'notes']

class AppointmentListSerializer(serializers.ModelSerializer):
    """Matches F2's expected response shape"""
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    doctor = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = ['id', 'date', 'time', 'doctor', 'type', 'status']

    def get_date(self, obj):
        # Will return real date once timeslot FK is connected from B2
        return obj.created_at.strftime("%a %-d %b") if obj.created_at else None

    def get_time(self, obj):
        # Will return real time once timeslot FK is connected from B2
        return obj.created_at.strftime("%H:%M") if obj.created_at else None

    def get_doctor(self, obj):
        # Will return real doctor name once B2 Timeslot FK is connected
        return "TBC"

    def get_type(self, obj):
        return obj.notes if obj.notes else "General"

class QueueEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = QueueEntry
        fields = '__all__'
        read_only_fields = ['checked_in_at', 'queue_number']

class QueueStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueueEntry
        fields = ['status', 'called_at', 'completed_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'