import requests
import random
import string

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

base_url = "http://127.0.0.1:8000/api"

# 1. Register
username = f"user_{random_string()}"
email = f"{username}@test.com"
password = "testpassword123"

print(f"Registering {username}...")
res = requests.post(f"{base_url}/auth/register", json={
    "name": "Test User",
    "email": email,
    "username": username,
    "password": password,
    "gender": "Male"
})

print("Register Status:", res.status_code)
print("Register Body:", res.text)

if res.status_code == 200:
    # 2. Login
    print(f"Logging in {username}...")
    login_res = requests.post(f"{base_url}/auth/login", json={
        "username": username,
        "password": password
    })
    print("Login Status:", login_res.status_code)
    print("Login Body:", login_res.text)
