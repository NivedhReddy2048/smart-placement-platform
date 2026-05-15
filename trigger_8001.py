import urllib.request
import urllib.parse
import json

def trigger_error():
    url = "http://127.0.0.1:8001/api/auth/login/"
    data = json.dumps({
        "username": "admin",
        "password": "admin123"
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    print(f"Triggering at {url}...")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.getcode()}")
            print(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_error()
