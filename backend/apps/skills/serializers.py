from rest_framework import serializers
from .models import StudentSkill

class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.ReadOnlyField(source='skill.name')
    
    class Meta:
        model = StudentSkill
        fields = ['id', 'student', 'skill', 'skill_name', 'proficiency']
