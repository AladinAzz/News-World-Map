from flask import Flask, jsonify
from flask_cors import CORS
from backend.services.rss_service import RSSService
from backend.services.gemini_service import GeminiService
from backend.services.validation import ValidationService
from backend.services.normalization import NormalizationService
from backend.services.aggregation import AggregationService
from backend.services.history_service import HistoryService
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
history_service = HistoryService()

def get_events_logic():
    try:
        # 1. RSS Ingestion
        raw_news_all = RSSService.fetch_news()
        logger.info(f"Fetched {len(raw_news_all)} items from RSS")
        
        # 2. Filter out already processed news
        raw_news_new = history_service.filter_out_existing(raw_news_all)
        logger.info(f"{len(raw_news_new)} items are new and need processing")
        
        # 3. Gemini Extraction (only for new news)
        new_processed_events = []
        if raw_news_new:
            new_processed_events = gemini_service.process_news_batch(raw_news_new)
            logger.info(f"Gemini processed {len(new_processed_events)} new items")
        
        # 4. Validation & Normalization for new news
        valid_new_events = []
        for i, event in enumerate(new_processed_events):
            if i < len(raw_news_new):
                event['title'] = raw_news_new[i]['title']
                event['url'] = raw_news_new[i]['url']
                event['published'] = raw_news_new[i]['published']
                
            validated = ValidationService.validate(event)
            if validated:
                normalized = normalization_service.normalize(validated)
                valid_new_events.append(normalized)
        
        # 5. Save new events to history
        if valid_new_events:
            history_service.save_to_history(valid_new_events)
            
        # 6. Combine all history for aggregation
        all_events = history_service.get_all_history()
        logger.info(f"Total events in history: {len(all_events)}")
                
        # 7. Aggregation
        aggregated_data = AggregationService.aggregate(all_events)
        return aggregated_data
    except Exception as e:
        logger.error(f"Logic Error: {e}")
        return []

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        all_events = history_service.get_all_history()
        aggregated_data = AggregationService.aggregate(all_events)
        return jsonify(aggregated_data)
    except Exception as e:
        logger.error(f"History Error: {e}")
        return jsonify([]), 500

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
