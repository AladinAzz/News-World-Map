# Project Report: AlgeriaPulse 2.0

## 1. Introduction
AlgeriaPulse 2.0 is an interactive geospatial visualization system designed to transform unstructured Algerian news into a high-fidelity 3D interactive experience. The project aims to provide a centralized platform for tracking regional and global events affecting Algeria, using Large Language Models (LLMs) for data extraction and D3.js for visualization.

## 2. Methods

### 2.1 Backend Architecture
The backend is built with Flask and follows a modular service-oriented architecture:
- **RSS Ingestion**: Google News RSS is used as the primary data source.
- **Data Extraction**: Gemini 1.5 Flash structures news items into JSON with location and scope.
- **Validation Layer**: An authoritative layer ensures locations correspond to known Algerian wilayas or world countries.
- **Normalization**: Mapping of locations to [longitude, latitude] coordinates.
- **Aggregation**: Grouping events by location to show intensity.
- **Caching**: 20-minute in-memory cache to ensure performance and reduce API costs.

### 2.2 Frontend Visualization
The frontend uses vanilla JavaScript and D3.js:
- **Globe Rendering**: Orthographic projection rendered on an HTML5 Canvas for 60 FPS performance.
- **Inertia Physics**: Smooth rotation and drag interactions with momentum.
- **Multi-level Interaction**: Support for global view (world/national) and detailed wilaya views.
- **State Management**: A reactive state object orchestrates data flow between the API and the renderer.

## 3. Results
- **Performance**: The system successfully handles 20 concurrent events while maintaining smooth interactions.
- **Accuracy**: The validation layer effectively filters LLM "hallucinations" regarding geographic locations.
- **UX**: The 3D globe provides an intuitive way to browse news by proximity and regional relevance.

## 4. Discussion

### 4.1 Limitations
- **LLM Reliability**: While Gemini is powerful, it may occasionally misinterpret the "scope" of an event (e.g., mistaking a national speech for a local event in Algiers).
- **Data Sparsity**: RSS feeds may not always provide specific city-level details, leading to many events being aggregated at the wilaya level.

### 4.2 Future Work
- Integration of more diverse news sources beyond Google News.
- Temporal analysis to show news trends over time.
- Real-time websocket updates for breaking news.
