import json
import os
import logging

logger = logging.getLogger(__name__)

class HistoryService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        self.history_file = os.path.join(self.data_dir, "history.json")
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        if not os.path.exists(self.history_file):
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump([], f)

    def get_all_history(self):
        try:
            with open(self.history_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading history: {e}")
            return []

    def save_to_history(self, new_events):
        if not new_events:
            return
            
        history = self.get_all_history()
        existing_urls = {event.get("url") for event in history}
        
        added_count = 0
        for event in new_events:
            if event.get("url") not in existing_urls:
                history.append(event)
                added_count += 1
                
        if added_count > 0:
            try:
                with open(self.history_file, "w", encoding="utf-8") as f:
                    json.dump(history, f, ensure_ascii=False, indent=2)
                logger.info(f"Saved {added_count} new events to history.")
            except Exception as e:
                logger.error(f"Error saving history: {e}")

    def filter_out_existing(self, raw_items):
        history = self.get_all_history()
        existing_urls = {event.get("url") for event in history}
        return [item for item in raw_items if item.get("url") not in existing_urls]
