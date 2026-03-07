import { baseMap, overlays } from './config.js';

class OkayamaMapApp {
    constructor() {
        // 初期表示を沖新田付近（岡山市中区・東区あたり）に設定
        this.map = L.map('map', { zoomControl: false, attributionControl: false }).setView([34.6300, 133.9800], 13);
        this.activeLayers = {}; // 表示中の Leaflet レイヤーを保持
        this.locationMarker = null;
        this.infoPopup = null;
        this.infoPopupTitle = null;
        this.infoPopupBody = null;
        this.layerPanel = document.getElementById('layer-panel');
        this.layerToggleButton = document.getElementById('layer-toggle-button');

        // 1. ベースマップを配置
        L.tileLayer(baseMap.url, { attribution: baseMap.attribution }).addTo(this.map);

        // 2. UIの生成
        this.createInfoPopup();
        this.renderLayerList();
        this.setupLayerPanel();
        
        // 3. GPSボタン設定
        document.getElementById('gps-button').onclick = () => this.showLocation();
        this.map.on('locationfound', (e) => this.handleLocationFound(e));
    }

    renderLayerList() {
        const listContainer = document.getElementById('layer-list');
        
        overlays.forEach(data => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.innerHTML = `
                <div class="layer-header">
                    <label class="layer-toggle-label"><input type="checkbox" class="toggle" data-id="${data.id}"></label>
                    <button type="button" class="layer-name-button" data-id="${data.id}">${data.name}</button>
                </div>
                <div class="opacity-group">
                    <span>透過</span>
                    <input type="range" class="opacity" data-id="${data.id}" min="0" max="1" step="0.1" value="${data.defaultOpacity}">
                </div>
                <div class="order-group">
                    <button class="up" data-id="${data.id}">前面へ</button>
                    <button class="down" data-id="${data.id}">背面へ</button>
                </div>
            `;
            listContainer.appendChild(item);

            // イベント紐付け
            item.querySelector('.toggle').onchange = (e) => this.toggleLayer(e.target.checked, data);
            item.querySelector('.layer-name-button').onclick = () => this.openInfoPopup(data);
            item.querySelector('.opacity').oninput = (e) => this.setOpacity(data.id, e.target.value);
            item.querySelector('.up').onclick = () => this.moveZ(data.id, 10);
            item.querySelector('.down').onclick = () => this.moveZ(data.id, -10);
        });
    }

    createInfoPopup() {
        const popup = document.createElement('div');
        popup.className = 'info-popup hidden';
        popup.innerHTML = `
            <div class="info-popup-backdrop"></div>
            <div class="info-popup-dialog" role="dialog" aria-modal="true" aria-labelledby="info-popup-title">
                <button type="button" class="info-popup-close" aria-label="閉じる">×</button>
                <h4 id="info-popup-title" class="info-popup-title"></h4>
                <p class="info-popup-body"></p>
            </div>
        `;

        document.body.appendChild(popup);

        this.infoPopup = popup;
        this.infoPopupTitle = popup.querySelector('.info-popup-title');
        this.infoPopupBody = popup.querySelector('.info-popup-body');

        popup.querySelector('.info-popup-close').onclick = () => this.closeInfoPopup();
        popup.querySelector('.info-popup-backdrop').onclick = () => this.closeInfoPopup();
    }

    openInfoPopup(data) {
        const description = data.attribution || '説明はありません。';
        this.infoPopupTitle.textContent = data.name;
        this.infoPopupBody.textContent = description;
        this.infoPopup.classList.remove('hidden');
    }

    closeInfoPopup() {
        this.infoPopup.classList.add('hidden');
    }

    setupLayerPanel() {
        this.layerToggleButton.onclick = (e) => {
            e.stopPropagation();
            this.toggleLayerPanel();
        };

        this.layerPanel.onclick = (e) => e.stopPropagation();

        document.addEventListener('click', () => {
            this.closeLayerPanel();
        });
    }

    toggleLayerPanel() {
        const isOpen = !this.layerPanel.classList.contains('hidden');
        if (isOpen) {
            this.closeLayerPanel();
        } else {
            this.openLayerPanel();
        }
    }

    openLayerPanel() {
        this.layerPanel.classList.remove('hidden');
        this.layerToggleButton.setAttribute('aria-expanded', 'true');
    }

    closeLayerPanel() {
        this.layerPanel.classList.add('hidden');
        this.layerToggleButton.setAttribute('aria-expanded', 'false');
    }

    toggleLayer(isVisible, data) {
        if (isVisible) {
            const layer = L.tileLayer(data.url, {
                attribution: data.attribution,
                opacity: data.defaultOpacity,
                zIndex: data.zIndex
            }).addTo(this.map);
            this.activeLayers[data.id] = { layer, data };
        } else {
            if (this.activeLayers[data.id]) {
                this.map.removeLayer(this.activeLayers[data.id].layer);
                delete this.activeLayers[data.id];
            }
        }
    }

    setOpacity(id, val) {
        if (this.activeLayers[id]) this.activeLayers[id].layer.setOpacity(val);
    }

    moveZ(id, delta) {
        if (this.activeLayers[id]) {
            this.activeLayers[id].data.zIndex += delta;
            this.activeLayers[id].layer.setZIndex(this.activeLayers[id].data.zIndex);
        }
    }

    showLocation() {
        this.map.locate({setView: true, maxZoom: 15});
    }

    handleLocationFound(e) {
        if (!this.locationMarker) {
            this.locationMarker = L.marker(e.latlng).addTo(this.map);
        } else {
            this.locationMarker.setLatLng(e.latlng);
        }

        this.locationMarker.bindPopup("現在地").openPopup();
    }
}

const initApp = () => new OkayamaMapApp();

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
    initApp();
}