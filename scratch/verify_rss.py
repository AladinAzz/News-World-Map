import logging
from backend.services.rss_service import RSSService

def verify_rss_parser():
    print("--- AlgeriaPulse RSS Parser Verification ---")
    
    # Fetch news
    print("\nFetching news items from RSS...")
    try:
        items = RSSService.fetch_news()
        print(f"Total items found: {len(items)}")
        
        if items:
            print("\nSample Ingested Item:")
            sample = items[0]
            print(f"Title: {sample.get('title')}")
            print(f"Summary: {sample.get('summary')[:150]}...")
            print(f"URL: {sample.get('url')}")
            
            # Verify fields
            required_fields = ['title', 'summary', 'url']
            missing = [f for f in required_fields if not sample.get(f)]
            
            if not missing:
                print("\n✅ SUCCESS: RSS Parser correctly extracted all required fields.")
            else:
                print(f"\n❌ ERROR: Missing fields: {missing}")
        else:
            print("\n❌ ERROR: No news items found. Please check your internet connection or RSS feed URLs.")
            
    except Exception as e:
        print(f"\n❌ ERROR during RSS fetch: {str(e)}")

if __name__ == "__main__":
    verify_rss_parser()
