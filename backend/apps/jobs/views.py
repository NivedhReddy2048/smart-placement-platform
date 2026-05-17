from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import JobPosting, Application
from apps.core.models import Skill, StudentProfile, RoleSkillRequirement
from .serializers import JobPostingSerializer, ApplicationSerializer
from .services import JobMatchingEngine
from apps.notifications.models import Notification

from apps.accounts.permissions import IsRecruiterOrReadOnly, IsStudent, IsRecruiter

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
    permission_classes = [IsRecruiterOrReadOnly]

    def get_queryset(self):
        # If user is recruiter, only show their own jobs for management
        # If student, show all active jobs
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', '') == 'RECRUITER':
            try:
                return JobPosting.objects.filter(recruiter=user.recruiter_profile)
            except:
                return JobPosting.objects.none()
        return JobPosting.objects.filter(is_active=True)

    def perform_create(self, serializer):
        if getattr(self.request.user, 'role', '') != 'RECRUITER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only recruiters can post jobs.")
        serializer.save(recruiter=self.request.user.recruiter_profile)

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
    permission_classes = [IsAuthenticated] # Changed from IsStudent

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'STUDENT':
            return Application.objects.filter(student=user.student_profile)
        elif getattr(user, 'role', '') == 'RECRUITER':
            # Recruiters see applications for their own jobs
            return Application.objects.filter(job__recruiter=user.recruiter_profile)
        return Application.objects.none()

    def perform_create(self, serializer):
        if getattr(self.request.user, 'role', '') != 'STUDENT':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only students can apply for jobs.")
            
        student = self.request.user.student_profile
        job = serializer.validated_data.get("job")

        if Application.objects.filter(student=student, job=job).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You have already applied to this job.")

        # Calculate match score
        from apps.skills.models import StudentSkill
        from apps.core.models import Skill, RoleSkillRequirement
        user_skills = list(Skill.objects.filter(user=self.request.user).values_list("name", flat=True))
        student_skills = list(StudentSkill.objects.filter(student=student).values_list("skill__name", flat=True))
        all_user_skills = set([s.lower().strip() for s in (user_skills + student_skills)])
        
        job_requirements = []
        if job.role:
            job_requirements = list(RoleSkillRequirement.objects.filter(job_role=job.role).values_list('skill__name', flat=True))
        
        if job_requirements:
            matches = sum(1 for req in job_requirements if req.lower().strip() in all_user_skills)
            score = (matches / len(job_requirements)) * 100
        else:
            # Fallback to description keyword matching if no explicit role requirements
            job_text = f"{job.title} {job.description}".lower()
            matches = sum(1 for skill in all_user_skills if skill in job_text)
            score = min(100, matches * 10) # Heuristic

        application = serializer.save(student=student, match_score=score)

        Notification.objects.create(
            user=self.request.user,
            message=f"You applied for {application.job.title}"
        )

    def perform_update(self, serializer):
        user = self.request.user
        if getattr(user, 'role', '') != 'RECRUITER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only recruiters can update application status.")
        serializer.save()

class JobMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        try:
            student = StudentProfile.objects.get(user=user)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Student profile not found"}, status=404)

        from apps.skills.models import StudentSkill
        user_skills = list(Skill.objects.filter(user=user).values_list("name", flat=True))
        student_skills = list(StudentSkill.objects.filter(student=student).values_list("skill__name", flat=True))
        
        all_skill_names = list(set([s.lower().strip() for s in (user_skills + student_skills)]))

        jobs = JobPosting.objects.filter(is_active=True).select_related('recruiter', 'role')

        matched_jobs = []

        for job in jobs:
            requirements = list(RoleSkillRequirement.objects.filter(job_role=job.role).values_list('skill__name', flat=True)) if job.role else []
            job_text = f"{job.title} {job.description}".lower()
            match_count = sum(1 for skill in all_skill_names if skill in job_text)

            matched_jobs.append({
                "id": job.id,
                "title": job.title,
                "company": job.recruiter.company_name,
                "location": job.location,
                "match_score": match_count,
                "skills": requirements
            })

        matched_jobs.sort(key=lambda x: x["match_score"], reverse=True)
        return Response(matched_jobs)

class RecruiterStatsView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get(self, request):
        recruiter = request.user.recruiter_profile
        jobs_count = JobPosting.objects.filter(recruiter=recruiter, is_active=True).count()
        total_apps = Application.objects.filter(job__recruiter=recruiter).count()
        pipeline_count = Application.objects.filter(
            job__recruiter=recruiter, 
            status__in=['SHORTLISTED', 'INTERVIEW', 'HIRED']
        ).count()

        return Response({
            "active_jobs": jobs_count,
            "total_applications": total_apps,
            "hiring_pipeline": pipeline_count
        })
