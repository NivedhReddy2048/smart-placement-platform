from django.urls import path
from .views import MessageListView, SendMessageView

urlpatterns = [
    path('', MessageListView.as_view(), name='message-list'),
    path('send/', SendMessageView.as_view(), name='message-send'),
]
