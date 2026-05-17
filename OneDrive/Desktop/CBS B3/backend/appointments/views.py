import uuid
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Appointment, QueueEntry, Notification
from .serializers import (
    AppointmentCreateSerializer,
    AppointmentResponseSerializer,
    AppointmentCancelSerializer,
    AppointmentListSerializer,
    QueueEntrySerializer,
    QueueStatusSerializer,
    QueueListSerializer,
    NotificationSerializer,
)
from .utils import generate_qr_code
from .emails import send_appointment_confirmation, send_cancellation_email


class AppointmentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AppointmentCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Generate unique QR token
            qr_token = f"QR-{uuid.uuid4().hex[:12].upper()}"
            appointment = serializer.save(
                status='confirmed',
                qr_code_token=qr_token
            )
            # Generate QR code image
            qr_file = generate_qr_code(appointment.id)
            appointment.qr_code.save(qr_file.name, qr_file, save=True)
            # Send confirmation email
            send_appointment_confirmation(appointment)
            return Response(
                AppointmentResponseSerializer(appointment).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        appointment.cancellation_reason = request.data.get('cancellation_reason', '')
        appointment.cancelled_at = timezone.now()
        appointment.save()
        send_cancellation_email(appointment)
        return Response(AppointmentCancelSerializer(appointment).data)


class AppointmentUpcomingView(generics.ListAPIView):
    serializer_class = AppointmentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(
            patient_id=self.request.user.id,
            status__in=['pending', 'confirmed']
        ).order_by('appointment_date')


class AppointmentHistoryView(generics.ListAPIView):
    serializer_class = AppointmentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(
            patient_id=self.request.user.id,
            status__in=['completed', 'cancelled']
        ).order_by('-appointment_date')


class QueueCheckInView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        appointment_id = request.data.get('appointment_id')
        try:
            appointment = Appointment.objects.get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=404)

        entry = QueueEntry.objects.create(
            appointment=appointment,
            patient_id=request.data.get('patient_id'),
            patient_name=request.data.get('patient_name'),
            student_number=request.data.get('student_number', ''),
            reason=request.data.get('reason', ''),
            priority=request.data.get('priority', 'NORMAL'),
            status='WAITING'
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
        valid_statuses = ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'LEFT_WITHOUT_SEEN']

        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Must be one of {valid_statuses}'}, status=400)

        entry.status = new_status
        entry.save()
        return Response(QueueStatusSerializer(entry).data)


class QueueListView(generics.ListAPIView):
    serializer_class = QueueListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QueueEntry.objects.filter(
            status__in=['WAITING', 'IN_PROGRESS']
        ).order_by('check_in_time')


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')