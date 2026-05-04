from rest_framework import serializers
from .models import User
from apps.core.models import StudentProfile, RecruiterProfile

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.STUDENT)
        )
        if user.role == User.Role.STUDENT:
            StudentProfile.objects.create(user=user)
        elif user.role == User.Role.RECRUITER:
            RecruiterProfile.objects.create(user=user, company_name="Company To Update")
        return user
