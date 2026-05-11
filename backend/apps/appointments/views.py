from django.http import JsonResponse


def api_placeholder(request):
    return JsonResponse(
        {
            "app": "appointments",
            "path": request.path,
            "detail": "Placeholder — appointments API not implemented yet.",
        }
    )
