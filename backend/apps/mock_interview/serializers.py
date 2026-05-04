from rest_framework import serializers
from .models import MockInterview

class MockInterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockInterview
        fields = ['id', 'user', 'questions', 'answers', 'score', 'feedback', 'created_at']
        read_only_fields = ['id', 'user', 'score', 'feedback', 'created_at']
