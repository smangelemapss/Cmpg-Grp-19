from django.urls import path
from .views import (
    AppointmentCreateView,
    AppointmentDetailView,
    AppointmentCancelView,
    QueueCheckInView,
    QueueStatusUpdateView,
    NotificationListView,
)

urlpatterns = [
    path('appointments/', AppointmentCreateView.as_view(), name='appointment-create'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('appointments/<int:pk>/cancel/', AppointmentCancelView.as_view(), name='appointment-cancel'),
    path('queue/check-in/', QueueCheckInView.as_view(), name='queue-checkin'),
    path('queue/<int:pk>/status/', QueueStatusUpdateView.as_view(), name='queue-status-update'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
]