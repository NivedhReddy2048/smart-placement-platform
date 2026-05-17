from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    college_name = models.CharField(max_length=255, blank=True, null=True)
    graduation_year = models.IntegerField(blank=True, null=True)
    degree = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    experience_level = models.CharField(max_length=50, blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    is_onboarded = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Student Profile: {self.user.username}"


class RecruiterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"Recruiter Profile: {self.user.username} at {self.company_name}"


class Skill(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="skills")

    def __str__(self):
        return self.name


class JobRole(models.Model):
    title = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.title


class RoleSkillRequirement(models.Model):
    job_role = models.ForeignKey(JobRole, on_delete=models.CASCADE, related_name='skill_requirements')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    weightage = models.FloatField(default=1.0)
    is_mandatory = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('job_role', 'skill')
        
    def __str__(self):
        return f"{self.job_role.title} requires {self.skill.name}"
