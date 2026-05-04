from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist

from .models import Skill, JobRole, StudentProfile
from .serializers import SkillSerializer, JobRoleSerializer, StudentProfileSerializer


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class JobRoleViewSet(viewsets.ModelViewSet):
    queryset = JobRole.objects.all()
    serializer_class = JobRoleSerializer


class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer


class StudentDashboardAPIView(APIView):
    """
    Career Control Center endpoint.
    Returns enriched payload: verdict, career progress, blockers, actions,
    skill gap, job insights, and recent activity — all in one authenticated call.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.student_profile
        except ObjectDoesNotExist:
            return Response(
                {"error": "Student profile not found for the logged-in user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── 1. Resume analysis snapshot ───────────────────────────────────
        has_resume = False
        analysis = {}
        last_analyzed = None
        try:
            resume = profile.parsed_resume
            if resume and resume.analysis_data:
                has_resume = True
                analysis = resume.analysis_data
                last_analyzed = resume.updated_at.strftime("%Y-%m-%d")
        except Exception:
            pass

        # ── 2. Skills data ────────────────────────────────────────────────
        skill_names = []
        skill_count = 0
        try:
            from apps.skills.models import StudentSkill
            skills_qs = StudentSkill.objects.filter(student=profile).select_related('skill')
            skill_names = [s.skill.name for s in skills_qs]
            skill_count = len(skill_names)
        except Exception:
            pass

        # Also pull simpler Skill model from core (used by /core/skills/ endpoint)
        try:
            core_skills = list(Skill.objects.filter(user=request.user).values_list('name', flat=True))
            if core_skills:
                skill_names = list(set(skill_names + core_skills))
                skill_count = len(skill_names)
        except Exception:
            pass

        # ── 3. Job matches ────────────────────────────────────────────────
        total_jobs = 0
        matched_jobs = 0
        avg_match = 0
        match_reason = "Add skills and upload a resume to unlock job matching."
        try:
            from apps.jobs.models import JobPosting
            active_jobs = list(JobPosting.objects.filter(is_active=True))
            total_jobs = len(active_jobs)
            if skill_names and total_jobs > 0:
                matches = []
                for job in active_jobs:
                    job_text = f"{job.title} {job.description}".lower()
                    skill_hits = sum(1 for s in skill_names if s.lower() in job_text)
                    if skill_hits > 0:
                        match_pct = min(100, int((skill_hits / max(len(skill_names), 1)) * 100 + 20))
                        matches.append(match_pct)
                matched_jobs = len(matches)
                avg_match = int(sum(matches) / len(matches)) if matches else 0

                missing_from_analysis = analysis.get("missing_skills", [])
                if avg_match < 50 and missing_from_analysis:
                    match_reason = f"Low match due to missing: {', '.join(missing_from_analysis[:3])}."
                elif avg_match >= 80:
                    match_reason = "Strong alignment — your skills overlap well with available roles."
                elif avg_match >= 50:
                    match_reason = "Moderate match — closing skill gaps will raise your hit rate."
                else:
                    match_reason = "Add in-demand skills to improve match quality."
        except Exception:
            pass

        # ── 4. Applications count ──────────────────────────────────────────
        applications_count = 0
        try:
            from apps.jobs.models import Application
            applications_count = Application.objects.filter(student=profile).count()
        except Exception:
            pass

        # ── 5. Career progress scores ─────────────────────────────────────
        resume_strength = int(analysis.get("score", 0))
        ats_score_val = int(analysis.get("ats_score", 0))

        CORE_SKILLS = ["python", "react", "django", "sql", "docker", "aws",
                       "javascript", "typescript", "postgresql", "git"]
        matched_core = sum(1 for s in CORE_SKILLS if any(s.lower() in n.lower() for n in skill_names))
        skill_coverage = min(100, int((matched_core / len(CORE_SKILLS)) * 100)) if skill_names else 0
        skill_coverage = min(100, skill_coverage + min(30, skill_count * 3))

        job_readiness = min(100, avg_match) if matched_jobs > 0 else 0

        # ── 6. Verdict ────────────────────────────────────────────────────
        verdict = analysis.get("final_verdict", "")
        if not verdict:
            avg_progress = (resume_strength + ats_score_val + skill_coverage + job_readiness) / 4
            if avg_progress >= 80:
                verdict = "Ready to Apply"
            elif avg_progress >= 60:
                verdict = "Potential Hire"
            elif avg_progress >= 40:
                verdict = "Needs Improvement"
            else:
                verdict = "Not Ready"

        summary = analysis.get("summary", "")
        if not summary and not has_resume:
            summary = "Upload your resume to get a personalized hiring readiness verdict."

        # ── 7. Critical blockers ──────────────────────────────────────────
        raw_blockers = analysis.get("critical_blockers", [])
        critical_blockers = []
        for b in raw_blockers[:3]:
            if isinstance(b, dict):
                critical_blockers.append({
                    "issue": b.get("issue", ""),
                    "impact": f"Severity: {b.get('severity', 'High')} — directly reduces shortlisting probability.",
                })

        # ── 8. Next best actions ──────────────────────────────────────────
        impact_items = analysis.get("impact_simulation", [])
        next_actions = []
        for item in impact_items[:5]:
            if isinstance(item, dict):
                next_actions.append({
                    "action": item.get("fix", ""),
                    "expected_improvement": f"+{item.get('boost', 0)}%",
                })
        if not next_actions and not has_resume:
            next_actions = [
                {"action": "Upload your resume to the Resume Analyzer", "expected_improvement": "Unlock all insights"},
                {"action": "Add your technical skills to your profile", "expected_improvement": "+15% match rate"},
                {"action": "Browse job matches to understand role requirements", "expected_improvement": "Identify gaps"},
            ]

        # ── 9. Skill gap analysis ─────────────────────────────────────────
        strengths = analysis.get("strengths", skill_names[:3])
        missing_skills = analysis.get("missing_skills", [])

        # ── 10. Recent activity ───────────────────────────────────────────
        recent_activity = {
            "last_resume_score": resume_strength,
            "last_ats_score": ats_score_val,
            "last_analyzed": last_analyzed,
        }

        return Response({
            "verdict": verdict,
            "summary": summary,
            "has_resume": has_resume,
            "career_progress": {
                "resume_strength": resume_strength,
                "ats_score": ats_score_val,
                "skill_coverage": skill_coverage,
                "job_readiness": job_readiness,
            },
            "critical_blockers": critical_blockers,
            "next_actions": next_actions,
            "skill_gap": {
                "strengths": strengths[:6],
                "missing_high_demand": missing_skills[:6],
            },
            "skill_names": skill_names[:12],
            "job_insights": {
                "matches": matched_jobs,
                "total_jobs": total_jobs,
                "avg_match": avg_match,
                "reason": match_reason,
            },
            "recent_activity": recent_activity,
            "applications_count": applications_count,
            "ai_confidence": int(analysis.get("ai_confidence", 0)),
            # Legacy stats for backwards compatibility
            "stats": {
                "matchedRoles": matched_jobs,
                "parsedResumes": 1 if has_resume else 0,
                "pendingApps": applications_count,
                "readinessScore": resume_strength,
            },
        }, status=status.HTTP_200_OK)
