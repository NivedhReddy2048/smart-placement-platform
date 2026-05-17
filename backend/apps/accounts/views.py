from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserRegisterSerializer, CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegisterSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import update_session_auth_hash
from .serializers import ChangePasswordSerializer

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if user.check_password(serializer.data.get('old_password')):
                user.set_password(serializer.data.get('new_password'))
                user.save()
                update_session_auth_hash(request, user)  # To keep session alive if using sessions
                return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
            return Response({'old_password': ['Incorrect old password']}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        # The requirement says: "Prevent deleting recruiter/admin accidentally".
        # However, the user is deleting THEIR OWN account.
        # If the user is an admin, we might want to block it.
        if user.is_staff or user.is_superuser:
            return Response({'error': 'Administrators cannot delete their own accounts via this endpoint.'}, status=status.HTTP_403_FORBIDDEN)
            
        user.delete()
        return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
        
        # Add profile specific info
        try:
            if user.role == 'STUDENT':
                data['is_onboarded'] = user.student_profile.is_onboarded
                data['profile_id'] = user.student_profile.id
            elif user.role == 'RECRUITER':
                data['is_onboarded'] = True
                data['profile_id'] = user.recruiter_profile.id
                data['company_name'] = user.recruiter_profile.company_name
            else:
                data['is_onboarded'] = True
        except Exception:
            data['is_onboarded'] = False
            
        return Response(data)
