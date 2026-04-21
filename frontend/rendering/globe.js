import { state } from '../state.js';

export class GlobeRenderer {
    constructor(canvas, tooltip) {
        this.canvas = canvas;
        this.tooltip = tooltip;
        this.context = canvas.getContext('2d');
        
        // Offscreen buffer for expensive map rendering
        this.bufferCanvas = document.createElement('canvas');
        this.bufferContext = this.bufferCanvas.getContext('2d');
        
        this.projection = d3.geoOrthographic()
            .scale(state.scale)
            .center([0, 0])
            .rotate(state.rotation);
            
        this.path = d3.geoPath().projection(this.projection);
        
        this.cache = {
            land: null,
            countries: null,
            algeria: null,
            isDirty: true
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
        
        // Update main canvas
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.context.scale(dpr, dpr);
        
        // Update buffer canvas
        this.bufferCanvas.width = this.canvas.width;
        this.bufferCanvas.height = this.canvas.height;
        this.bufferContext.scale(dpr, dpr);
        
        this.projection.translate([this.width / 2, this.height / 2]);
        
        const minDim = Math.min(this.width, this.height);
        state.scale = minDim * 0.45;
        this.projection.scale(state.scale);
        
        this.cache.isDirty = true;
    }

    setupInteractions() {
        const drag = d3.drag()
            .on('start', () => {
                state.isDragging = true;
            })
            .on('drag', (event) => {
                const r = this.projection.rotate();
                const k = 75 / this.projection.scale();
                this.projection.rotate([r[0] + event.dx * k, r[1] - event.dy * k]);
                state.rotation = this.projection.rotate();
                this.cache.isDirty = true;
            })
            .on('end', () => {
                state.isDragging = false;
            });

        d3.select(this.canvas).call(drag);
        
        d3.select(this.canvas).on('wheel', (event) => {
            event.preventDefault();
            const delta = -event.deltaY;
            state.scale = Math.max(100, Math.min(2000, state.scale + delta * 0.5));
            this.projection.scale(state.scale);
            this.cache.isDirty = true;
        });
    }

    startAnimation() {
        d3.timer(() => {
            if (!state.isPaused && !state.isDragging) {
                const r = this.projection.rotate();
                const speed = state.rotationSpeed / 1000;
                this.projection.rotate([r[0] + speed, r[1]]);
                state.rotation = this.projection.rotate();
                this.cache.isDirty = true;
            }
            this.render();
        });
    }

    prepareData() {
        if (state.geoData.world && !this.cache.land) {
            this.cache.land = topojson.feature(state.geoData.world, state.geoData.world.objects.land);
            this.cache.countries = topojson.feature(state.geoData.world, state.geoData.world.objects.countries);
        }
        if (state.geoData.algeria && !this.cache.algeria) {
            this.cache.algeria = state.geoData.algeria;
        }
    }

    renderToBuffer() {
        // Detect if rotation or scale has changed since last buffer render
        const currentRotation = this.projection.rotate();
        const currentScale = this.projection.scale();
        
        if (!this.cache.lastRotation) this.cache.lastRotation = [0, 0, 0];
        
        const hasMoved = currentRotation[0] !== this.cache.lastRotation[0] || 
                         currentRotation[1] !== this.cache.lastRotation[1] ||
                         currentScale !== this.cache.lastScale;

        if (!this.cache.isDirty && !hasMoved) return;
        
        this.prepareData();
        
        const ctx = this.bufferContext;
        const path = this.path.context(ctx);
        
        ctx.clearRect(0, 0, this.width, this.height);
        
        // ... (rest of rendering logic)
        // 1. Seas
        ctx.beginPath();
        path({ type: 'Sphere' });
        ctx.fillStyle = '#89C2D9'; 
        ctx.fill();

        // 2. Halo
        ctx.strokeStyle = '#89C2D9AA';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 3. Land
        if (this.cache.land) {
            ctx.beginPath();
            path(this.cache.land);
            ctx.fillStyle = '#1A2B3C';
            ctx.fill();
        }

        // 4. Borders
        if (this.cache.countries) {
            ctx.beginPath();
            path(this.cache.countries);
            ctx.strokeStyle = '#2a313d';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // 5. Algeria
        if (this.cache.algeria) {
            ctx.beginPath();
            path(this.cache.algeria);
            ctx.strokeStyle = '#00FF88';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        this.cache.isDirty = false;
        this.cache.lastRotation = [...currentRotation];
        this.cache.lastScale = currentScale;
    }

    render() {
        this.renderToBuffer();
        
        const { context, width, height } = this;
        context.clearRect(0, 0, width, height);
        
        // Draw the pre-rendered map buffer
        context.drawImage(this.bufferCanvas, 0, 0, width, height);

        // Render dynamic events on top (must be live because of projection changes)
        this.renderEvents();
    }

    renderEvents() {
        const { context, projection } = this;
        const path = this.path.context(context);
        
        state.events.forEach(event => {
            const coords = projection(event.coordinates);
            if (!coords) return;

            const gdistance = d3.geoDistance(event.coordinates, projection.invert([this.width / 2, this.height / 2]));
            if (gdistance > Math.PI / 2) return;

            const radius = Math.sqrt(event.intensity) * 6 + 2;
            
            context.beginPath();
            context.arc(coords[0], coords[1], radius, 0, 2 * Math.PI);
            context.fillStyle = event.type === 'international' ? '#FFD700' : '#00FF88'; 
            context.fill();
            context.strokeStyle = '#fff';
            context.lineWidth = 1.5;
            context.stroke();
        });
    }
}
