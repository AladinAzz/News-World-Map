export const state = {
    mode: "global", // "global" or "wilaya"
    selectedLocation: null,
    events: [], // Filtered events shown on globe
    allEvents: [], // Full history from server
    geoData: {
        world: null,
        algeria: null
    },
    rotation: [-15, -35],
    scale: 300,
    isDragging: false,
    velocity: [0, 0],
    isPaused: false,
    rotationSpeed: 0,
    timelineStart: 0,
    timelineEnd: 100,
    language: 'en' // 'en' or 'ar'
};

export const mutations = {
    setEvents(events) {
        state.events = events;
    },
    setAllEvents(events) {
        state.allEvents = events;
    },
    setTimelineRange(start, end) {
        state.timelineStart = start;
        state.timelineEnd = end;
    },
    setLanguage(lang) {
        state.language = lang;
    },
    setGeoData(type, data) {
        state.geoData[type] = data;
    },
    setSelectedLocation(location) {
        state.selectedLocation = location;
        state.mode = location ? "wilaya" : "global";
    },
    updateRotation(r) {
        state.rotation = r;
    }
};
