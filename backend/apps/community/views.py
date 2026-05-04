from rest_framework import viewsets, permissions
from .models import Post
from .serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Public feed — all posts visible to authenticated users
        return Post.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
