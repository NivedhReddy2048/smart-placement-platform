from django.db import models
from apps.core.models import StudentProfile


class Resume(models.Model):
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE, related_name='parsed_resume')
    file = models.FileField(upload_to='resumes/uploads/')
    parsed_text = models.TextField(blank=True, null=True)
    is_parsed = models.BooleanField(default=False)
    # Cached AI analysis result — populated by ResumeAnalyzeView when user is authenticated
    analysis_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Resume of {self.student.user.username}"
