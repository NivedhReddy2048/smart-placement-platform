from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, JobRoleViewSet, StudentProfileViewSet
from django.urls import path
from .views import StudentDashboardAPIView

router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skills')
router.register(r'job-roles', JobRoleViewSet)
router.register(r'profiles', StudentProfileViewSet)
urlpatterns = router.urls

urlpatterns += [
    path('students/dashboard/', StudentDashboardAPIView.as_view(), name='student-dashboard'),
]
