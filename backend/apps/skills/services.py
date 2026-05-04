from apps.core.models import JobRole

class SkillGapAnalyzer:
    @staticmethod
    def analyze(student_profile, job_role):
        """
        Analyzes a student's skills against a job role's requirements.
        Returns a dictionary detailing matched skills and skill gaps.
        """
        student_skills = {ss.skill.id: ss.proficiency for ss in student_profile.skills.select_related('skill').all()}
        requirements = job_role.skill_requirements.select_related('skill').all()
        
        gaps = []
        matched = []
        
        for req in requirements:
            if req.skill.id not in student_skills:
                gaps.append({
                    "skill_id": req.skill.id,
                    "skill_name": req.skill.name,
                    "is_mandatory": req.is_mandatory,
                    "weightage": req.weightage,
                    "reason": "Missing skill completely"
                })
            else:
                matched.append({
                    "skill_id": req.skill.id,
                    "skill_name": req.skill.name,
                    "student_proficiency": student_skills[req.skill.id]
                })
                
        return {
            "gaps": gaps,
            "matched": matched,
            "total_gaps": len(gaps),
            "total_matched": len(matched)
        }


class ReadinessScoringEngine:
    @staticmethod
    def calculate_score(student_profile, job_role):
        """
        Calculates a readiness score (0-100) based on student skills and role requirements.
        """
        student_skills = set(ss.skill.id for ss in student_profile.skills.all())
        requirements = job_role.skill_requirements.all()
        
        if not requirements:
            return 0.0
            
        total_weight = sum(req.weightage for req in requirements)
        if total_weight <= 0:
            return 0.0
            
        earned_weight = 0.0
        mandatory_missed = False
        
        for req in requirements:
            if req.skill.id in student_skills:
                earned_weight += req.weightage
            elif req.is_mandatory:
                mandatory_missed = True
                
        score = (earned_weight / total_weight) * 100
        
        # Apply a harsh penalty if any mandatory skill is missed
        if mandatory_missed:
            score *= 0.5  # Cut the score in half if mandatory skills are lacking
            
        return round(score, 2)
