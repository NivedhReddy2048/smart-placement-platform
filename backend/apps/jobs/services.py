from apps.skills.services import ReadinessScoringEngine
from .models import JobPosting

class JobMatchingEngine:
    @staticmethod
    def get_recommended_jobs(student_profile, limit=10):
        """
        Returns a list of matching active JobPostings for a student,
        sorted by their readiness score for those jobs.
        """
        active_jobs = JobPosting.objects.filter(is_active=True).select_related('role', 'recruiter')
        
        matches = []
        for job in active_jobs:
            score = ReadinessScoringEngine.calculate_score(student_profile, job.role)
            # Only recommend if score is above zero
            if score > 0:
                matches.append({
                    "job": job,
                    "score": score
                })
                
        # Sort matches descending by score
        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:limit]

    @staticmethod
    def get_best_candidates(job_posting, limit=10):
        """
        Returns a list of students best suited for a specific JobPosting.
        """
        from apps.core.models import StudentProfile
        all_students = StudentProfile.objects.all().select_related('user')
        
        candidates = []
        for student in all_students:
            score = ReadinessScoringEngine.calculate_score(student, job_posting.role)
            if score > 0:
                candidates.append({
                    "student": student,
                    "score": score
                })
                
        candidates.sort(key=lambda x: x["score"], reverse=True)
        return candidates[:limit]
