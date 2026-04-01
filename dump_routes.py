import sys
sys.path.append('backend')
from backend.main import app
for route in app.routes:
    print(getattr(route, 'methods', None), getattr(route, 'path', route.name))
