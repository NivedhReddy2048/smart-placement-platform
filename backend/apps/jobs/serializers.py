from rest_framework import serializers
from .models import JobPosting, Application

class JobPostingSerializer(serializers.ModelSerializer):
    recruiter_company_name = serializers.CharField(source='recruiter.company_name', read_only=True)
    role_name = serializers.CharField(source='role.title', read_only=True)

    class Meta:
        model = JobPosting
        fields = ['id', 'recruiter', 'recruiter_company_name', 'role', 'role_name', 'title', 'description', 'location', 'salary_range', 'is_active', 'created_at']
        read_only_fields = ['recruiter']

class ApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.username', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    recruiter_company_name = serializers.CharField(source='job.recruiter.company_name', read_only=True)
    resume_url = serializers.FileField(source='student.resume', read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'student', 'student_name', 'job', 'job_title', 'recruiter_company_name', 'status', 'match_score', 'applied_at', 'resume_url']
        read_only_fields = ['student', 'applied_at', 'match_score']
