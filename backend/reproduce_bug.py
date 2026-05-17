import requests

url = "http://localhost:8000/api/auth/register/"
payload = {
    "username": "recruiter_test_v3",
    "email": "test@v3.com",
    "password": "Password123!",
    "role": "RECRUITER",
    "company_name": "Test Company"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
