from django.db import models
from django.conf import settings

class MockInterview(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mock_interviews'
    )
    questions = models.JSONField(default=list)
    answers = models.JSONField(default=dict)
    score = models.IntegerField(default=0)
    feedback = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"MockInterview({self.user.username}) score={self.score}"
