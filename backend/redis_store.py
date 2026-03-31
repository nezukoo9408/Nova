import redis
from datetime import datetime, timedelta

class DummyRedis:
    def __init__(self):
        self.store = {}
    def get(self, key):
        data = self.store.get(key)
        if data and data['exp'] > datetime.now():
            return data['val']
        return None
    def setex(self, key, time, value):
        self.store[key] = {'val': value, 'exp': datetime.now() + timedelta(seconds=time)}
    def delete(self, key):
        if key in self.store:
            del self.store[key]
    def keys(self, pattern):
        prefix = pattern.replace('*', '')
        return [k for k, v in self.store.items() if k.startswith(prefix) and v['exp'] > datetime.now()]

try:
    client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    client.ping()
except Exception:
    client = DummyRedis()
