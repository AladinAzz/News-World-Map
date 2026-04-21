import time
from backend.config import Config

class Cache:
    def __init__(self):
        self._data = None
        self._expiry = 0
        
    def get(self):
        if self._data and time.time() < self._expiry:
            return self._data
        return None
        
    def set(self, data):
        self._data = data
        self._expiry = time.time() + Config.CACHE_TTL
        
    def is_valid(self):
        return self._data is not None and time.time() < self._expiry
