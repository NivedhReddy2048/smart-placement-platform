from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from apps.core.models import StudentProfile, RecruiterProfile

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Automatically create profiles based on user role
        role = getattr(instance, 'role', 'STUDENT')
        if role == 'STUDENT':
            StudentProfile.objects.get_or_create(user=instance)
        elif role == 'RECRUITER':
            # Avoid conflict with registration serializer which also creates/updates profile
            if not hasattr(instance, 'recruiter_profile'):
                RecruiterProfile.objects.get_or_create(user=instance, defaults={'company_name': 'Pending...'})