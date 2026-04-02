from sqlalchemy import inspect
from database import engine

inspector = inspect(engine)
columns = inspector.get_columns('users')
print("Users columns:")
for c in columns:
    print(f"- {c['name']} ({c['type']})")
