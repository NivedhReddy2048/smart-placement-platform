from django.urls import path
from .views import StartMockView, SubmitMockView, MockResultView

urlpatterns = [
    path('start/', StartMockView.as_view(), name='mock-start'),
    path('submit/', SubmitMockView.as_view(), name='mock-submit'),
    path('result/', MockResultView.as_view(), name='mock-result'),
]
