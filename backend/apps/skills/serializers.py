from rest_framework import serializers
from .models import StudentSkill

class StudentSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSkill
        fields = '__all__'
