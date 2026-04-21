import json
import os
from backend.config import Config

class ValidationService:
    _countries = None

    @classmethod
    def _load_countries(cls):
        if cls._countries is None:
            data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
            with open(os.path.join(data_dir, "countries.json"), "r", encoding="utf-8") as f:
                cls._countries = json.load(f)
        return cls._countries

    @staticmethod
    def validate(event):
        location = event.get("location")
        if not location:
            return None
            
        # Check against Wilayas
        if location in Config.WILAYAS:
            return event
            
        # Check against Countries
        countries = ValidationService._load_countries()
        if location in countries:
            event["scope"] = "international" # Ensure scope is international if in countries
            return event
            
        # Check against "Global Event"
        if location == "Global Event":
            return event
            
        # Simple fallback check
        if event.get("scope") == "national":
            event["location"] = "Alger" # Fallback for national
            return event
            
        return None # Discard if totally unknown
