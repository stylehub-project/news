// --- MAP MANAGER ---
class MapManager {
    constructor(containerId, onMarkerClick) {
        this.containerId = containerId;
        this.onMarkerClick = onMarkerClick;
        this.map = null;
        this.markers = [];
        // Esri World Imagery (Satellite)
        this.satelliteStyle = {
            'version': 8,
            'sources': {
                'raster-tiles': {
                    'type': 'raster',
                    'tiles': ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                    'tileSize': 256,
                    'attribution': 'Tiles &copy; Esri'
                }
            },
            'layers': [{ 'id': 'simple-tiles', 'type': 'raster', 'source': 'raster-tiles', 'minzoom': 0, 'maxzoom': 22 }]
        };
    }

    init() {
        if (this.map) return;
        this.map = new maplibregl.Map({
            container: this.containerId,
            style: this.satelliteStyle,
            center: [20, 30], zoom: 2, pitch: 0, bearing: 0, antialias: true,
            attributionControl: false // Cleaner UI
        });

        // Add attribution manually if needed or keep it minimal
        this.map.addControl(new maplibregl.AttributionControl({ compact: true }));
    }

    addMarkers(newsItems) {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];

        newsItems.forEach(item => {
            const el = document.createElement('div');
            el.className = `news-marker ${item.type}`;

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onMarkerClick(item);
                this.map.flyTo({ center: [item.location.lng, item.location.lat], zoom: 6, speed: 1.2, curve: 1.4 });
            });

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([item.location.lng, item.location.lat])
                .addTo(this.map);
            this.markers.push(marker);
        });
    }

    zoomIn() { this.map.zoomIn(); }
    zoomOut() { this.map.zoomOut(); }
    resetView() { this.map.flyTo({ center: [20, 30], zoom: 2, pitch: 0 }); }

    flyTo(center, zoom) {
        this.map.flyTo({ center, zoom, speed: 1.2, curve: 1.4 });
    }

    toggle3D() {
        const currentPitch = this.map.getPitch();
        const is3D = currentPitch < 30; // If currently flat, go 3D

        const targetPitch = is3D ? 60 : 0;

        this.map.easeTo({
            pitch: targetPitch,
            duration: 1000
        });

        if (is3D) {
            // Start rotating for "Living Globe" feel
            this.rotateCamera(0);
        } else {
            this.stopRotation();
        }
    }

    rotateCamera(timestamp) {
        // Rotate at 60fps
        const rotate = () => {
            if (this.map.getPitch() < 30) return; // Stop if user flattened map

            // Clamp pitch to ensure it stays 3D
            const bearing = this.map.getBearing();
            this.map.easeTo({
                bearing: bearing + 0.1, // Slow rotation
                duration: 0,
                easing: t => t
            });
            this.animationFrame = requestAnimationFrame(rotate);
        }

        this.animationFrame = requestAnimationFrame(rotate);
    }

    stopRotation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null; // Clear the animation frame ID
        }
    }
}
