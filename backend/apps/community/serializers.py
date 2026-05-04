from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='user.username', read_only=True)
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'tags', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']

    def get_tags(self, obj):
        if not obj.tags:
            return []
        return [t.strip() for t in obj.tags.split(",") if t.strip()]
