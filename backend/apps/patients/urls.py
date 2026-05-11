from django.urls import path

from . import views

app_name = "patients"

urlpatterns = [
    path("", views.api_placeholder, name="placeholder"),
]
