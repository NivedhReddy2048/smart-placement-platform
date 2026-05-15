from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import JobPosting, Application
from apps.core.models import Skill, StudentProfile
from .serializers import JobPostingSerializer, ApplicationSerializer
from .services import JobMatchingEngine
from apps.notifications.models import Notification

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def best_candidates(self, request, pk=None):
        job = self.get_object()
        candidates = JobMatchingEngine.get_best_candidates(job, limit=10)
        
        result = []
        for c in candidates:
            result.append({
                "student_id": c["student"].id,
                "username": c["student"].user.username,
                "score": c["score"]
            })
        return Response(result)

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Students see only their own applications
        return Application.objects.filter(student=self.request.user.student_profile)

    def perform_create(self, serializer):
        student = self.request.user.student_profile
        job = serializer.validated_data.get("job")

        if Application.objects.filter(student=student, job=job).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You have already applied to this job.")

        application = serializer.save(student=student)

        # 🔔 Create notification
        Notification.objects.create(
            user=self.request.user,
            message=f"You applied for {application.job.title}"
        )

class JobMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        try:
            student = StudentProfile.objects.get(user=user)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Student profile not found"}, status=404)

        # Get student skills from both core.Skill and skills.StudentSkill
        from apps.skills.models import StudentSkill
        user_skills = list(Skill.objects.filter(user=user).values_list("name", flat=True))
        student_skills = list(StudentSkill.objects.filter(student=student).values_list("skill__name", flat=True))
        
        all_skill_names = list(set([s.lower().strip() for s in (user_skills + student_skills)]))

        jobs = JobPosting.objects.filter(is_active=True)

        matched_jobs = []

        for job in jobs:
            # Use title + description for matching
            job_text = f"{job.title} {job.description}".lower()

            match_count = sum(1 for skill in all_skill_names if skill in job_text)

            if match_count > 0:
                matched_jobs.append({
                    "id": job.id,
                    "title": job.title,
                    "company": job.recruiter.company_name,
                    "location": job.location,
                    "match_score": match_count
                })

        matched_jobs.sort(key=lambda x: x["match_score"], reverse=True)

        return Response(matched_jobs)
