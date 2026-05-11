from django.http import JsonResponse


def api_placeholder(request):
    return JsonResponse(
        {
            "app": "doctors",
            "path": request.path,
            "detail": "Placeholder — staff / timeslots / departments API not implemented yet.",
        }
    )
