from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

from apps.analyzer.views import ResumeAnalyzeView, JobMatchAnalyzeView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def test_view(request):
    return JsonResponse({"status": "working"})


urlpatterns = [
    path('admin/', admin.site.urls),

    path('test/', test_view),

    path('api/auth/', include('apps.accounts.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/skills/', include('apps.skills.urls')),
    path('api/analyzer/', include('apps.analyzer.urls')),
    path('api/resume/analyze/', ResumeAnalyzeView.as_view(), name='resume-analyze'),
    path('api/resume-match-job/', JobMatchAnalyzeView.as_view(), name='resume-match-job'),
    path('api/recommendations/', include('apps.recommendations.urls')),
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/community/', include('apps.community.urls')),
    path('api/messages/', include('apps.messaging.urls')),
    path('api/mock/', include('apps.mock_interview.urls')),
    path('api/mentor/', include('apps.mentor.urls')),
    path('api-auth/', include('rest_framework.urls')),
]