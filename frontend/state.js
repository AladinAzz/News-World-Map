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
    timelineValue: 100 // Percentage
};

export const mutations = {
    setEvents(events) {
        state.events = events;
    },
    setAllEvents(events) {
        state.allEvents = events;
    },
    setTimelineValue(val) {
        state.timelineValue = val;
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
