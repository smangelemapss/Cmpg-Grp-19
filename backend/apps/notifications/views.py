from django.http import JsonResponse


def api_placeholder(request):
    return JsonResponse(
        {
            "app": "notifications",
            "path": request.path,
            "detail": "Placeholder — notifications API not implemented yet.",
        }
    )
