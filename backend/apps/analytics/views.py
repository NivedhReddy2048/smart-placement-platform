from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.models import StudentProfile, JobRole
from apps.jobs.models import JobPosting, Application

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = {
            "total_students": StudentProfile.objects.count(),
            "total_jobs": JobPosting.objects.count(),
            "total_applications": Application.objects.count(),
            "active_roles": JobRole.objects.count(),
        }
        return Response(stats)
