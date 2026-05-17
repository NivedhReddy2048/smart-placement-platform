# 📦 Deployment Guide

Follow these steps to deploy the Smart Placement Platform to production.

## 1. Backend (Render)

### Environment Variables
Set the following on Render:
- `SECRET_KEY`: Your Django secret key.
- `DEBUG`: `False`
- `DATABASE_URL`: Connection string for your PostgreSQL instance.
- `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
- `ALLOWED_HOSTS`: `your-backend.onrender.com`

### Deployment Steps
1. Create a "Web Service" on Render.
2. Link your GitHub repository.
3. Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
4. Start Command: `gunicorn backend.wsgi:application`
5. Run migrations: `python manage.py migrate` (via Render Shell or Release Command).

---

## 2. Frontend (Vercel)

### Environment Variables
Set the following on Vercel:
- `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api`

### Deployment Steps
1. Import your repository into Vercel.
2. Vercel will automatically detect Next.js.
3. Deploy.

---

## 3. Post-Deployment Verification
1. Register a student account and verify the onboarding redirect.
2. Register a recruiter account and verify job posting.
3. Ensure no 401 errors occur when refreshing the dashboard.
