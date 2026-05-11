"""Root URL configuration — all versioned API routes live under /api/v1/."""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.auth_module.urls")),
    path("api/v1/patients/", include("apps.patients.urls")),
    path("api/v1/appointments/", include("apps.appointments.urls")),
    path("api/v1/queue/", include("apps.queue.urls")),
    path("api/v1/admin/", include("apps.admin_reporting.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    # Mounted last: `api/v1/` is a prefix for staff / timeslots / departments only.
    path("api/v1/", include("apps.doctors.urls")),
]
