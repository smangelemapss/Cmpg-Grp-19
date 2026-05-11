from django.urls import path

from . import views

app_name = "doctors"

urlpatterns = [
    path("staff/", views.api_placeholder, name="staff-placeholder"),
    path("timeslots/", views.api_placeholder, name="timeslots-placeholder"),
    path("departments/", views.api_placeholder, name="departments-placeholder"),
]
