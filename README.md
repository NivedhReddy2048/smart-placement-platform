# 🚀 Smart Placement Platform

A production-grade, AI-powered recruitment ecosystem designed to bridge the gap between students and recruiters with high-precision matching and actionable career intelligence.

## ✨ Core Value Proposition
- **For Students**: Real-time "Shortlisting Probability" based on resume analysis and skill gaps.
- **For Recruiters**: Automated candidate ranking and pipeline management with "Match Score" intelligence.
- **For Everyone**: A seamless, synchronized workflow from job posting to hiring.

## 🛠 Tech Stack

### Backend (Python/Django)
- **Django REST Framework**: High-performance API architecture.
- **JWT Authentication**: Secure, stateless session management.
- **PostgreSQL**: Robust relational data persistence.
- **NLP Matching Engine**: Heuristic-based skill extraction and job-role alignment.

### Frontend (TypeScript/Next.js)
- **Next.js 14 (App Router)**: Optimized React framework for scale.
- **Lucide React**: Premium iconography system.
- **Tailwind CSS**: Custom "Dark Premium" design system with glassmorphism effects.
- **Axios**: Centralized API service with interceptors for token management.

## 🏗 Architecture
The platform follows a decoupled micro-service-ready architecture:
1. **Auth Service**: Manages RBAC (Student/Recruiter/Admin).
2. **Matching Engine**: Calculates real-time scores by comparing student nodes against job role requirements.
3. **Analytics Pipeline**: Aggregates recruiter metrics and student career progress.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (Local or Render)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📸 Workflows
- **Onboarding**: Students complete a high-fidelity profile to unlock AI matching.
- **Recruitment**: Recruiters post jobs, track applicants, and update hiring statuses in real-time.
- **Intelligence**: Integrated "What-If Simulator" helps students identify the highest-impact skills to learn.

## 📜 License
MIT
