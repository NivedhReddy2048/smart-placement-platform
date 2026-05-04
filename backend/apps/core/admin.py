from django.contrib import admin
from .models import Skill, StudentProfile, RecruiterProfile, JobRole

admin.site.register(Skill)
admin.site.register(StudentProfile)
admin.site.register(RecruiterProfile)
admin.site.register(JobRole)