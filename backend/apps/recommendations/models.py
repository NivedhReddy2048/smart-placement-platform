from django.db import models
from apps.core.models import StudentProfile, Skill, JobRole

class WeeklyRecommendation(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='recommendations')
    target_role = models.ForeignKey(JobRole, on_delete=models.SET_NULL, null=True, blank=True)
    recommended_skills = models.ManyToManyField(Skill, blank=True)
    action_plan = models.TextField(help_text="Weekly plan generated for the student")
    created_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Plan for {self.student.user.username} - {self.created_at.date()}"
