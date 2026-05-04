from rest_framework.routers import DefaultRouter
from .views import WeeklyRecommendationViewSet

router = DefaultRouter()
router.register(r'plans', WeeklyRecommendationViewSet)
urlpatterns = router.urls
