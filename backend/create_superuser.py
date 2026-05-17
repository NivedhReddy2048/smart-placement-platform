import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

if username and email and password:
    user, created = User.objects.get_or_create(
        username=username,
        defaults={"email": email}
    )

    # FORCE UPDATE PASSWORD EVERY DEPLOY
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.save()

    if created:
        print("Superuser created")
    else:
        print("Superuser password updated")

else:
    print("Missing superuser environment variables")