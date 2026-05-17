from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Appointment, QueueEntry, Notification
from .serializers import (
    AppointmentSerializer,
    AppointmentCreateSerializer,
    AppointmentListSerializer,
    QueueEntrySerializer,
    NotificationSerializer
)
from .utils import generate_qr_code
from .emails import send_appointment_confirmation, send_cancellation_email


class AppointmentCreateView(generics.CreateAPIView):
    serializer_class = AppointmentCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        appointment = serializer.save()
        qr_file = generate_qr_code(appointment.id)
        appointment.qr_code.save(qr_file.name, qr_file, save=True)
        send_appointment_confirmation(appointment)


class AppointmentDetailView(generics.RetrieveAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]


class AppointmentCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        if appointment.status == 'cancelled':
            return Response({'error': 'Already cancelled'}, status=400)

        appointment.status = 'cancelled'
        appointment.save()
        send_cancellation_email(appointment)
        return Response({'detail': 'Appointment cancelled.'})


class AppointmentUpcomingView(generics.ListAPIView):
    serializer_class = AppointmentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(
            patient=self.request.user,
            status__in=['pending', 'confirmed']
        ).order_by('created_at')


class AppointmentHistoryView(generics.ListAPIView):
    serializer_class = AppointmentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(
            patient=self.request.user,
            status__in=['completed', 'cancelled']
        ).order_by('-created_at')


class QueueCheckInView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        appointment_id = request.data.get('appointment_id')
        try:
            appointment = Appointment.objects.get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=404)

        if hasattr(appointment, 'queue_entry'):
            return Response({'error': 'Already checked in'}, status=400)

        today_count = QueueEntry.objects.filter(
            checked_in_at__date=timezone.now().date()
        ).count()

        entry = QueueEntry.objects.create(
            appointment=appointment,
            queue_number=today_count + 1,
            status='arrived'
        )
        return Response(QueueEntrySerializer(entry).data, status=201)


class QueueStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            entry = QueueEntry.objects.get(pk=pk)
        except QueueEntry.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        new_status = request.data.get('status')
        valid_transitions = {
            'arrived': 'in_progress',
            'in_progress': 'done',
        }

        if valid_transitions.get(entry.status) != new_status:
            return Response({'error': f'Invalid transition: {entry.status} → {new_status}'}, status=400)

        entry.status = new_status
        if new_status == 'in_progress':
            entry.called_at = timezone.now()
        elif new_status == 'done':
            entry.completed_at = timezone.now()
        entry.save()
        return Response(QueueEntrySerializer(entry).data)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')