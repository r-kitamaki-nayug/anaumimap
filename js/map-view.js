import { baseMap, baseMaps } from './config.js?v=1.3.0';

export class OkayamaMapView {
    constructor({ onMapClick } = {}) {
        this.map = L.map('map', { zoomControl: false, attributionControl: false }).setView([34.6664, 133.9186], 13);
        this.baseMapOpacity = baseMap.defaultOpacity ?? 1;
        this.currentBaseMap = baseMap;
        this.baseMapLayer = L.tileLayer(baseMap.url, {
            attribution: baseMap.attribution,
            opacity: this.baseMapOpacity
        }).addTo(this.map);
        this.activeLayers = {};
        this.locationMarker = null;

        if (onMapClick) {
            this.map.on('click', onMapClick);
        }

        this.map.on('locationfound', (e) => this.handleLocationFound(e));
    }

    setOverlayVisibility(data, isVisible) {
        if (isVisible) {
            if (this.activeLayers[data.id]) {
                this.removeOverlayEntry(data.id);
            }

            const layerUrls = Array.isArray(data.urls) && data.urls.length > 0
                ? data.urls
                : [data.url];
            const layers = layerUrls.map((url) => L.tileLayer(url, this.buildOverlayOptions(data)).addTo(this.map));
            this.activeLayers[data.id] = {
                layer: layers[0],
                layers,
                data,
                opacity: data.defaultOpacity
            };
            return;
        }

        if (this.activeLayers[data.id]) {
            this.removeOverlayEntry(data.id);
        }
    }

    removeOverlayEntry(id) {
        const entry = this.activeLayers[id];
        if (!entry) {
            return;
        }

        entry.layers.forEach((layer) => {
            this.map.removeLayer(layer);
        });

        delete this.activeLayers[id];
    }

    buildOverlayOptions(data) {
        const options = {
            attribution: data.attribution,
            opacity: data.defaultOpacity,
            zIndex: data.zIndex
        };

        if (data.maxNativeZoom !== undefined) {
            options.maxNativeZoom = data.maxNativeZoom;
        }

        if (data.maxZoom !== undefined) {
            options.maxZoom = data.maxZoom;
        }

        if (data.minZoom !== undefined) {
            options.minZoom = data.minZoom;
        }

        return options;
    }

    setOverlayOpacity(id, val) {
        if (!this.activeLayers[id]) {
            return;
        }

        const opacity = Number(val);
        this.activeLayers[id].opacity = opacity;
        this.activeLayers[id].layers.forEach((layer) => {
            layer.setOpacity(opacity);
        });
    }

    setBaseMapOpacity(val) {
        const opacity = Number(val);
        this.baseMapOpacity = opacity;
        this.baseMapLayer.setOpacity(opacity);
    }

    cycleBaseMap() {
        const currentIndex = baseMaps.findIndex((item) => item.id === this.currentBaseMap.id);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % baseMaps.length : 0;
        this.setBaseMap(baseMaps[nextIndex]);
    }

    setBaseMap(data) {
        if (!data || data.id === this.currentBaseMap.id) {
            return;
        }

        if (this.baseMapLayer) {
            this.map.removeLayer(this.baseMapLayer);
        }

        this.currentBaseMap = data;
        this.baseMapLayer = L.tileLayer(data.url, {
            attribution: data.attribution,
            opacity: this.baseMapOpacity
        }).addTo(this.map);
    }

    getCurrentBaseMap() {
        return this.currentBaseMap;
    }

    getBaseMapOpacity() {
        return this.baseMapOpacity;
    }

    getActiveEntriesInOrder(overlayDefinitions) {
        return overlayDefinitions
            .filter((data) => this.activeLayers[data.id])
            .map((data) => this.activeLayers[data.id]);
    }

    showLocation() {
        this.map.locate({ setView: true, maxZoom: 15 });
    }

    handleLocationFound(e) {
        if (!this.locationMarker) {
            this.locationMarker = L.marker(e.latlng).addTo(this.map);
        } else {
            this.locationMarker.setLatLng(e.latlng);
        }
    }
}
