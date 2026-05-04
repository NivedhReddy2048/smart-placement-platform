from rest_framework.routers import DefaultRouter
from .views import JobPostingViewSet, ApplicationViewSet, JobMatchView
from django.urls import path

router = DefaultRouter()
router.register(r'postings', JobPostingViewSet)
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = router.urls + [
    path("matches/", JobMatchView.as_view(), name="job-matches"),
]
