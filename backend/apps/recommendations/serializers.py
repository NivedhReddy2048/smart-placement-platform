from rest_framework import serializers
from .models import WeeklyRecommendation

class WeeklyRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyRecommendation
        fields = '__all__'
