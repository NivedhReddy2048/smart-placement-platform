from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import MockInterview
from .serializers import MockInterviewSerializer

# Static question bank — expand as needed
QUESTION_BANK = [
    {"id": 1, "question": "Explain the difference between a stack and a queue.", "keywords": ["stack", "queue", "lifo", "fifo", "push", "pop", "enqueue", "dequeue"]},
    {"id": 2, "question": "What is a REST API and what are its key principles?", "keywords": ["rest", "stateless", "http", "get", "post", "put", "delete", "resource", "endpoint"]},
    {"id": 3, "question": "What is the difference between SQL and NoSQL databases?", "keywords": ["sql", "nosql", "relational", "schema", "mongodb", "mysql", "postgres", "scalable"]},
    {"id": 4, "question": "Explain how JWT authentication works.", "keywords": ["jwt", "token", "header", "payload", "signature", "bearer", "auth", "secret"]},
    {"id": 5, "question": "What is time complexity and why does it matter?", "keywords": ["time complexity", "big o", "o(n)", "o(1)", "o(log n)", "algorithm", "efficiency"]},
]


def _score_answer(question_obj: dict, answer: str) -> dict:
    """Simple keyword-based scorer. Returns score 0-10 and brief feedback."""
    answer_lower = answer.lower()
    keywords = question_obj.get("keywords", [])
    hits = [kw for kw in keywords if kw in answer_lower]
    score = min(10, round((len(hits) / max(len(keywords), 1)) * 10))

    if score >= 8:
        feedback = "Excellent answer — covered key concepts well."
    elif score >= 5:
        feedback = f"Good attempt. You missed: {', '.join(set(keywords) - set(hits))[:60]}."
    elif score >= 2:
        feedback = f"Partial answer. Focus on: {', '.join(keywords[:3])}."
    else:
        feedback = f"Needs improvement. Key concepts to revisit: {', '.join(keywords[:3])}."

    return {"score": score, "feedback": feedback, "matched_keywords": hits}


class StartMockView(APIView):
    """POST /api/mock/start/ — Returns 3 random questions for the session."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        import random
        questions = random.sample(QUESTION_BANK, min(3, len(QUESTION_BANK)))
        session = MockInterview.objects.create(
            user=request.user,
            questions=questions,
        )
        return Response({
            "session_id": session.id,
            "questions": [{"id": q["id"], "question": q["question"]} for q in questions]
        }, status=status.HTTP_201_CREATED)


class SubmitMockView(APIView):
    """POST /api/mock/submit/ — Accepts answers, scores them, saves result."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get("session_id")
        answers = request.data.get("answers", {})  # {question_id: "answer text"}

        try:
            session = MockInterview.objects.get(id=session_id, user=request.user)
        except MockInterview.DoesNotExist:
            return Response({"error": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        total_score = 0
        feedback_list = []

        for question_obj in session.questions:
            qid = str(question_obj["id"])
            answer_text = answers.get(qid, "")
            result = _score_answer(question_obj, answer_text)
            total_score += result["score"]
            feedback_list.append({
                "question": question_obj["question"],
                "your_answer": answer_text,
                "score": result["score"],
                "feedback": result["feedback"],
            })

        # Normalize to 100
        max_score = len(session.questions) * 10
        final_score = round((total_score / max_score) * 100) if max_score else 0

        session.answers = answers
        session.score = final_score
        session.feedback = feedback_list
        session.save()

        return Response({
            "session_id": session.id,
            "final_score": final_score,
            "feedback": feedback_list,
        })


class MockResultView(APIView):
    """GET /api/mock/result/ — Returns the latest mock interview result for the user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session = MockInterview.objects.filter(user=request.user).first()
        if not session:
            return Response({"error": "No mock interview sessions found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = MockInterviewSerializer(session)
        return Response(serializer.data)
