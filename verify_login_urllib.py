import urllib.request
import urllib.parse
import json

def test_login():
    url = "http://localhost:8000/api/auth/login/"
    data = json.dumps({
        "username": "admin",
        "password": "admin123"
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    print(f"Testing login at {url}...")
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Status Code: {status}")
            
            if status == 200:
                data = json.loads(body)
                print("Login Successful!")
                print(f"Username: {data.get('username')}")
                print(f"Role: {data.get('role')}")
                print(f"Access Token exists: {bool(data.get('access'))}")
                
                required = ['access', 'refresh', 'username', 'email', 'role']
                missing = [field for field in required if field not in data]
                if not missing:
                    print("✅ All required fields present.")
                else:
                    print(f"❌ Missing fields: {missing}")
            else:
                print(f"Login Failed! Status: {status}")
                
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(f"Response: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_login()
