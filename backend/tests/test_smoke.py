from django.conf import settings


def test_project_apps_registered():
    assert "apps.patients" in settings.INSTALLED_APPS
    assert settings.SETTINGS_MODULE == "config.settings"
