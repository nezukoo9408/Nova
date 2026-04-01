import urllib.request
import json
try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/bookings/waitlist/check?bus_id=1&date=2026-04-01")
    resp = urllib.request.urlopen(req)
    print("SUCCESS:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.read().decode())
except Exception as e:
    print("Exception:", e)
