from django.contrib import admin
from .models import Skill, StudentProfile, RecruiterProfile, JobRole

class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'college_name', 'graduation_year', 'is_onboarded']
    search_fields = ['user__username', 'college_name']

class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'designation']
    search_fields = ['user__username', 'company_name']

admin.site.register(Skill)
admin.site.register(StudentProfile, StudentProfileAdmin)
admin.site.register(RecruiterProfile, RecruiterProfileAdmin)
admin.site.register(JobRole)