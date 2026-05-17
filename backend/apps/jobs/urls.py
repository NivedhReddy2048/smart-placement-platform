from rest_framework.routers import DefaultRouter
from .views import JobPostingViewSet, ApplicationViewSet, JobMatchView, RecruiterStatsView
from django.urls import path

router = DefaultRouter()
router.register(r'postings', JobPostingViewSet)
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = router.urls + [
    path("match/", JobMatchView.as_view(), name="job-matches"),
    path("stats/", RecruiterStatsView.as_view(), name="recruiter-stats"),
]
