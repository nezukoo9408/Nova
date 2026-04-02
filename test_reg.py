import urllib.request
import urllib.error
import json

url = "http://127.0.0.1:8000/api/auth/register"
data = json.dumps({
    "name": "Test User Debug",
    "email": "debugtest9999@test.com",
    "username": "debugtest9999",
    "password": "testpass123",
    "gender": "Male"
}).encode()

req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req)
    print("SUCCESS:", resp.read().decode())
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP {e.code} {e.reason}:")
    print(body)
except Exception as e:
    print("Exception:", e)
