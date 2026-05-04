from apps.skills.services import SkillGapAnalyzer
from .models import WeeklyRecommendation
from apps.core.models import Skill

class RecommendationEngine:
    @staticmethod
    def generate_weekly_plan(student_profile, target_role):
        """
        Generates a weekly recommendation plan based on skill gaps for a target role.
        """
        gap_analysis = SkillGapAnalyzer.analyze(student_profile, target_role)
        gaps = gap_analysis.get('gaps', [])
        
        # Sort gaps by weightage (descending) to prioritize important skills
        gaps.sort(key=lambda x: x.get('weightage', 1.0), reverse=True)
        
        # Pick top 3 skills to focus on this week
        top_skills_to_learn = gaps[:3]
        
        action_plan_lines = []
        action_plan_lines.append(f"Target Role: {target_role.title}\n")
        action_plan_lines.append("Focus areas for this week:")
        
        recommended_skill_ids = []
        if not top_skills_to_learn:
            action_plan_lines.append("- You successfully matched all requirements! Apply for jobs now.")
        else:
            for gap in top_skills_to_learn:
                skill_name = gap.get('skill_name')
                recommended_skill_ids.append(gap.get('skill_id'))
                mandatory_tag = "(Mandatory)" if gap.get('is_mandatory') else ""
                action_plan_lines.append(f"- Learn {skill_name} {mandatory_tag}")
            
        action_plan_text = "\n".join(action_plan_lines)
        
        recommendation = WeeklyRecommendation.objects.create(
            student=student_profile,
            target_role=target_role,
            action_plan=action_plan_text
        )
        
        # Add ManyToMany relations
        if recommended_skill_ids:
            skills_qs = Skill.objects.filter(id__in=recommended_skill_ids)
            recommendation.recommended_skills.set(skills_qs)
        
        return recommendation
