import { baseMap } from './config.js?v=1.0.6';

export class OkayamaMapView {
    constructor({ onMapClick } = {}) {
        this.map = L.map('map', { zoomControl: false, attributionControl: false }).setView([34.6664, 133.9186], 13);
        this.baseMapOpacity = baseMap.defaultOpacity ?? 1;
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
            const layer = L.tileLayer(data.url, this.buildOverlayOptions(data)).addTo(this.map);
            this.activeLayers[data.id] = {
                layer,
                data,
                opacity: data.defaultOpacity
            };
            return;
        }

        if (this.activeLayers[data.id]) {
            this.map.removeLayer(this.activeLayers[data.id].layer);
            delete this.activeLayers[data.id];
        }
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

        return options;
    }

    setOverlayOpacity(id, val) {
        if (!this.activeLayers[id]) {
            return;
        }

        const opacity = Number(val);
        this.activeLayers[id].opacity = opacity;
        this.activeLayers[id].layer.setOpacity(opacity);
    }

    setBaseMapOpacity(val) {
        const opacity = Number(val);
        this.baseMapOpacity = opacity;
        this.baseMapLayer.setOpacity(opacity);
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
