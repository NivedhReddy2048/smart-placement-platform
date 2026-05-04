from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WeeklyRecommendation
from .serializers import WeeklyRecommendationSerializer
from .services import RecommendationEngine
from apps.core.models import StudentProfile, JobRole

class WeeklyRecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WeeklyRecommendation.objects.all()
    serializer_class = WeeklyRecommendationSerializer

    @action(detail=False, methods=['post'])
    def generate(self, request):
        student_id = request.data.get('student_id')
        job_role_id = request.data.get('job_role_id')
        try:
            student = StudentProfile.objects.get(id=student_id)
            job = JobRole.objects.get(id=job_role_id)
            rec = RecommendationEngine.generate_weekly_plan(student, job)
            return Response(WeeklyRecommendationSerializer(rec).data)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
