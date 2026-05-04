import os

files = {
    # Accounts
    "apps/accounts/serializers.py": """from rest_framework import serializers
from .models import User
from apps.core.models import StudentProfile, RecruiterProfile

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.STUDENT)
        )
        if user.role == User.Role.STUDENT:
            StudentProfile.objects.create(user=user)
        elif user.role == User.Role.RECRUITER:
            RecruiterProfile.objects.create(user=user, company_name="Company To Update")
        return user
""",
    "apps/accounts/views.py": """from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import UserRegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegisterSerializer
""",
    "apps/accounts/urls.py": """from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
]
""",
    
    # Core
    "apps/core/serializers.py": """from rest_framework import serializers
from .models import Skill, JobRole, StudentProfile

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class JobRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRole
        fields = '__all__'

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = '__all__'
""",
    "apps/core/views.py": """from rest_framework import viewsets
from .models import Skill, JobRole, StudentProfile
from .serializers import SkillSerializer, JobRoleSerializer, StudentProfileSerializer

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class JobRoleViewSet(viewsets.ModelViewSet):
    queryset = JobRole.objects.all()
    serializer_class = JobRoleSerializer

class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
""",
    "apps/core/urls.py": """from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, JobRoleViewSet, StudentProfileViewSet

router = DefaultRouter()
router.register(r'skills', SkillViewSet)
router.register(r'job-roles', JobRoleViewSet)
router.register(r'profiles', StudentProfileViewSet)
urlpatterns = router.urls
""",

    # Skills
    "apps/skills/serializers.py": """from rest_framework import serializers
from .models import StudentSkill

class StudentSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSkill
        fields = '__all__'
""",
    "apps/skills/views.py": """from rest_framework import viewsets
from .models import StudentSkill
from .serializers import StudentSkillSerializer

class StudentSkillViewSet(viewsets.ModelViewSet):
    queryset = StudentSkill.objects.all()
    serializer_class = StudentSkillSerializer
""",
    "apps/skills/urls.py": """from rest_framework.routers import DefaultRouter
from .views import StudentSkillViewSet

router = DefaultRouter()
router.register(r'student-skills', StudentSkillViewSet)
urlpatterns = router.urls
""",

    # Analyzer
    "apps/analyzer/serializers.py": """from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ('parsed_text', 'is_parsed')
""",
    "apps/analyzer/views.py": """from rest_framework import viewsets
from .models import Resume
from .serializers import ResumeSerializer
from .tasks import parse_resume_task

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    
    def perform_create(self, serializer):
        resume = serializer.save()
        parse_resume_task.delay(resume.id)
""",
    "apps/analyzer/urls.py": """from rest_framework.routers import DefaultRouter
from .views import ResumeViewSet

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet)
urlpatterns = router.urls
""",

    # Recommendations
    "apps/recommendations/serializers.py": """from rest_framework import serializers
from .models import WeeklyRecommendation

class WeeklyRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyRecommendation
        fields = '__all__'
""",
    "apps/recommendations/views.py": """from rest_framework import viewsets
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
""",
    "apps/recommendations/urls.py": """from rest_framework.routers import DefaultRouter
from .views import WeeklyRecommendationViewSet

router = DefaultRouter()
router.register(r'plans', WeeklyRecommendationViewSet)
urlpatterns = router.urls
""",

    # Jobs
    "apps/jobs/serializers.py": """from rest_framework import serializers
from .models import JobPosting, Application

class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'
""",
    "apps/jobs/views.py": """from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import JobPosting, Application
from .serializers import JobPostingSerializer, ApplicationSerializer
from .services import JobMatchingEngine

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer

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
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
""",
    "apps/jobs/urls.py": """from rest_framework.routers import DefaultRouter
from .views import JobPostingViewSet, ApplicationViewSet

router = DefaultRouter()
router.register(r'postings', JobPostingViewSet)
router.register(r'applications', ApplicationViewSet)
urlpatterns = router.urls
""",

    # Analytics
    "apps/analytics/views.py": """from rest_framework.views import APIView
from rest_framework.response import Response
from apps.core.models import StudentProfile, JobRole
from apps.jobs.models import JobPosting, Application

class DashboardStatsView(APIView):
    def get(self, request):
        stats = {
            "total_students": StudentProfile.objects.count(),
            "total_jobs": JobPosting.objects.count(),
            "total_applications": Application.objects.count(),
            "active_roles": JobRole.objects.count(),
        }
        return Response(stats)
""",
    "apps/analytics/urls.py": """from django.urls import path
from .views import DashboardStatsView

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
""",

    # Main URLS
    "config/urls.py": """from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/skills/', include('apps.skills.urls')),
    path('api/analyzer/', include('apps.analyzer.urls')),
    path('api/recommendations/', include('apps.recommendations.urls')),
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]
"""
}

def generate():
    for filepath, content in files.items():
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            f.write(content)

if __name__ == "__main__":
    generate()
