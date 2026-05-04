from rest_framework.routers import DefaultRouter
from .views import StudentSkillViewSet

router = DefaultRouter()
router.register(r'student-skills', StudentSkillViewSet)
urlpatterns = router.urls
