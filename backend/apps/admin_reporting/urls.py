from django.urls import path

from . import views

app_name = "admin_reporting"

urlpatterns = [
    path("", views.api_placeholder, name="placeholder"),
]
