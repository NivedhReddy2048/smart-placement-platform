# 🚀 Smart Placement Platform

An AI-powered full-stack placement preparation and career guidance platform built for students, recruiters, and mentors. The platform combines modern web technologies, machine learning, resume intelligence, analytics, and real-time features into one scalable ecosystem.

## 🌐 Live Demo
### 🔗 Frontend

https://smart-placement-platform-im9a.vercel.app/login

### 🔗 Backend Admin Panel

https://smart-placement-platform.onrender.com/admin/login/?next=/admin/

## ✨ Features
### 👨‍🎓 Student Features
### 🔐 JWT Authentication System
### 📄 AI Resume Analysis
### 🎯 Job Match Recommendation
### 📊 Placement Analytics Dashboard
### 🧠 Skill Tracking System
### 💼 Job Application Portal
### 🤖 Mock Interview Preparation
### 🔔 Real-Time Notifications
### 💬 Messaging System
### 🌍 Community Discussion Platform
### 🧑‍🏫 Mentor Support
### 📈 Personalized Career Recommendations
### 🏢 Recruiter Features
### 📝 Recruiter Registration & Login
### 📢 Job Posting Management
### 🎯 Candidate Filtering
### 📊 Hiring Analytics
### 📄 Resume Screening
### 💬 Recruiter-Student Messaging
### 🧑‍💼 Admin Features
### ⚙️ Django Jazzmin Admin Panel
### 👥 User Management
### 📊 Platform Monitoring
### 🛡️ Authentication & Permission Control
### 📂 Database Administration
### 🔍 API Monitoring
### 🧠 AI-Powered Functionalities
### 📄 Resume Analyzer

## 🪼 The platform uses AI-powered resume analysis to:

### Extract resume insights
### Identify skills
### Evaluate candidate profiles
### Match resumes with job descriptions
## 🎯 Job Match Analyzer

## Analyzes:

### Resume skills
### Experience
### Keywords
### Job requirements

### Then generates intelligent job matching recommendations.

## 🏗️ Tech Stack
## 🎨 Frontend
### ⚛️ Next.js 15
### ⚛️ React
### 🔷 TypeScript
### 🎨 Tailwind CSS
### 📡 Axios
### 🔐 JWT Authentication
## 🖥️ Backend
### 🐍 Django
### 🚀 Django REST Framework
### 🔑 Simple JWT
### 🎷 Jazzmin Admin UI
### 🌐 CORS Headers
### 🗃️ SQLite / PostgreSQL Ready
### 🔥 Gunicorn
### 📦 WhiteNoise
### ☁️ Deployment

## Frontend
## ▲ Vercel

## Backend
## 🚀 Render

## 📂 Project Structure
## smart-placement-platform/
```bash
│
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── analyzer/
│   │   ├── analytics/
│   │   ├── community/
│   │   ├── core/
│   │   ├── jobs/
│   │   ├── mentor/
│   │   ├── messaging/
│   │   ├── mock_interview/
│   │   ├── notifications/
│   │   ├── recommendations/
│   │   └── skills/
│   │
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── context/
│   └── utils/
│
└── README.md
```
## 🔐 Authentication System

## The platform uses:

### JWT Access Tokens
### JWT Refresh Tokens
### Protected API Routes
### Role-Based Authentication

## 📡 API Features

### RESTful APIs
### Secure Authentication
### Resume APIs
### Analytics APIs
### Recommendation APIs
### Messaging APIs
### Mock Interview APIs

## 🧪 Local Setup
## 1️⃣ Clone Repository
### git clone https://github.com/NivedhReddy2048/smart-placement-platform
### cd smart-placement-platform

## 2️⃣ Backend Setup
### cd backend

### python -m venv venv

## Windows
### venv\Scripts\activate

### pip install -r requirements.txt

### python manage.py migrate

### python manage.py runserver

## Backend runs on:

### http://127.0.0.1:8000/

## 3️⃣ Frontend Setup
### cd frontend

### npm install

### npm run dev

## Frontend runs on:

### http://localhost:3000/

## ⚙️ Environment Variables
### Backend .env
### SECRET_KEY=your_secret_key

### DEBUG=True

### ALLOWED_HOSTS=localhost,127.0.0.1

### CORS_ALLOWED_ORIGINS=http://localhost:3000

## 🚀 Deployment Commands (Render)
### Build Command
### pip install -r requirements.txt && python manage.py collectstatic --noinput
### Start Command
### python manage.py migrate && python create_superuser.py && gunicorn config.wsgi:application

## 📊 Major Modules
### Module	Description
### Accounts	Authentication & User Management
### Analyzer	AI Resume & Job Matching
### Jobs	Job Portal
### Analytics	Dashboard & Insights
### Community	Student Community
### Messaging	Chat & Communication
### Mentor	Mentor Guidance
### Mock Interview	Interview Preparation
### Notifications	Real-Time Alerts
### Recommendations	Career Recommendations
### Skills	Skill Tracking

## 🔥 Highlights
### ✅ Full Stack AI Project
### ✅ Production Ready Architecture
### ✅ REST API Based
### ✅ JWT Authentication
### ✅ Modern UI/UX
### ✅ AI Resume Intelligence
### ✅ Placement Preparation Ecosystem
### ✅ Scalable Backend Design
### ✅ Recruiter + Student Workflow
### ✅ Admin Management System

## 📸 Screenshots


## 🎨 Modern Authentication UI
### 📊 Analytics Dashboard
### 📄 Resume Analyzer
### 🧠 AI Job Match System
### ⚙️ Django Admin Panel

##👨‍💻 Developed By
##🚀 Nivedh Reddy

## Passionate Full Stack & AI Developer focused on:

### AI Applications
### Machine Learning
### Full Stack Development
### Placement & Career Technology
### Scalable Web Systems

## ⭐ Future Enhancements
### 🤖 Advanced AI Interview Bot
### 📹 Video Interview System
### 📱 Mobile App
### ☁️ PostgreSQL Migration
### 🔔 Real-Time Chat using WebSockets
### 🧠 LLM-Based Career Guidance
### 📈 AI Skill Gap Prediction
### 🌍 Multi-Language Support

## 📜 License

### This project is developed for educational, research, and portfolio purposes.

## 💡 Support

## If you like this project:

### ⭐ Star the repository
## 🍴 Fork the project
## 🛠️ Contribute improvements
## 🚀 Share with others
