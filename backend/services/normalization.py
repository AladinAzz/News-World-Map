import json
import os
from backend.config import Config

class NormalizationService:
    def __init__(self):
        # Load wilayas and countries data
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        
        with open(os.path.join(data_dir, "wilayas.json"), "r", encoding="utf-8") as f:
            self.wilayas_coords = json.load(f)
            
        with open(os.path.join(data_dir, "countries.json"), "r", encoding="utf-8") as f:
            self.countries_coords = json.load(f)
            
    def normalize(self, event):
        location = event.get("location")
        scope = event.get("scope")
        
        if scope == "local" and location in self.wilayas_coords:
            event["coordinates"] = self.wilayas_coords[location]
        elif scope == "international" and location in self.countries_coords:
            event["coordinates"] = self.countries_coords[location]
        elif scope == "national" or location == "Global Event":
            event["coordinates"] = Config.MEDITERRANEAN
        else:
            # Fallback to Mediterranean if something went wrong but passed validation
            event["coordinates"] = Config.MEDITERRANEAN
            
        return event
