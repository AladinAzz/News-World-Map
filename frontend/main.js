import { state, mutations } from './state.js';
import { fetchGeoData } from './utils/geo.js';
import { GlobeRenderer } from './rendering/globe.js';

async function init() {
    window.state = state; // For debugging
    const canvas = document.getElementById('globe');
    const tooltip = document.getElementById('tooltip');
    const statusText = document.getElementById('status-text');
    const eventCount = document.getElementById('event-count');
    const resetBtn = document.getElementById('reset-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const speedSlider = document.getElementById('speed-slider');
    const eventPanel = document.getElementById('event-list-panel');
    const closePanelBtn = document.getElementById('close-panel');
    const eventItems = document.getElementById('event-items');
    const selectedLocationLabel = document.getElementById('selected-location');

    const renderer = new GlobeRenderer(canvas, tooltip);

    // Load Geo Data
    try {
        const geo = await fetchGeoData();
        mutations.setGeoData('world', geo.world);
        mutations.setGeoData('algeria', geo.algeria);
    } catch (e) {
        console.error("Failed to load geo data", e);
        statusText.innerText = "Error loading maps.";
    }

    // Fetch Events
    async function fetchEvents() {
        try {
            statusText.innerText = "Fetching latest news...";
            const response = await fetch('http://localhost:5000/api/events');
            const data = await response.json();
            mutations.setEvents(data);
            eventCount.innerText = data.length;
            statusText.innerText = "Updated just now";
        } catch (e) {
            console.error("Failed to fetch events", e);
            statusText.innerText = "Server offline. Showing local data.";
        }
    }

    await fetchEvents();

    // Controls
    playPauseBtn.addEventListener('click', () => {
        state.isPaused = !state.isPaused;
        playPauseBtn.innerText = state.isPaused ? 'Play' : 'Pause';
    });

    speedSlider.addEventListener('input', (e) => {
        state.rotationSpeed = parseInt(e.target.value);
    });

    resetBtn.addEventListener('click', () => {
        state.isPaused = true;
        playPauseBtn.innerText = 'Play';
        d3.transition().duration(750).tween("reset", () => {
            const r = d3.interpolate(renderer.projection.rotate(), [0, -30]);
            const s = d3.interpolate(renderer.projection.scale(), 300);
            return (t) => {
                renderer.projection.rotate(r(t));
                renderer.projection.scale(s(t));
                state.rotation = renderer.projection.rotate();
                state.scale = renderer.projection.scale();
            };
        });
    });

    // Interactions
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width) / window.devicePixelRatio;
        const y = (e.clientY - rect.top) * (canvas.height / rect.height) / window.devicePixelRatio;
        
        const pos = renderer.projection.invert([x, y]);
        if (!pos) return;

        const found = state.events.find(event => {
            const d = d3.geoDistance(pos, event.coordinates);
            return d < 0.05;
        });

        if (found) {
            tooltip.classList.remove('hidden');
            tooltip.style.left = `${e.clientX + 10}px`;
            tooltip.style.top = `${e.clientY + 10}px`;
            tooltip.innerHTML = `<strong>${found.location}</strong><br>${found.events[0].summary}`;
            canvas.style.cursor = 'pointer';
        } else {
            tooltip.classList.add('hidden');
            canvas.style.cursor = 'grab';
        }
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width) / window.devicePixelRatio;
        const y = (e.clientY - rect.top) * (canvas.height / rect.height) / window.devicePixelRatio;
        
        const pos = renderer.projection.invert([x, y]);
        if (!pos) return;

        const found = state.events.find(event => {
            const d = d3.geoDistance(pos, event.coordinates);
            return d < 0.05;
        });

        if (found) {
            state.isPaused = true;
            playPauseBtn.innerText = 'Play';
            mutations.setSelectedLocation(found.location);
            showPanel(found);
            
            // Zoom to location
            d3.transition().duration(750).tween("rotate", () => {
                const r = d3.interpolate(renderer.projection.rotate(), [-found.coordinates[0], -found.coordinates[1]]);
                return (t) => {
                    renderer.projection.rotate(r(t));
                    state.rotation = renderer.projection.rotate();
                };
            });
        }
    });

    function showPanel(locationData) {
        selectedLocationLabel.innerText = locationData.location;
        eventItems.innerHTML = locationData.events.map(event => `
            <div class="event-card">
                <h3>${event.title}</h3>
                <p>${event.summary}</p>
                <a href="${event.url}" target="_blank">Read Full Article →</a>
            </div>
        `).join('');
        eventPanel.classList.remove('hidden');
    }

    closePanelBtn.addEventListener('click', () => {
        eventPanel.classList.add('hidden');
        mutations.setSelectedLocation(null);
    });
}

init();
