from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ResumeViewSet, ResumeReportDownloadView

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet)
urlpatterns = router.urls

urlpatterns += [
    path('download-report/', ResumeReportDownloadView.as_view(), name='resume-download-report'),
]
