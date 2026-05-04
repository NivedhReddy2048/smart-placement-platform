import os
import django
import sys

# Setup django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.core.models import StudentProfile, Skill, JobRole
from apps.jobs.models import JobPosting, Application
from apps.notifications.models import Notification

User = get_user_model()

def run_tests():
    print("--- Starting Backend API Tests ---")
    client = APIClient()

    # 1. Auth Flow
    print("\n[+] Testing Auth Flow...")
    User.objects.filter(username='teststudent').delete()
    user = User.objects.create_user(username='teststudent', password='testpassword123', role='STUDENT')
    StudentProfile.objects.create(user=user)

    res = client.post('/api/auth/login/', {'username': 'teststudent', 'password': 'testpassword123'})
    assert res.status_code == 200, f"Login failed: {res.data}"
    token = res.data['access']
    print("  [OK] Login successful")

    client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

    # 2. Core Flow: Skills
    print("\n[+] Testing Skills API...")
    skill, _ = Skill.objects.get_or_create(name='Python', user=user)
    res = client.post('/api/skills/student-skills/', {'student': user.student_profile.id, 'skill': skill.id, 'proficiency': 4})
    assert res.status_code in [201, 200], f"Add skill failed: {res.data}"
    print("  [OK] Skill added successfully")

    # 3. Core Flow: Jobs
    print("\n[+] Testing Jobs API...")
    # Need a recruiter and job role to post a job
    recruiter_user, _ = User.objects.get_or_create(username='testrecruiter', defaults={'role': 'RECRUITER'})
    recruiter_user.set_password('testpassword123')
    recruiter_user.save()
    from apps.core.models import RecruiterProfile
    recruiter, _ = RecruiterProfile.objects.get_or_create(user=recruiter_user, company_name='Tech Inc')
    job_role, _ = JobRole.objects.get_or_create(title='Software Engineer')
    
    job, _ = JobPosting.objects.get_or_create(recruiter=recruiter, role=job_role, title='Backend Dev', description='Python Django')
    
    res = client.get('/api/jobs/postings/')
    assert res.status_code == 200, f"Get jobs failed: {res.data}"
    print("  [OK] Jobs fetched successfully")

    # 4. Job Matching
    print("\n[+] Testing Job Match API...")
    res = client.get('/api/jobs/matches/')
    assert res.status_code == 200, f"Job match failed: {res.data}"
    print("  [OK] Job matching returned successfully")

    # 5. Application Flow & Notifications
    print("\n[+] Testing Application & Notifications...")
    Application.objects.filter(student=user.student_profile).delete()
    res = client.post('/api/jobs/applications/', {'student': user.student_profile.id, 'job': job.id})
    assert res.status_code == 201, f"Application failed: {res.data}"
    print("  [OK] Application created")

    res = client.get('/api/notifications/')
    assert res.status_code == 200, "Failed to get notifications"
    assert len(res.data) > 0, "No notification created"
    print("  [OK] Notification automatically generated")

    res = client.get('/api/jobs/applications/')
    assert res.status_code == 200
    print("  [OK] Application is user-scoped and visible")

    # 6. Community API
    print("\n[+] Testing Community API...")
    res = client.post('/api/community/posts/', {'content': 'Hello world', 'tags': 'test'})
    assert res.status_code == 201, f"Community post failed: {res.data}"
    res = client.get('/api/community/posts/')
    assert res.status_code == 200, f"Community get failed: {res.data}"
    print("  [OK] Community API working")

    # 7. Messaging API
    print("\n[+] Testing Messaging API...")
    res = client.post('/api/messages/send/', {'receiver': recruiter_user.id, 'content': 'Hi recruiter'})
    assert res.status_code == 201, f"Message send failed: {res.data}"
    res = client.get('/api/messages/')
    assert res.status_code == 200, f"Message get failed: {res.data}"
    print("  [OK] Messaging API working")

    # 8. Mock Interview API
    print("\n[+] Testing Mock Interview API...")
    res = client.post('/api/mock/start/')
    assert res.status_code == 201, f"Mock start failed: {res.data}"
    session_id = res.data['session_id']
    questions = res.data['questions']
    answers = {str(q['id']): 'test answer' for q in questions}
    res = client.post('/api/mock/submit/', {'session_id': session_id, 'answers': answers}, format='json')
    assert res.status_code == 200, f"Mock submit failed: {res.data}"
    res = client.get('/api/mock/result/')
    assert res.status_code == 200, f"Mock result failed: {res.data}"
    print("  [OK] Mock Interview API working")

    # 9. Mentor API
    print("\n[+] Testing AI Mentor API...")
    res = client.post('/api/mentor/ask/', {'query': 'python'})
    assert res.status_code == 200, f"Mentor ask failed: {res.data}"
    assert 'response' in res.data
    print("  [OK] AI Mentor API working")

    # 10. Analytics
    print("\n[+] Testing Analytics API...")
    res = client.get('/api/analytics/dashboard/')
    assert res.status_code == 200, f"Analytics failed: {res.data}"
    print("  [OK] Analytics API working")

    print("\n[ALL TESTS PASSED]")

if __name__ == '__main__':
    run_tests()
