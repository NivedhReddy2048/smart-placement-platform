from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction
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
    company_name = serializers.CharField(required=False, write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'company_name')

    def validate(self, attrs):
        role = attrs.get('role', User.Role.STUDENT)
        if role == User.Role.RECRUITER and not attrs.get('company_name'):
            raise serializers.ValidationError({"company_name": "Company name is required for recruiters."})
        return attrs

    def create(self, validated_data):
        role = validated_data.get('role', User.Role.STUDENT)
        company_name = validated_data.pop('company_name', None)
        
        with transaction.atomic():
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data.get('email', ''),
                password=validated_data['password'],
                role=role
            )

            if role == User.Role.RECRUITER:
                from apps.core.models import RecruiterProfile
                RecruiterProfile.objects.update_or_create(
                    user=user, 
                    defaults={'company_name': company_name}
                )
            
            return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})
        return attrs
