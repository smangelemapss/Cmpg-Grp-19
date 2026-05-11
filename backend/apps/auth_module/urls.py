from django.urls import path

from . import views

app_name = "auth_module"

urlpatterns = [
    path("", views.api_placeholder, name="placeholder"),
]
