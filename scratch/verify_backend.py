import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from backend.services.gemini_service import GeminiService
from backend.services.validation import ValidationService

def verify_gemini_feature():
    load_dotenv()
    print("--- AlgeriaPulse Backend Verification ---")
    
    # 1. Check API Key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: GOOGLE_API_KEY not found in .env")
        return
    print(f"API Key found: {api_key[:10]}...")

    # 2. Test Sample Extraction
    service = GeminiService()
    sample_news = [
        {
            "title": "Inauguration d'un nouveau complexe industriel à Oran",
            "summary": "Le ministre de l'Industrie a inauguré aujourd'hui un important complexe pétrochimique à Oran pour booster l'exportation.",
            "url": "http://example.com/news1"
        }
    ]
    
    print("\nSending sample news to Gemini...")
    try:
        raw_events = service.process_news_batch(sample_news)
        print("Gemini Raw Output:")
        print(json.dumps(raw_events, indent=2, ensure_ascii=False))
        
        # 3. Test Validation
        print("\nValidating extracted events...")
        valid_events = []
        for event in raw_events:
            validated = ValidationService.validate(event)
            if validated:
                valid_events.append(validated)
                print(f"✅ Validated: {validated['location']} ({validated['scope']})")
            else:
                print(f"❌ Validation failed for: {event.get('location')}")
                
        if not valid_events:
            print("\nWARNING: No valid events produced. This might be due to quota limits or model hallucinations.")
        else:
            print(f"\nSUCCESS: Successfully processed {len(valid_events)} event(s).")
            
    except Exception as e:
        print(f"\nERROR during extraction: {str(e)}")

if __name__ == "__main__":
    verify_gemini_feature()
