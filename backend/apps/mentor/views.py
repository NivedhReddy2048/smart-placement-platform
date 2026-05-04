from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# Rule-based response map — expandable without touching the API contract
MENTOR_RULES = [
    (["dsa", "data structure", "algorithm", "leetcode"], "Focus on DSA fundamentals: Arrays, LinkedLists, Trees, Graphs, and DP. Practice on LeetCode (Easy → Medium). Aim for 2-3 problems per day."),
    (["system design", "hld", "lld", "architecture"], "For system design, study scalability, load balancing, caching, and databases. Read 'Designing Data-Intensive Applications' and practice on Excalidraw."),
    (["resume", "cv"], "Your resume should be 1 page, ATS-friendly, with action verbs and measurable outcomes. Use our Resume Analyzer for detailed feedback."),
    (["interview", "prep", "preparation"], "Prepare with: 1) Mock interviews (use our Prep Guide), 2) Company-specific DSA, 3) Behavioral (STAR format), 4) System Design basics."),
    (["job", "placement", "apply", "application"], "Check your Job Matches section to find roles that fit your skill profile. Keep applying consistently and follow up."),
    (["python", "django", "backend"], "Strengthen your backend skills by building a REST API with Django + DRF, add JWT auth, connect PostgreSQL, and deploy to Railway or Render."),
    (["react", "frontend", "javascript", "nextjs"], "Build a full frontend project in Next.js: add routing, API calls, and authentication. Deploy to Vercel for a live portfolio piece."),
    (["machine learning", "ml", "ai", "deep learning"], "Start with scikit-learn and Pandas for classical ML. Then move to PyTorch/TensorFlow. Build a project like a sentiment analyzer or recommendation engine."),
    (["sql", "database", "postgres", "mysql"], "Master SQL: JOINs, subqueries, indexes, and transactions. Practice on HackerRank SQL or SQLZoo. Then learn query optimization."),
    (["skill", "learn", "upskill"], "Identify your top 3 missing skills from the Skill Intelligence section and focus one skill per week with a hands-on mini-project."),
]

DEFAULT_RESPONSE = (
    "Great question! Focus on building a strong project portfolio, "
    "sharpen your DSA skills, and apply consistently to relevant job matches. "
    "Use the Skill Intelligence section to find your gaps."
)


def _get_mentor_response(query: str) -> str:
    query_lower = query.lower()
    for keywords, response in MENTOR_RULES:
        if any(kw in query_lower for kw in keywords):
            return response
    return DEFAULT_RESPONSE


class MentorAskView(APIView):
    """POST /api/mentor/ask/ — Rule-based AI mentor response."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get("query", "").strip()
        if not query:
            return Response({"error": "Please provide a query."}, status=400)
        return Response({"response": _get_mentor_response(query)})
