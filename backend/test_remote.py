import urllib.request
import json

url = "https://nova-backend-2sc2.onrender.com/api/auth/register"
data = json.dumps({
    "name": "Check",
    "email": "deploycheck@example.com",
    "username": "deploycheck",
    "password": "pwd",
    "gender": "Male"
}).encode("utf-8")

req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as response:
        print("STATUS:", response.status)
        print("BODY:", response.read().decode())
except urllib.error.HTTPError as e:
    print("STATUS:", e.code)
    print("BODY:", e.read().decode())
except Exception as e:
    print("ERROR:", e)
