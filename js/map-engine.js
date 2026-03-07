import { baseMap, overlays } from './config.js';

class OkayamaMapApp {
    constructor() {
        // 初期表示を岡山駅付近に設定
        this.map = L.map('map', { zoomControl: false, attributionControl: false }).setView([34.6664, 133.9186], 13);
        this.activeLayers = {}; // 表示中の Leaflet レイヤーを保持
        this.locationMarker = null;
        this.infoPopup = null;
        this.infoPopupTitle = null;
        this.infoPopupBody = null;
        this.layerPanel = document.getElementById('layer-panel');
        this.layerPanelToggle = document.getElementById('layer-panel-toggle');
        this.layerPanelContent = document.getElementById('layer-panel-content');
        this.layerPanelSummary = document.getElementById('layer-panel-summary');
        this.panelTouchStartY = null;
        this.panelTouchStartX = null;
        this.panelTouchMoved = false;
        this.lastKnownPanelDeltaY = 0;
        this.ignoreNextToggleClick = false;

        // 1. ベースマップを配置
        L.tileLayer(baseMap.url, { attribution: baseMap.attribution }).addTo(this.map);

        // 2. UIの生成
        this.createInfoPopup();
        this.renderLayerList();
        this.setupLayerPanel();
        this.updateLayerPanelSummary();
        this.updateControlsOffset();
        
        // 3. GPSボタン設定
        document.getElementById('gps-button').onclick = () => this.showLocation();
        this.map.on('locationfound', (e) => this.handleLocationFound(e));
        this.map.on('click', () => this.handleMapClick());
        window.addEventListener('resize', () => this.updateControlsOffset());
    }

    renderLayerList() {
        const listContainer = document.getElementById('layer-list');
        
        overlays.forEach(data => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.innerHTML = `
                <div class="layer-header">
                    <label class="layer-toggle-label"><input type="checkbox" class="toggle" data-id="${data.id}"></label>
                    <button type="button" class="layer-name-button" data-id="${data.id}">
                        <span class="layer-year">${data.year ?? ''}</span>
                        <span class="layer-name">${data.name}</span>
                    </button>
                </div>
            `;
            listContainer.appendChild(item);

            // イベント紐付け
            item.querySelector('.toggle').onchange = (e) => this.toggleLayer(e.target.checked, data);
            item.querySelector('.layer-name-button').onclick = () => this.openInfoPopup(data);
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
        const description = data.description || data.attribution || '説明はありません。';
        this.infoPopupTitle.textContent = data.name;
        this.infoPopupBody.textContent = description;
        this.infoPopup.classList.remove('hidden');
    }

    closeInfoPopup() {
        this.infoPopup.classList.add('hidden');
    }

    setupLayerPanel() {
        this.layerPanelToggle.onclick = () => {
            if (this.ignoreNextToggleClick) {
                this.ignoreNextToggleClick = false;
                return;
            }
            this.toggleLayerPanel();
        };

        this.layerPanelToggle.addEventListener('touchstart', (e) => this.handlePanelTouchStart(e), { passive: true });
        this.layerPanelToggle.addEventListener('touchmove', (e) => this.handlePanelTouchMove(e), { passive: false });
        this.layerPanelToggle.addEventListener('touchend', () => this.handlePanelTouchEnd());
        this.layerPanelToggle.addEventListener('touchcancel', () => this.resetPanelTouchState());
    }

    toggleLayerPanel() {
        const isOpen = !this.layerPanel.classList.contains('collapsed');
        if (isOpen) {
            this.closeLayerPanel();
        } else {
            this.openLayerPanel();
        }
    }

    openLayerPanel() {
        this.layerPanel.classList.remove('collapsed');
        this.layerPanelContent.classList.remove('hidden');
        this.layerPanelToggle.setAttribute('aria-expanded', 'true');
        this.updateControlsOffset();
    }

    closeLayerPanel() {
        this.layerPanel.classList.add('collapsed');
        this.layerPanelContent.classList.add('hidden');
        this.layerPanelToggle.setAttribute('aria-expanded', 'false');
        this.updateControlsOffset();
    }

    toggleLayer(isVisible, data) {
        if (isVisible) {
            const layer = L.tileLayer(data.url, {
                attribution: data.attribution,
                opacity: data.defaultOpacity,
                zIndex: data.zIndex
            }).addTo(this.map);
            this.activeLayers[data.id] = {
                layer,
                data,
                opacity: data.defaultOpacity
            };
        } else {
            if (this.activeLayers[data.id]) {
                this.map.removeLayer(this.activeLayers[data.id].layer);
                delete this.activeLayers[data.id];
            }
        }

        this.updateLayerPanelSummary();
    }

    setOpacity(id, val) {
        if (!this.activeLayers[id]) {
            return;
        }

        const opacity = Number(val);
        this.activeLayers[id].opacity = opacity;
        this.activeLayers[id].layer.setOpacity(opacity);
    }

    updateLayerPanelSummary() {
        const activeEntries = overlays
            .filter((data) => this.activeLayers[data.id])
            .map((data) => this.activeLayers[data.id]);

        this.layerPanelSummary.innerHTML = '';

        if (activeEntries.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'layer-panel-summary-empty';
            empty.textContent = 'レイヤーが選択されていません';
            this.layerPanelSummary.appendChild(empty);
            this.updateControlsOffset();
            return;
        }

        activeEntries.forEach((entry) => {
            const item = document.createElement('div');
            item.className = 'layer-panel-summary-item';
            item.innerHTML = `
                <span class="layer-panel-summary-year">${entry.data.year ?? ''}</span>
                <span class="layer-panel-summary-name">${this.getShortLayerName(entry.data.name)}</span>
                <input
                    type="range"
                    class="layer-panel-summary-slider"
                    min="0"
                    max="1"
                    step="0.1"
                    value="${entry.opacity}"
                    aria-label="${entry.data.name} の透過度"
                >
            `;

            item.querySelector('.layer-panel-summary-slider').oninput = (e) => this.setOpacity(entry.data.id, e.target.value);
            this.layerPanelSummary.appendChild(item);
        });

        this.updateControlsOffset();
    }

    getShortLayerName(name) {
        return name.length > 8 ? `${name.slice(0, 8)}...` : name;
    }

    handlePanelTouchStart(e) {
        if (e.touches.length !== 1) {
            this.resetPanelTouchState();
            return;
        }

        this.panelTouchStartY = e.touches[0].clientY;
        this.panelTouchStartX = e.touches[0].clientX;
        this.panelTouchMoved = false;
    }

    handlePanelTouchMove(e) {
        if (this.panelTouchStartY === null || this.panelTouchStartX === null || e.touches.length !== 1) {
            return;
        }

        const deltaY = e.touches[0].clientY - this.panelTouchStartY;
        const deltaX = e.touches[0].clientX - this.panelTouchStartX;
        this.lastKnownPanelDeltaY = deltaY;

        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
            this.panelTouchMoved = true;
            e.preventDefault();
        }
    }

    handlePanelTouchEnd() {
        if (this.panelTouchStartY === null) {
            return;
        }

        const isOpen = !this.layerPanel.classList.contains('collapsed');
        const lastDeltaY = this.panelTouchMoved ? (this.lastKnownPanelDeltaY ?? 0) : 0;

        if (this.panelTouchMoved && Math.abs(lastDeltaY) > 24) {
            this.ignoreNextToggleClick = true;

            if (lastDeltaY < 0 && !isOpen) {
                this.openLayerPanel();
            } else if (lastDeltaY > 0 && isOpen) {
                this.closeLayerPanel();
            }
        }

        this.resetPanelTouchState();
    }

    resetPanelTouchState() {
        this.panelTouchStartY = null;
        this.panelTouchStartX = null;
        this.panelTouchMoved = false;
        this.lastKnownPanelDeltaY = 0;
    }

    updateControlsOffset() {
        const panelHeight = this.layerPanel ? this.layerPanel.offsetHeight : 0;
        document.documentElement.style.setProperty('--controls-bottom-offset', `${panelHeight + 18}px`);
    }

    showLocation() {
        this.map.locate({setView: true, maxZoom: 15});
    }

    handleMapClick() {
        const isOpen = !this.layerPanel.classList.contains('collapsed');
        if (isOpen) {
            this.closeLayerPanel();
        }
    }

    handleLocationFound(e) {
        if (!this.locationMarker) {
            this.locationMarker = L.marker(e.latlng).addTo(this.map);
        } else {
            this.locationMarker.setLatLng(e.latlng);
        }
    }
}

const initApp = () => new OkayamaMapApp();

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
    initApp();
}