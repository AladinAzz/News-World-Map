class AggregationService:
    @staticmethod
    def aggregate(events):
        aggregated = {}
        
        for event in events:
            location = event["location"]
            if location not in aggregated:
                aggregated[location] = {
                    "location": location,
                    "coordinates": event["coordinates"],
                    "intensity": 0,
                    "type": event["scope"],
                    "events": []
                }
            
            aggregated[location]["intensity"] += 1
            aggregated[location]["events"].append({
                "title": event["title"],
                "summary": event["summary"],
                "url": event["url"],
                "coordinates": event["coordinates"]
            })
            
        return list(aggregated.values())
