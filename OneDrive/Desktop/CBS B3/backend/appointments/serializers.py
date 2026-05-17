from rest_framework import serializers
from .models import Appointment, QueueEntry, Notification


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'doctor_id', 'patient_id', 'doctor_name', 'patient_name',
            'appointment_date', 'time_slot', 'reason', 'type'
        ]


class AppointmentResponseSerializer(serializers.ModelSerializer):
    date = serializers.DateField(source='appointment_date')
    time = serializers.CharField(source='time_slot')

    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_date', 'time', 'doctor_name', 'doctor_id',
            'patient_name', 'patient_id', 'reason', 'type', 'status',
            'qr_code_token', 'created_at'
        ]


class AppointmentCancelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'status', 'cancelled_at']

    def to_representation(self, instance):
        return {
            'id': instance.id,
            'status': instance.status,
            'cancelled_at': instance.cancelled_at,
            'message': 'Appointment cancelled successfully'
        }


class AppointmentListSerializer(serializers.ModelSerializer):
    date = serializers.DateField(source='appointment_date')
    time = serializers.CharField(source='time_slot')

    class Meta:
        model = Appointment
        fields = ['id', 'date', 'time', 'doctor_name', 'type', 'status']


class QueueEntrySerializer(serializers.ModelSerializer):
    position = serializers.SerializerMethodField()
    estimated_wait_time = serializers.SerializerMethodField()

    class Meta:
        model = QueueEntry
        fields = [
            'id', 'appointment_id', 'patient_id', 'patient_name',
            'student_number', 'reason', 'priority', 'status',
            'check_in_time', 'position', 'estimated_wait_time'
        ]

    def get_position(self, obj):
        return QueueEntry.objects.filter(
            status='WAITING',
            check_in_time__lte=obj.check_in_time
        ).count()

    def get_estimated_wait_time(self, obj):
        position = self.get_position(obj)
        return position * 10


class QueueStatusSerializer(serializers.ModelSerializer):
    message = serializers.SerializerMethodField()

    class Meta:
        model = QueueEntry
        fields = ['id', 'patient_name', 'status', 'updated_at', 'message']

    def get_message(self, obj):
        return 'Status updated successfully'


class QueueListSerializer(serializers.ModelSerializer):
    position = serializers.SerializerMethodField()

    class Meta:
        model = QueueEntry
        fields = [
            'id', 'patient_name', 'student_number', 'reason',
            'priority', 'status', 'check_in_time', 'position'
        ]

    def get_position(self, obj):
        return QueueEntry.objects.filter(
            status='WAITING',
            check_in_time__lte=obj.check_in_time
        ).count()


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'