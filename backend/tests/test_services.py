import pytest
from backend.services.rss_service import RSSService
from backend.services.validation import ValidationService
from backend.config import Config

def test_rss_deduplication(mocker):
    # Mock feedparser.parse
    mock_feed = mocker.Mock()
    class Entry:
        def __init__(self, title, link, summary):
            self.title = title
            self.link = link
            self.summary = summary
        def __contains__(self, key):
            return hasattr(self, key)

    mock_feed.entries = [
        Entry("News A", "url1", "summary1"),
        Entry("News A", "url2", "summary2"),
        Entry("News B", "url3", "summary3"),
    ]
    mocker.patch('feedparser.parse', return_value=mock_feed)
    
    news = RSSService.fetch_news()
    assert len(news) == 2
    assert news[0]['title'] == "News A"
    assert news[1]['title'] == "News B"

def test_validation_wilaya():
    event = {"location": "Alger", "scope": "local"}
    validated = ValidationService.validate(event)
    assert validated == event

def test_validation_invalid():
    event = {"location": "Mars", "scope": "local"}
    validated = ValidationService.validate(event)
    assert validated is None

def test_validation_fallback():
    event = {"location": "Unknown", "scope": "national"}
    validated = ValidationService.validate(event)
    assert validated["location"] == "Alger"
