import httpx
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    try:
        # Test 1: /test/ endpoint
        res = httpx.get(f"{BASE_URL}/test/")
        print(f"GET /test/ -> {res.status_code} {res.text}")

        # Test 2: Register Student
        student_data = {
            "username": "student_test1",
            "email": "student1@example.com",
            "password": "Password123!",
            "role": "STUDENT"
        }
        res = httpx.post(f"{BASE_URL}/api/auth/register/", json=student_data)
        print(f"POST /api/auth/register/ (Student) -> {res.status_code} {res.text}")

        # Test 3: Register Recruiter
        recruiter_data = {
            "username": "recruiter_test1",
            "email": "recruiter1@example.com",
            "password": "Password123!",
            "role": "RECRUITER",
            "company_name": "Tech Corp"
        }
        res = httpx.post(f"{BASE_URL}/api/auth/register/", json=recruiter_data)
        print(f"POST /api/auth/register/ (Recruiter) -> {res.status_code} {res.text}")

        # Test 4: Login
        login_data = {
            "username": "student_test1",
            "password": "Password123!"
        }
        res = httpx.post(f"{BASE_URL}/api/auth/login/", json=login_data)
        print(f"POST /api/auth/login/ -> {res.status_code} {res.text}")

        # Test 5: Admin page
        res = httpx.get(f"{BASE_URL}/admin/")
        print(f"GET /admin/ -> {res.status_code} length={len(res.text)}")

    except Exception as e:
        print(f"Error connecting to server: {e}")

if __name__ == "__main__":
    run_tests()
