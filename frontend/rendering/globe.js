import { state } from '../state.js';

export class GlobeRenderer {
    constructor(canvas, tooltip) {
        this.canvas = canvas;
        this.tooltip = tooltip;
        this.context = canvas.getContext('2d');

        this.projection = d3.geoOrthographic()
            .scale(state.scale)
            .center([0, 0])
            .rotate(state.rotation);

        this.path = d3.geoPath().projection(this.projection);

        this.cache = {
            land: null,
            countries: null,
            algeria: null
        };

        this.width = 0;
        this.height = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.setupInteractions();
        this.startAnimation();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.context.scale(dpr, dpr);

        this.projection.translate([this.width / 2, this.height / 2]);

        const minDim = Math.min(this.width, this.height);
        state.scale = minDim * 0.45;
        this.projection.scale(state.scale);
    }

    setupInteractions() {
        const drag = d3.drag()
            .on('start', () => { state.isDragging = true; })
            .on('drag', (event) => {
                const r = this.projection.rotate();
                const k = 75 / this.projection.scale();
                this.projection.rotate([r[0] + event.dx * k, r[1] - event.dy * k]);
                state.rotation = this.projection.rotate();
            })
            .on('end', () => { state.isDragging = false; });

        d3.select(this.canvas).call(drag);

        d3.select(this.canvas).on('wheel', (event) => {
            event.preventDefault();
            const delta = -event.deltaY;
            state.scale = Math.max(100, Math.min(2000, state.scale + delta * 0.5));
            this.projection.scale(state.scale);
        });
    }

    startAnimation() {
        d3.timer(() => {
            if (!state.isPaused && !state.isDragging) {
                const r = this.projection.rotate();
                const speed = state.rotationSpeed / 1000;
                this.projection.rotate([r[0] + speed, r[1]]);
                state.rotation = this.projection.rotate();
            }
            this.render();
        });
    }

    prepareData() {
        if (state.geoData.world && !this.cache.land) {
            if (state.geoData.world.type === 'Topology') {
                this.cache.land = topojson.feature(state.geoData.world, state.geoData.world.objects.land);
                this.cache.countries = topojson.feature(state.geoData.world, state.geoData.world.objects.countries);
            } else {
                // Direct GeoJSON support
                this.cache.land = state.geoData.world;
                this.cache.countries = state.geoData.world;
            }
        }

        if (state.geoData.algeria && !this.cache.algeria) {
            if (state.geoData.algeria.type === 'Topology') {
                const key = Object.keys(state.geoData.algeria.objects)[0];
                this.cache.algeria = topojson.feature(state.geoData.algeria, state.geoData.algeria.objects[key]);
            } else {
                this.cache.algeria = state.geoData.algeria;
            }
        }
    }

    render() {
        this.prepareData();
        const { context, width, height, projection } = this;
        const path = this.path.context(context);

        context.clearRect(0, 0, width, height);

        // 1. Seas
        context.beginPath();
        path({ type: 'Sphere' });
        context.fillStyle = '#89C2D9';
        context.fill();

        // 2. Halo
        context.strokeStyle = '#89C2D9AA';
        context.lineWidth = 4;
        context.stroke();

        // 3. World Land
        if (this.cache.land) {
            context.beginPath();
            path(this.cache.land);
            context.fillStyle = '#1A2B3C';
            context.fill();
        }

        // 4. World Countries Borders
        if (this.cache.countries) {
            context.beginPath();
            path(this.cache.countries);
            context.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            context.lineWidth = 0.5;
            context.stroke();
        }

        // 5. Algeria Detailed Borders (Provinces)
        if (this.cache.algeria) {
            context.beginPath();
            path(this.cache.algeria);
            // Highlight color for Algeria
            context.fillStyle = 'rgba(0, 255, 136, 0.05)';
            context.fill();

            // Draw province borders
            context.strokeStyle = '#00FF88';
            context.lineWidth = 0.8;
            context.stroke();
        }

        this.renderEvents();
    }

    renderEvents() {
        const { context, projection } = this;
        const now = performance.now();

        state.events.forEach(event => {
            const coords = projection(event.coordinates);
            if (!coords) return;

            const gdistance = d3.geoDistance(event.coordinates, projection.invert([this.width / 2, this.height / 2]));
            if (gdistance > Math.PI / 2) return;

            const baseRadius = Math.sqrt(event.intensity) * 4 + 2;
            const color = event.type === 'international' ? '#FFD700' : '#00FF88';
            const colorRGB = event.type === 'international' ? '255, 215, 0' : '0, 255, 136';

            // 1. Core Dot (Solid)
            context.beginPath();
            context.arc(coords[0], coords[1], baseRadius, 0, 2 * Math.PI);
            context.fillStyle = color;
            context.shadowBlur = 15;
            context.shadowColor = color;
            context.fill();

            // Reset shadow for rings
            context.shadowBlur = 0;

            // 2. Pulsing Rings
            const pulseDuration = 2000; // 2 seconds
            const pulseCount = 2;

            for (let i = 0; i < pulseCount; i++) {
                // Calculate phase (0 to 1) for each ring, offset by i
                const phase = ((now + (i * pulseDuration / pulseCount)) % pulseDuration) / pulseDuration;

                // Ring expands from baseRadius up to 4x baseRadius
                const ringRadius = baseRadius + (phase * baseRadius * 4);
                // Opacity fades out as it expands
                const opacity = (1 - phase) * 0.6;

                context.beginPath();
                context.arc(coords[0], coords[1], ringRadius, 0, 2 * Math.PI);
                context.strokeStyle = `rgba(${colorRGB}, ${opacity})`;
                context.lineWidth = 1.5;
                context.stroke();
            }

            // 3. Inner core highlight
            context.beginPath();
            context.arc(coords[0], coords[1], baseRadius * 0.5, 0, 2 * Math.PI);
            context.fillStyle = '#fff';
            context.fill();
        });
    }
}
