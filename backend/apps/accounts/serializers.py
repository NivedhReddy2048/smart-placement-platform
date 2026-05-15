from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom data safely
        if self.user:
            data['username'] = self.user.username
            data['email'] = self.user.email
            data['role'] = getattr(self.user, 'role', 'STUDENT')
            
            # Add onboarding status
            try:
                if self.user.role == 'STUDENT':
                    data['is_onboarded'] = self.user.student_profile.is_onboarded
                elif self.user.role == 'RECRUITER':
                    data['is_onboarded'] = True # Recruiters are always onboarded for now
                else:
                    data['is_onboarded'] = True
            except Exception:
                data['is_onboarded'] = False
        
        return data

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')

    def create(self, validated_data):
        # Profile creation is now handled automatically via signals in apps.core.signals
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.STUDENT)
        )
        return user
