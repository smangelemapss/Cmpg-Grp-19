from django.urls import path
from .views import (
    AppointmentCreateView,
    AppointmentCancelView,
    AppointmentUpcomingView,
    AppointmentHistoryView,
    QueueCheckInView,
    QueueStatusUpdateView,
    QueueListView,
    NotificationListView,
)

urlpatterns = [
    path('appointments/', AppointmentCreateView.as_view(), name='appointment-create'),
    path('appointments/upcoming/', AppointmentUpcomingView.as_view(), name='appointment-upcoming'),
    path('appointments/history/', AppointmentHistoryView.as_view(), name='appointment-history'),
    path('appointments/<int:pk>/cancel/', AppointmentCancelView.as_view(), name='appointment-cancel'),
    path('queue/', QueueListView.as_view(), name='queue-list'),
    path('queue/check-in/', QueueCheckInView.as_view(), name='queue-checkin'),
    path('queue/<int:pk>/status/', QueueStatusUpdateView.as_view(), name='queue-status-update'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
]