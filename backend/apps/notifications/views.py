from rest_framework import viewsets, permissions
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own notifications
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user to the notification
        serializer.save(user=self.request.user)
