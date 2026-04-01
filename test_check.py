import urllib.request
import urllib.error

url = 'http://127.0.0.1:8000/api/bookings/waitlist/check?bus_id=1&date=2026-04-01'
req = urllib.request.Request(url, headers={'Authorization': 'Bearer 123'})

try:
    print(urllib.request.urlopen(req).read().decode())
except urllib.error.HTTPError as e:
    print(e.code, e.reason)
except Exception as e:
    print(e)
