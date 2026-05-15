import requests
import json

def test_login():
    url = "http://localhost:8000/api/auth/login/"
    payload = {
        "username": "Pingili",
        "password": "pingili123"
    }
    
    print(f"Testing login at {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Login Successful!")
            print(f"Response Keys: {list(data.keys())}")
            print(f"Username: {data.get('username')}")
            print(f"Role: {data.get('role')}")
            print(f"Access Token starts with: {data.get('access')[:10]}...")
            
            # Check for required fields
            required = ['access', 'refresh', 'username', 'email', 'role']
            missing = [field for field in required if field not in data]
            if not missing:
                print("✅ All required fields present.")
            else:
                print(f"❌ Missing fields: {missing}")
        else:
            print("Login Failed!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_login()
