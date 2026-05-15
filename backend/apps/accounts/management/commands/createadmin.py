from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = "Create default admin user"

    def handle(self, *args, **kwargs):
        username = "admin"
        email = "admin@gmail.com"
        password = "admin123"

        # 1. Ensure User exists
        user = User.objects.filter(username=username).first()
        if not user:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created"))
        else:
            self.stdout.write(self.style.WARNING(f"Superuser '{username}' already exists"))

        # 2. Ensure StudentProfile exists and is onboarded
        # Import inside handle to avoid potential circular dependencies during startup
        from apps.core.models import StudentProfile
        
        profile, created = StudentProfile.objects.get_or_create(
            user=user,
            defaults={"is_onboarded": True}
        )

        if not created:
            if not profile.is_onboarded:
                profile.is_onboarded = True
                profile.save()
                self.stdout.write(self.style.SUCCESS(f"Existing profile for '{username}' marked as onboarded"))
            else:
                self.stdout.write(self.style.WARNING(f"Profile for '{username}' already onboarded"))
        else:
            self.stdout.write(self.style.SUCCESS(f"StudentProfile for '{username}' created and onboarded"))
