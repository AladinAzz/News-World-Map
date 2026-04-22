import feedparser
import re
from backend.config import Config

class RSSService:
    @staticmethod
    def fetch_news():
        items = []
        seen_titles = set()
        
        for url in Config.RSS_FEEDS:
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries:
                    if len(items) >= Config.MAX_EVENTS:
                        break
                        
                    title = entry.get('title', '')
                    # Simple deduplication by title (case-insensitive and stripped)
                    normalized_title = title.lower().strip()
                    if not normalized_title or normalized_title in seen_titles:
                        continue
                        
                    seen_titles.add(normalized_title)
                    
                    items.append({
                        "title": title,
                        "summary": entry.get('summary', entry.get('description', '')),
                        "url": entry.get('link', ''),
                        "published": entry.get('published', entry.get('updated', ''))
                    })
                
                if len(items) >= Config.MAX_EVENTS:
                    break
            except Exception as e:
                print(f"Error fetching RSS from {url}: {e}")
                continue
                
        return items
