from django.http import JsonResponse


def api_placeholder(request):
    return JsonResponse(
        {
            "app": "patients",
            "path": request.path,
            "detail": "Placeholder — patient API not implemented yet.",
        }
    )
