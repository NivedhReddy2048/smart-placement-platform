from django.contrib import admin
from .models import JobPosting, Application

class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['title', 'get_company_name', 'role', 'is_active', 'created_at']
    list_filter = ['is_active', 'role']
    search_fields = ['title', 'description', 'recruiter__company_name']

    def get_company_name(self, obj):
        try:
            return obj.recruiter.company_name
        except Exception:
            return "No Company"
    get_company_name.short_description = 'Company'

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'job', 'status', 'match_score', 'applied_at']
    list_filter = ['status']
    search_fields = ['student__user__username', 'job__title']

admin.site.register(JobPosting, JobPostingAdmin)
admin.site.register(Application, ApplicationAdmin)