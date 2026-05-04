from django.db import models
from apps.core.models import StudentProfile, Skill

class StudentSkill(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    proficiency = models.IntegerField(default=1) # 1 to 5 scale
    
    class Meta:
        unique_together = ('student', 'skill')

    def __str__(self):
        return f"{self.student.user.username} - {self.skill.name} ({self.proficiency})"
