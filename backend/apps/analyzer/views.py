import os
import json
import fitz
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Resume
from .serializers import ResumeSerializer
from .tasks import parse_resume_task
from openai import OpenAI
from django.http import HttpResponse
from .reports import generate_resume_report


class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer

    def perform_create(self, serializer):
        resume = serializer.save()
        parse_resume_task.delay(resume.id)


def _compute_verdict(score, ats_score, missing_skills):
    """Server-enforced verdict — overrides any AI verdict for consistency."""
    if ats_score < 70:
        return "Not Ready"
    if missing_skills:
        return "Potential Hire"
    if score > 80 and ats_score > 80:
        return "Strong Hire"
    return "Potential Hire"


def _realistic_skill_match(skills, text_lower):
    """Distribute skill densities realistically instead of clustering near 90."""
    result = {}
    for s in skills:
        count = text_lower.count(s.lower())
        if count >= 3:
            result[s] = min(90, 75 + count * 2)    # Strong: 75-90
        elif count == 2:
            result[s] = min(74, 55 + count * 8)    # Medium: 55-74
        else:
            result[s] = max(20, 30 + count * 15)   # Weak/once: 20-50
    return result


class JobMatchAnalyzeView(APIView):
    def post(self, request):
        file_obj = request.FILES.get('resume')
        job_description = request.data.get('job_description', '')

        if not file_obj:
            return Response({"error": "No resume file uploaded."}, status=400)
        if not job_description.strip():
            return Response({"error": "No job description provided."}, status=400)

        try:
            doc = fitz.open(stream=file_obj.read(), filetype="pdf")
            extracted_text = "".join(page.get_text() for page in doc).strip()

            api_key = os.environ.get("OPENAI_API_KEY")
            if not api_key:
                return Response({"error": "OpenAI API key missing."}, status=500)

            client = OpenAI(api_key=api_key)
            prompt = f"""
You are a senior technical recruiter and ATS system.

Analyze how well this resume matches the given job description AND evaluate its ATS quality.

Return STRICT JSON:

{{
  "match_score": (0-100),
  "keyword_match_percentage": (0-100),
  "ats_score": (0-92),
  "ats_breakdown": {{
    "formatting": (0-100),
    "keyword_optimization": (0-100),
    "experience_clarity": (0-100),
    "projects_quality": (0-100),
    "readability": (0-100)
  }},
  "matched_skills": ["..."],
  "missing_skills": ["..."],
  "strengths_for_role": ["..."],
  "gaps": ["..."],
  "recommendations": ["Specific, actionable improvements"],
  "resume_improvements": ["Concrete resume edits"],
  "final_verdict": "Good Fit / Moderate Fit / Poor Fit"
}}

RULES:
- Be realistic, not generous
- If key job skills are missing -> match_score max = 75
- Recommendations must be specific and practical

Resume:
\"\"\"
{extracted_text}
\"\"\"

Job Description:
\"\"\"
{job_description}
\"\"\"
"""
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert recruiter and ATS system."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            return Response(json.loads(response.choices[0].message.content))

        except Exception as e:
            return Response({"error": f"Analysis failed: {str(e)}"}, status=500)


def _cache_analysis_for_user(request, analysis_payload: dict):
    """Cache the analysis result to Resume.analysis_data for authenticated students."""
    try:
        if not request.user or not request.user.is_authenticated:
            return
        profile = request.user.student_profile
        resume, _ = Resume.objects.get_or_create(
            student=profile,
            defaults={"file": "", "is_parsed": True}
        )
        resume.analysis_data = analysis_payload
        resume.is_parsed = True
        resume.save(update_fields=["analysis_data", "is_parsed", "updated_at"])
    except Exception:
        pass  # Non-critical — dashboard degrades gracefully


class ResumeAnalyzeView(APIView):
    def post(self, request):
        file_obj = request.FILES.get('resume')
        if not file_obj:
            return Response({"error": "No file uploaded. Please upload a PDF resume."}, status=400)

        try:
            doc = fitz.open(stream=file_obj.read(), filetype="pdf")
            extracted_text = "".join(page.get_text() for page in doc).strip()
            text_lower = extracted_text.lower()

            api_key = os.environ.get("OPENAI_API_KEY")
            if api_key:
                try:
                    client = OpenAI(api_key=api_key)
                    prompt = f"""
You are a senior technical recruiter and ATS evaluation engine used by top hiring teams.

Analyze this resume with the eye of a hiring manager. Be honest, specific, and realistic.

Return STRICT JSON (no extra text, no markdown):

{{
  "score": (integer 0-100. If missing_skills exist: max 85. Average resume = 55-65. Max any resume = 94),
  "summary": "2-3 sentence professional assessment — what the candidate is, what they are missing, overall hiring signal",
  "skills": ["concretely detected technical skills only — do NOT include soft skills"],
  "missing_skills": ["important skills absent from resume — be specific, e.g. Docker, CI/CD, system design"],
  "suggestions": [
    "Specific task-based suggestion — not generic advice. E.g.: Build a Django REST API with JWT auth + PostgreSQL and host on Railway or Render to prove backend depth"
  ],
  "resume_improvements": [
    "Concrete document edit. E.g.: Rewrite all project bullets using: Action verb + what you built + measurable result (Reduced API latency by 40%)"
  ],
  "recommended_role": "single best-fit role title",
  "role_readiness": [
    {{"role": "Best-fit Role Title", "readiness": 82}},
    {{"role": "Second Role Title", "readiness": 63}},
    {{"role": "Third Role Title", "readiness": 44}}
  ],
  "experience_level": "Entry / Junior / Mid / Senior",
  "projects_analysis": "1-sentence honest assessment of their projects — quality and impact, not just quantity",
  "strengths": ["strength backed directly by resume content — name specific skills or sections"],
  "weaknesses": ["weakness backed by what is missing or underdeveloped in the resume"],
  "score_explanation": [
    "Reason score was boosted or penalized. E.g.: Python detected across 3 projects shows real experience (+12pts)",
    "No quantified outcomes found in experience section — generic bullets (-9pts)"
  ],
  "why_verdict": [
    "Short, recruiter-style reason for the verdict. E.g.: Strong Python and SQL skills present but backend deployment experience absent",
    "No evidence of working in a team or on production systems"
  ],
  "ats_score": (integer 0-92. Average = 58-72. NEVER exceed 92. score and ats_score MUST differ by at least 5 points),
  "ats_breakdown": {{
    "formatting": (0-100),
    "keyword_optimization": (0-100),
    "experience_clarity": (0-100),
    "projects_quality": (0-100),
    "readability": (0-100)
  }},
  "ats_issues": [
    {{"issue": "Specific ATS issue referencing actual resume text. E.g.: Experience bullets describe tasks, not outcomes — no % or numbers found", "severity": "High"}},
    {{"issue": "At least 2 and up to 5 items. Severity must be High / Medium / Low based on recruiter impact", "severity": "Medium"}}
  ],
  "critical_blockers": [
    {{"issue": "Missing [specific skill] — this is a core requirement for [specific role type]; without it shortlisting probability drops significantly", "severity": "High"}},
    {{"issue": "Zero quantified achievements — recruiters skip resumes with no numbers; add at least 3 metrics (%, ms, $, users)", "severity": "High"}},
    {{"issue": "Project descriptions lack business impact — describe what problem it solved and for whom", "severity": "Medium"}}
  ],
  "impact_simulation": [
    {{"fix": "Specific, actionable fix", "boost": 8}},
    {{"fix": "Second specific fix", "boost": 6}},
    {{"fix": "Third specific fix", "boost": 5}}
  ],
  "ai_confidence": (integer 60-95, based on how much valid resume content was extracted and how readable it is)
}}

SCORING RULES — FOLLOW STRICTLY:
- score: max 85 if missing_skills exist. Max ANY resume = 94. Average entry resume = 55-65
- ats_score: MUST differ from score by at least 5 points. Average = 58-72. NEVER exceed 92
- ats_breakdown values must vary realistically — do NOT use same value for multiple fields
- ats_issues: ALWAYS return 2-5. Each MUST have severity (High/Medium/Low). Reference actual resume content
- critical_blockers: exactly 3, sorted High → Medium. Each must explain WHAT is missing AND WHY it matters for hiring
- impact_simulation: 3 fixes. Realistic boosts 4-10pts each. Total must not exceed 25pts. Max potential score = 92
- role_readiness: 3 roles with clearly different readiness scores (not clustered). Spread across at least 30pts range
- why_verdict: 2-4 short recruiter-level reasons explaining the final verdict — specific to this resume
- suggestions: must be specific tasks with context — avoid generic "learn X" or "improve resume"

Resume:
\"\"\"
{extracted_text}
\"\"\"

Return ONLY the JSON object. No markdown. No explanation outside the JSON.
"""
                    response = client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": "You are a senior technical recruiter and ATS evaluation engine. Return only valid JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={"type": "json_object"}
                    )
                    ai = json.loads(response.choices[0].message.content)

                    skill_match = _realistic_skill_match(ai.get("skills", []), text_lower)

                    from apps.jobs.models import JobPosting
                    jobs = JobPosting.objects.filter(is_active=True)
                    matched_jobs = sum(1 for job in jobs if any(
                        s.lower() in f"{job.title} {job.description}".lower()
                        for s in ai.get("skills", [])
                    ))

                    score = min(85, ai.get("score", 55)) if ai.get("missing_skills") else int(ai.get("score", 55))
                    ats_score = min(92, int(ai.get("ats_score", 58)))
                    missing = ai.get("missing_skills", [])
                    exp_level = str(ai.get("experience_level", "Entry")).lower()

                    payload = {
                        "score": score,
                        "summary": ai.get("summary", ""),
                        "skills": ai.get("skills", []),
                        "missing_skills": missing,
                        "suggestions": ai.get("suggestions", []),
                        "resume_improvements": ai.get("resume_improvements", []),
                        "experience_level": ai.get("experience_level", "Entry"),
                        "projects_analysis": ai.get("projects_analysis", ""),
                        "strengths": ai.get("strengths", []),
                        "weaknesses": ai.get("weaknesses", []),
                        "score_explanation": ai.get("score_explanation", []),
                        "recommended_role": ai.get("recommended_role", "Software Engineer"),
                        "role_readiness": ai.get("role_readiness", []),
                        "skill_match": skill_match,
                        "matched_jobs": matched_jobs,
                        "experience": exp_level not in ["entry", "fresher"],
                        "projects_count": 2,
                        "education": True,
                        "ats_score": ats_score,
                        "ats_breakdown": ai.get("ats_breakdown", {
                            "formatting": 55, "keyword_optimization": 50,
                            "experience_clarity": 50, "projects_quality": 45, "readability": 60
                        }),
                        "ats_issues": ai.get("ats_issues", []),
                        "critical_blockers": ai.get("critical_blockers", []),
                        "impact_simulation": ai.get("impact_simulation", []),
                        "ai_confidence": int(ai.get("ai_confidence", 70)),
                        "why_verdict": ai.get("why_verdict", []),
                        "final_verdict": _compute_verdict(score, ats_score, missing),
                    }
                    _cache_analysis_for_user(request, payload)
                    return Response(payload)
                except Exception as e:
                    print(f"OpenAI failed, using fallback: {e}")

            # ── FALLBACK RULE-BASED LOGIC ─────────────────────────────────────
            text = text_lower
            SKILLS_DB = [
                "python", "react", "django", "sql", "machine learning",
                "data analysis", "docker", "aws", "git", "javascript",
                "html", "css", "node.js", "typescript", "postgresql"
            ]
            EXPECTED = ["python", "django", "sql", "docker", "aws"]

            found = [s for s in SKILLS_DB if s in text]
            missing = [s for s in EXPECTED if s not in found]

            score = round((len(found) / len(EXPECTED)) * 100) if EXPECTED else 0
            score = min(85 if missing else 100, score)

            experience_flag = any(kw in text for kw in ["experience", "worked", "intern", "company"])
            projects_count = min(12, max(0, sum(text.count(kw) for kw in ["project", "developed", "built"]) // 2))
            education_flag = any(kw in text for kw in ["bachelor", "master", "university", "college"])

            suggestions = []
            resume_improvements = []
            if missing:
                suggestions.append(f"Build a project using {missing[0]} and deploy it to prove hands-on experience.")
                resume_improvements.append(f"Add a dedicated Skills section explicitly listing: {', '.join(missing)}.")
            if projects_count < 2:
                suggestions.append("Add 2–3 projects with a clear problem statement, tech choices, and measurable outcomes.")
                resume_improvements.append("Expand each project bullet: what you built + tech used + result (e.g. reduced load time by 30%).")
            if not experience_flag:
                suggestions.append("Apply for internships or freelance gigs to fill the experience gap.")
                resume_improvements.append("Add an Experience section. Even volunteer or academic work counts.")
            if len(text) < 1000:
                suggestions.append("Resume is critically short. Expand all sections to fill at least one page.")
                resume_improvements.append("Every section needs 2–4 strong bullets using action verbs + numbers.")

            ats_issues = []
            if not any(kw in text for kw in ["achieved", "improved", "reduced", "increased", "%"]):
                ats_issues.append({"issue": "No quantified outcomes found — bullets describe tasks, not impact (add %, numbers, time saved)", "severity": "High"})
            if not any(kw in text for kw in ["summary", "objective", "profile"]):
                ats_issues.append({"issue": "Missing professional summary section — ATS filters often require this to shortlist", "severity": "High"})
            if len(found) < 3:
                ats_issues.append({"issue": "Critical keyword density below threshold — ATS will not match this resume to most job postings", "severity": "High"})
            if len(text) < 1000:
                ats_issues.append({"issue": "Resume content is too sparse — ATS scoring penalizes documents under one page", "severity": "Medium"})
            if not ats_issues:
                ats_issues.append({"issue": "No bold section headers detected — use standard headers: Experience, Skills, Projects, Education", "severity": "Low"})

            critical_blockers = []
            if missing:
                critical_blockers.append({"issue": f"Missing {missing[0]} — a core requirement for backend and full-stack roles; without it shortlisting probability drops sharply", "severity": "High"})
            if not any(kw in text for kw in ["achieved", "improved", "%"]):
                critical_blockers.append({"issue": "Zero quantified achievements — recruiters and ATS both penalize resumes with no numbers; add at least 3 metrics (%, ms, users, $ saved)", "severity": "High"})
            if projects_count < 2:
                critical_blockers.append({"issue": "Project section is too thin — you need 2–3 projects with a problem statement, tech stack, and measurable outcome to be credible", "severity": "Medium"})
            critical_blockers = critical_blockers[:3]

            impact_simulation = []
            if missing:
                impact_simulation.append({"fix": f"Build a deployed project using {missing[0]} (REST API + database + hosting)", "boost": 8})
            impact_simulation.append({"fix": "Rewrite 3+ experience bullets with: action verb + what you built + measurable result", "boost": 6})
            impact_simulation.append({"fix": "Add a 3-sentence professional summary at the top of the resume", "boost": 5})

            recommended_role = "Software Engineer"
            if "react" in found and "django" in found: recommended_role = "Full Stack Developer"
            elif "react" in found: recommended_role = "Frontend Developer"
            elif "django" in found: recommended_role = "Backend Developer"
            if "machine learning" in found: recommended_role = "ML Engineer"

            role_readiness = [
                {"role": recommended_role, "readiness": min(85, score)},
                {"role": "Software Engineer", "readiness": min(72, score - 10)},
                {"role": "Junior Developer", "readiness": min(60, score - 18)},
            ]

            skill_match = _realistic_skill_match(found, text)
            score_explanation = []
            if found: score_explanation.append(f"Detected {len(found)} relevant skills in resume (+{len(found)*5}pts).")
            if missing: score_explanation.append(f"Missing {', '.join(missing[:2])} penalized score significantly.")
            if not experience_flag: score_explanation.append("No work experience section detected (-10pts).")

            # Enforce: ATS score must differ from resume score by at least 5pts
            ats_score = min(92, max(30, score - 10 + (5 if education_flag else 0) + (5 if experience_flag else 0)))
            if abs(ats_score - score) < 5:
                ats_score = max(30, min(92, ats_score - 7))
            ats_breakdown = {
                "formatting": min(88, 48 + (12 if education_flag else 0) + (5 if experience_flag else 0)),
                "keyword_optimization": min(85, len(found) * 10),
                "experience_clarity": 65 if experience_flag else 25,
                "projects_quality": min(78, 32 + projects_count * 12),
                "readability": 60 if len(text) > 800 else 35,
            }

            summary = (
                f"This candidate demonstrates {', '.join(found[:2])} skills" if found
                else "This resume lacks core technical keyword matches"
            )
            if missing:
                summary += f" but is missing critical skills ({', '.join(missing[:2])}) needed for target roles."
            elif found:
                summary += " and covers the expected baseline skill requirements."

            from apps.jobs.models import JobPosting
            jobs = JobPosting.objects.filter(is_active=True)
            matched_jobs = sum(1 for job in jobs if any(
                s in f"{job.title} {job.description}".lower() for s in found
            ))

            why_verdict = []
            verdict = _compute_verdict(score, ats_score, missing)
            if missing:
                why_verdict.append(f"Missing critical skills ({', '.join(missing[:2])}) required for most target roles")
            if not experience_flag:
                why_verdict.append("No work experience detected — this is a strong signal for recruiters")
            if projects_count < 2:
                why_verdict.append("Project portfolio is too thin to demonstrate practical ability")
            if not any(kw in text for kw in ["achieved", "improved", "%"]):
                why_verdict.append("No quantified achievements present — reduces trust in stated capabilities")
            if not why_verdict:
                why_verdict.append("Strong skill coverage detected across most core requirements")

            fallback_payload = {
                "score": score,
                "skills": found,
                "missing_skills": missing,
                "suggestions": suggestions,
                "resume_improvements": resume_improvements,
                "summary": summary,
                "experience": experience_flag,
                "projects_count": projects_count,
                "education": education_flag,
                "recommended_role": recommended_role,
                "role_readiness": role_readiness,
                "skill_match": skill_match,
                "matched_jobs": matched_jobs,
                "strengths": found[:3] if found else ["Clean structure"],
                "weaknesses": missing[:2] if missing else ["Content depth"],
                "experience_level": "Mid" if experience_flag else "Entry",
                "projects_analysis": f"Detected approximately {projects_count} project references.",
                "score_explanation": score_explanation,
                "ats_score": ats_score,
                "ats_breakdown": ats_breakdown,
                "ats_issues": ats_issues,
                "critical_blockers": critical_blockers,
                "impact_simulation": impact_simulation,
                "ai_confidence": 62,
                "why_verdict": why_verdict,
                "final_verdict": verdict,
            }
            _cache_analysis_for_user(request, fallback_payload)
            return Response(fallback_payload)

        except Exception as e:
            return Response({"error": f"Failed to parse PDF: {str(e)}"}, status=500)

class ResumeReportDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.student_profile
            resume = profile.parsed_resume
            if not resume or not resume.analysis_data:
                return Response({"error": "No analysis data found. Please analyze your resume first."}, status=400)
            
            report_stream = generate_resume_report(resume.analysis_data, request.user.username)
            
            response = HttpResponse(
                report_stream.read(),
                content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
            response['Content-Disposition'] = 'attachment; filename="resume-analysis-report.docx"'
            return response
        except Exception as e:
            return Response({"error": f"Failed to generate report: {str(e)}"}, status=500)

