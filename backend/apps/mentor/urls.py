from django.urls import path
from .views import MentorAskView

urlpatterns = [
    path('ask/', MentorAskView.as_view(), name='mentor-ask'),
]
