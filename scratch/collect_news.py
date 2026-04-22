import sys
import os
import logging

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app import get_events_logic

# Setup logging to see progress
logging.basicConfig(level=logging.INFO)

if __name__ == "__main__":
    print("Starting deep news collection...")
    # This will fetch from all feeds, process new ones with Gemini, and save to history.json
    results = get_events_logic()
    print(f"Collection complete. Found {len(results)} locations with events.")
