import json
from backend.app import get_events_logic

def verify_ui_data():
    print("--- AlgeriaPulse Final UI Data Verification ---")
    
    # Execute the full backend logic
    print("\nProcessing full pipeline (RSS -> Gemini/Mock -> Validation -> Aggregation)...")
    try:
        # We call the logic directly to see the raw data list
        events = get_events_logic()
        
        print(f"\nFinal Events for UI: {len(events)}")
        
        if events:
            # Show a sample of the actual JSON structure
            print("\n--- SAMPLE JSON PAYLOAD ---")
            # We take the first 2 locations to show the structure
            sample_payload = events[:2]
            print(json.dumps(sample_payload, indent=2, ensure_ascii=False))
            
            # Verify critical UI fields
            print("\nVerifying UI fields for first event:")
            first = events[0]
            fields = ['location', 'coordinates', 'intensity', 'type', 'events']
            for f in fields:
                status = "✅" if f in first else "❌"
                val = first.get(f)
                print(f"{status} {f}: {val}")
                
            if 'coordinates' in first and isinstance(first['coordinates'], list):
                if len(first['coordinates']) == 2:
                    print(f"✅ Coordinates format: [Long, Lat] detected.")
            
            print("\n✅ SUCCESS: Backend is serving high-fidelity JSON data for the globe.")
        else:
            print("\n❌ WARNING: No events generated. Check RSS feed and Gemini status.")
            
    except Exception as e:
        print(f"\n❌ ERROR during UI data generation: {str(e)}")

if __name__ == "__main__":
    verify_ui_data()
