from flask import Flask, jsonify
from flask_cors import CORS
from backend.services.rss_service import RSSService
from backend.services.gemini_service import GeminiService
from backend.services.validation import ValidationService
from backend.services.normalization import NormalizationService
from backend.services.aggregation import AggregationService
from backend.cache.cache import Cache
import traceback
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

cache = Cache()
gemini_service = GeminiService()
normalization_service = NormalizationService()

def get_events_logic():
    try:
        # 1. RSS Ingestion
        raw_news = RSSService.fetch_news()
        logger.info(f"Fetched {len(raw_news)} items from RSS")
        
        # 2. Gemini Extraction
        processed_events = gemini_service.process_news_batch(raw_news)
        logger.info(f"Gemini processed {len(processed_events)} items")
        
        # 3. Validation & Normalization
        valid_events = []
        for i, event in enumerate(processed_events):
            if i < len(raw_news):
                event['title'] = raw_news[i]['title']
                event['url'] = raw_news[i]['url']
                
            validated = ValidationService.validate(event)
            if validated:
                normalized = normalization_service.normalize(validated)
                valid_events.append(normalized)
            else:
                logger.warning(f"Validation failed for location: {event.get('location')}")
                
        logger.info(f"Total valid events: {len(valid_events)}")
                
        # 4. Aggregation
        aggregated_data = AggregationService.aggregate(valid_events)
        return aggregated_data
    except Exception as e:
        logger.error(f"Logic Error: {e}")
        return []

@app.route('/api/events', methods=['GET'])
def get_events():
    cached_data = cache.get()
    if cached_data:
        return jsonify(cached_data)
        
    aggregated_data = get_events_logic()
    
    # 5. Cache update
    if aggregated_data:
        cache.set(aggregated_data)
        return jsonify(aggregated_data)
    
    # Fallback to old cache
    if cache._data:
        return jsonify(cache._data)
    return jsonify([]), 500

if __name__ == '__main__':
    app.run(debug=False, port=5000)
