from django.http import JsonResponse


def api_placeholder(request):
    return JsonResponse(
        {
            "app": "queue",
            "path": request.path,
            "detail": "Placeholder — queue API not implemented yet.",
        }
    )
