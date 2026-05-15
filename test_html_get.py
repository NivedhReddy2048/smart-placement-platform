import urllib.request
import urllib.parse
import json

def test_html_get():
    url = "http://127.0.0.1:8001/api/auth/login/"
    req = urllib.request.Request(url, headers={'Accept': 'text/html'})
    
    print(f"Testing HTML GET at {url}...")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.getcode()}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(e.read().decode('utf-8')[:500])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_html_get()
