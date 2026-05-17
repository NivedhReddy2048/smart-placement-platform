from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from apps.core.models import Skill, StudentProfile
from .models import StudentSkill
from .serializers import StudentSkillSerializer

class StudentSkillViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudentSkill.objects.filter(student=self.request.user.student_profile)

    def create(self, request, *args, **kwargs):
        skill_name = request.data.get("name")
        if not skill_name:
            raise ValidationError({"name": "Skill name is required"})

        try:
            student = request.user.student_profile
        except Exception:
            raise ValidationError("Student profile not found")

        skill_obj, _ = Skill.objects.get_or_create(
            name=skill_name.strip().lower(),
            defaults={'user': request.user}
        )

        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        data['skill'] = skill_obj.id
        data['student'] = student.id
        data['proficiency'] = data.get('proficiency', 1)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        try:
            student = self.request.user.student_profile
        except Exception:
            raise ValidationError("Student profile not found")

        skill_name = self.request.data.get("name")
        if not skill_name:
            raise ValidationError("Skill name is required")

        skill_obj, _ = Skill.objects.get_or_create(
            name=skill_name.strip().lower(),
            defaults={'user': self.request.user}
        )

        serializer.save(
            student=student,
            skill=skill_obj,
            proficiency=1
        )

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        skills = request.data.get('skills', [])
        if not isinstance(skills, list):
            raise ValidationError("Skills must be a list of names")
            
        try:
            student = request.user.student_profile
        except Exception:
            raise ValidationError("Student profile not found")
            
        created_count = 0
        for name in skills:
            if not name: continue
            skill_obj, _ = Skill.objects.get_or_create(
                name=name.strip().lower(),
                defaults={'user': request.user}
            )
            StudentSkill.objects.get_or_create(
                student=student,
                skill=skill_obj,
                defaults={'proficiency': 1}
            )
            created_count += 1
            
        return Response({"status": "success", "created": created_count}, status=status.HTTP_201_CREATED)
