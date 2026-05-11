from django.http import JsonResponse


def api_placeholder(request):
    return JsonResponse(
        {
            "app": "auth_module",
            "path": request.path,
            "detail": "Placeholder — JWT auth endpoints not implemented yet.",
        }
    )
