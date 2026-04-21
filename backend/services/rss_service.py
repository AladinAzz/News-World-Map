import feedparser
import re
from backend.config import Config

class RSSService:
    @staticmethod
    def fetch_news():
        feed = feedparser.parse(Config.RSS_URL)
        items = []
        seen_titles = set()
        
        for entry in feed.entries:
            if len(items) >= Config.MAX_EVENTS:
                break
                
            title = entry.title
            # Simple deduplication by title (case-insensitive and stripped)
            normalized_title = title.lower().strip()
            if normalized_title in seen_titles:
                continue
                
            seen_titles.add(normalized_title)
            
            items.append({
                "title": title,
                "summary": entry.summary if 'summary' in entry else "",
                "url": entry.link,
                "published": entry.published if 'published' in entry else ""
            })
            
        return items
