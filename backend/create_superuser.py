import os
import django

# Set the default settings module for Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Initialize Django
django.setup()

from django.contrib.auth import get_user_model

def create_superuser_from_env():
    User = get_user_model()
    
    # Read environment variables
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
    
    # Check if all required environment variables are set
    if not username or not email or not password:
        print("Superuser environment variables are missing. Skipping superuser creation.")
        return

    # Check if a user with this username or email already exists
    if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
        print("Superuser already exists")
    else:
        # Create the superuser
        User.objects.create_superuser(username=username, email=email, password=password)
        print("Superuser created")

if __name__ == "__main__":
    create_superuser_from_env()
