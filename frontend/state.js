export const state = {
    mode: "global", // "global" or "wilaya"
    selectedLocation: null,
    events: [],
    geoData: {
        world: null,
        algeria: null
    },
    rotation: [-15, -35],
    scale: 300,
    isDragging: false,
    velocity: [0, 0],
    isPaused: false,
    rotationSpeed: 0
};

export const mutations = {
    setEvents(events) {
        state.events = events;
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
