from django.http import JsonResponse


def api_placeholder(request):
    return JsonResponse(
        {
            "app": "admin_reporting",
            "path": request.path,
            "detail": "Placeholder — admin reports and audit API not implemented yet.",
        }
    )
