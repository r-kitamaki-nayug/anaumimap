import { overlays, overlayTabs } from './config.js?v=1.3.0';
import { notices } from './notices.js?v=1.3.0';
import { OkayamaMapView } from './map-view.js?v=1.3.0';

const NEW_BADGE_WINDOW_DAYS = 7;
const HEADER_AUTO_COLLAPSE_MS = 5000;
const NEW_LAYER_NOTICE_MS = 5000;
const WELCOME_POPUP_STORAGE_KEY = 'okayama-map-welcome-seen-v1';
const HEADER_NOTICES_STORAGE_KEY = 'okayama-map-header-notices-read-v1';

class OkayamaMapApp {
    constructor() {
        this.infoPopup = null;
        this.infoPopupTitle = null;
        this.infoPopupBody = null;
        this.welcomePopup = null;
        this.appHeader = document.getElementById('app-header');
        this.appHeaderToggle = document.getElementById('app-header-toggle');
        this.appHeaderNoticeBadge = document.getElementById('app-header-notice-badge');
        this.appHeaderAnnouncements = document.getElementById('app-header-announcements');
        this.appHeaderCollapseTimer = null;
        this.headerContentMode = 'default';
        this.newLayerNotice = null;
        this.newLayerNoticeTimer = null;
        this.layerPanel = document.getElementById('layer-panel');
        this.layerPanelToggle = document.getElementById('layer-panel-toggle');
        this.layerPanelContent = document.getElementById('layer-panel-content');
        this.layerPanelSummary = document.getElementById('layer-panel-summary');
        this.layerTabList = document.getElementById('layer-tabs');
        this.layerList = document.getElementById('layer-list');
        this.layerSelectAllToggle = document.getElementById('layer-select-all');
        this.layerSelectAllControl = document.querySelector('.layer-select-all');
        this.layerSelectAllHadAnyChecked = false;
        this.layerPanelResizeObserver = null;
        this.panelTouchStartY = null;
        this.panelTouchStartX = null;
        this.panelTouchMoved = false;
        this.lastKnownPanelDeltaY = 0;
        this.ignoreNextToggleClick = false;
        this.activeTab = this.getDefaultTabId();

        this.mapView = new OkayamaMapView({
            onMapClick: () => this.handleMapClick()
        });

        // 2. UIの生成
        this.createWelcomePopup();
        this.createInfoPopup();
        this.createNewLayerNotice();
        this.renderHeaderAnnouncements();
        this.updateHeaderNoticeStatus();
        this.setupHeader();
        this.renderLayerTabs();
        this.renderLayerList();
        this.setupLayerPanel();
        this.observeLayerPanelSize();
        this.updateLayerPanelSummary();
        this.updateControlsOffset();
        this.showWelcomePopupIfNeeded();
        this.showNewLayerNoticeIfNeeded();
        
        // 3. GPSボタン設定
        document.getElementById('gps-button').onclick = () => this.mapView.showLocation();
        window.addEventListener('resize', () => this.updateControlsOffset());
    }

    renderLayerList() {
        if (!this.layerList) {
            return;
        }

        const listContainer = this.layerList;
        const currentTab = this.getActiveTab();
        const currentOverlays = this.getCurrentTabOverlays();

        listContainer.innerHTML = '';
        listContainer.classList.toggle('layer-list-timeline', currentTab?.listStyle === 'timeline');
        listContainer.classList.toggle('layer-list-plain', currentTab?.listStyle !== 'timeline');

        if (currentOverlays.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'layer-list-empty';
            empty.textContent = 'このタブにはまだレイヤーがありません';
            listContainer.appendChild(empty);
            this.syncLayerSelectAllToggle();
            return;
        }

        currentOverlays.forEach(data => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.dataset.timelineYear = data.year ?? '';
            item.innerHTML = `
                <div class="layer-header">
                    <label class="layer-toggle-label"><input type="checkbox" class="toggle" data-id="${data.id}"></label>
                    <div class="layer-title-row">
                        <div class="layer-name-button">
                            <span class="layer-year">${data.year ?? ''}</span>
                            <span class="layer-name">${data.name}${this.getNewBadgeMarkup(data)}</span>
                        </div>
                        <button type="button" class="layer-info-button" aria-label="${data.name} の説明を表示">i</button>
                    </div>
                </div>
            `;
            listContainer.appendChild(item);

            // イベント紐付け
            const toggle = item.querySelector('.toggle');
            const infoButton = item.querySelector('.layer-info-button');
            toggle.checked = this.isOverlayActive(data.id);

            toggle.onchange = (e) => this.toggleLayer(e.target.checked, data);
            toggle.onclick = (e) => e.stopPropagation();
            infoButton.onclick = (e) => {
                e.stopPropagation();
                this.openInfoPopup(data);
            };
            item.onclick = () => {
                toggle.checked = !toggle.checked;
                this.toggleLayer(toggle.checked, data);
            };
        });

        this.syncLayerSelectAllToggle();
    }

    renderLayerTabs() {
        if (!this.layerTabList) {
            return;
        }

        this.layerTabList.innerHTML = '';

        overlayTabs.forEach((tab) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'layer-tab-button';
            button.dataset.tabId = tab.id;
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-controls', 'layer-list');
            button.setAttribute('aria-selected', String(tab.id === this.activeTab));
            button.tabIndex = tab.id === this.activeTab ? 0 : -1;
            button.classList.toggle('is-active', tab.id === this.activeTab);
            button.textContent = tab.label;
            button.onclick = () => this.setActiveTab(tab.id);
            this.layerTabList.appendChild(button);
        });
    }

    setActiveTab(tabId) {
        if (!this.getTabById(tabId) || tabId === this.activeTab) {
            return;
        }

        this.activeTab = tabId;
        this.renderLayerTabs();
        this.renderLayerList();
        this.updateControlsOffset();
    }

    getDefaultTabId() {
        return overlayTabs.find((tab) => tab.isDefault)?.id ?? overlayTabs[0]?.id ?? 'default';
    }

    getTabById(tabId) {
        return overlayTabs.find((tab) => tab.id === tabId) ?? null;
    }

    getOverlayTab(data) {
        return data.tab ?? this.getDefaultTabId();
    }

    getCurrentTabOverlays() {
        return overlays.filter((data) => this.getOverlayTab(data) === this.activeTab);
    }

    getVisibleLayerToggles() {
        if (!this.layerList) {
            return [];
        }

        return Array.from(this.layerList.querySelectorAll('.toggle'));
    }

    getActiveTab() {
        return this.getTabById(this.activeTab);
    }

    isOverlayActive(id) {
        return Boolean(this.mapView.activeLayers[id]);
    }

    createWelcomePopup() {
        const popup = document.createElement('div');
        popup.className = 'welcome-popup hidden';
        popup.innerHTML = `
            <div class="welcome-popup-backdrop"></div>
            <div class="welcome-popup-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-popup-title">
                <button type="button" class="welcome-popup-close" aria-label="閉じる">×</button>
                <div class="welcome-popup-content">
                    <h2 id="welcome-popup-title" class="welcome-popup-title">🗺️ 岡山の歴史を重ねて見るMAPへようこそ！</h2>
                    <p>今、あなたが立っているその場所、大昔は海だったかもしれません。</p>
                    <p>このアプリは、「かつての海岸線がどこにあったのか、どう街に変わったのかを視覚的に体験したい」という好奇心から生まれました。</p>
                    <h3 class="welcome-popup-heading">🌊 岡山駅は、かつて海だった</h3>
                    <p>今の岡山駅周辺や市街地の下には、かつての「吉備の穴海（きびのあなうみ）」が眠っています。数百年にわたる自然な土砂の堆積、大規模な干拓（かんたく）によって、岡山はダイナミックにその形を変えてきました。</p>
                    <h3 class="welcome-popup-heading">🕒 このアプリでできること</h3>
                    <p><strong>透かして見る:</strong> 各時代の情報の「透過度」を調整して、今の道路や線路が、昔の堤防や川の跡とどう重なるか確認できます。</p>
                    <p><strong>今いる場所を知る:</strong> GPSボタンを押せば、あなたの足元に広がる数世紀前の風景が浮かび上がります。</p>
                    <p>さあ、レイヤーを重ねて、足元に眠る歴史の跡を探しに出かけましょう！</p>
                    <h3 class="welcome-popup-heading">💡 ヒント</h3>
                    <p>ページ下部の「地図レイヤー」パネルから、重ねたい時代の地図を選んでみてください。特におすすめは「治水地形分類図」です。紫色のエリアを眺めると、かつての海の広さに驚くはずです！</p>
                    <button type="button" class="welcome-popup-action">はじめる</button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        this.welcomePopup = popup;

        popup.querySelector('.welcome-popup-close').onclick = () => this.closeWelcomePopup();
        popup.querySelector('.welcome-popup-backdrop').onclick = () => this.closeWelcomePopup();
        popup.querySelector('.welcome-popup-action').onclick = () => this.closeWelcomePopup();
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

    showWelcomePopupIfNeeded() {
        if (!this.welcomePopup) {
            return;
        }

        try {
            if (window.localStorage.getItem(WELCOME_POPUP_STORAGE_KEY) === 'true') {
                return;
            }
        } catch {
            // If storage is unavailable, fall back to showing once per page load.
        }

        this.welcomePopup.classList.remove('hidden');
    }

    createNewLayerNotice() {
        const notice = document.createElement('button');
        notice.type = 'button';
        notice.className = 'new-layer-notice';
        notice.setAttribute('aria-label', '新しいレイヤーのお知らせ');
        notice.setAttribute('aria-hidden', 'true');
        notice.onclick = () => {
            this.hideNewLayerNotice({ immediate: true });
            this.openLayerPanel();
        };

        document.body.appendChild(notice);
        this.newLayerNotice = notice;
    }

    setupHeader() {
        if (!this.appHeaderToggle) {
            return;
        }

        this.appHeaderToggle.onclick = () => {
            const isCollapsed = this.appHeader.classList.contains('collapsed');
            if (isCollapsed) {
                this.openHeaderFromUser();
            } else {
                this.setHeaderCollapsed(true);
            }
        };

        this.setHeaderContentMode('default');
        this.scheduleHeaderAutoCollapse();
    }

    setHeaderCollapsed(collapsed, { autoCollapse = true } = {}) {
        if (!this.appHeader || !this.appHeaderToggle) {
            return;
        }

        this.appHeader.classList.toggle('collapsed', collapsed);
        this.appHeaderToggle.setAttribute('aria-expanded', String(!collapsed));

        if (collapsed) {
            this.clearHeaderAutoCollapse();
        } else if (autoCollapse) {
            this.scheduleHeaderAutoCollapse();
        } else {
            this.clearHeaderAutoCollapse();
        }
    }

    openHeaderFromUser() {
        const hasNotices = this.hasHeaderNotices();
        this.setHeaderContentMode(hasNotices ? 'notices' : 'default');

        if (hasNotices) {
            this.markHeaderNoticesRead();
            this.updateHeaderNoticeStatus();
        }

        this.setHeaderCollapsed(false, { autoCollapse: false });
    }

    scheduleHeaderAutoCollapse() {
        this.clearHeaderAutoCollapse();
        this.appHeaderCollapseTimer = window.setTimeout(() => {
            this.setHeaderCollapsed(true);
        }, HEADER_AUTO_COLLAPSE_MS);
    }

    clearHeaderAutoCollapse() {
        if (this.appHeaderCollapseTimer !== null) {
            window.clearTimeout(this.appHeaderCollapseTimer);
            this.appHeaderCollapseTimer = null;
        }
    }

    renderHeaderAnnouncements() {
        if (!this.appHeaderAnnouncements) {
            return;
        }

        this.appHeaderAnnouncements.innerHTML = '';

        const inner = document.createElement('div');
        inner.className = 'app-header-announcements-inner';

        const heading = document.createElement('span');
        heading.className = 'app-header-announcements-heading';
        heading.textContent = '更新ログ';
        inner.appendChild(heading);

        notices.forEach((notice) => {
            const item = document.createElement('p');
            item.className = 'app-header-announcement-item';
            item.textContent = notice.text;
            inner.appendChild(item);
        });

        this.appHeaderAnnouncements.appendChild(inner);
    }

    setHeaderContentMode(mode) {
        this.headerContentMode = mode;

        if (!this.appHeader) {
            return;
        }

        this.appHeader.dataset.mode = mode;

        if (this.appHeaderAnnouncements) {
            const shouldShowAnnouncements = mode === 'notices' && this.hasHeaderNotices();
            this.appHeaderAnnouncements.setAttribute('aria-hidden', String(!shouldShowAnnouncements));
        }
    }

    hasHeaderNotices() {
        return notices.length > 0;
    }

    loadHeaderReadNoticeMap() {
        try {
            const raw = window.localStorage.getItem(HEADER_NOTICES_STORAGE_KEY);
            if (!raw) {
                return {};
            }

            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    }

    saveHeaderReadNoticeMap(readMap) {
        try {
            window.localStorage.setItem(HEADER_NOTICES_STORAGE_KEY, JSON.stringify(readMap));
        } catch {
            // Ignore storage write failures and keep the badge for this session.
        }
    }

    getUnreadHeaderNotices() {
        const readMap = this.loadHeaderReadNoticeMap();
        return notices.filter((notice) => readMap[notice.id] !== true);
    }

    markHeaderNoticesRead() {
        if (!this.hasHeaderNotices()) {
            return;
        }

        const readMap = this.loadHeaderReadNoticeMap();
        let changed = false;

        notices.forEach((notice) => {
            if (readMap[notice.id] !== true) {
                readMap[notice.id] = true;
                changed = true;
            }
        });

        if (changed) {
            this.saveHeaderReadNoticeMap(readMap);
        }
    }

    updateHeaderNoticeStatus() {
        if (!this.appHeader || !this.appHeaderNoticeBadge) {
            return;
        }

        const hasUnread = this.getUnreadHeaderNotices().length > 0;
        this.appHeader.dataset.hasUnread = String(hasUnread);
        this.appHeaderNoticeBadge.classList.toggle('hidden', !hasUnread);
        this.appHeaderNoticeBadge.setAttribute('aria-hidden', String(!hasUnread));
    }

    showNewLayerNoticeIfNeeded() {
        const recentOverlays = overlays.filter((data) => this.isRecentlyAdded(data));
        if (recentOverlays.length === 0 || !this.newLayerNotice) {
            return;
        }

        const message = recentOverlays.length === 1
            ? `📣 ${recentOverlays[0].year} ${recentOverlays[0].name} が追加されました`
            : `📣 ${recentOverlays[0].year} ${recentOverlays[0].name} ほか${recentOverlays.length}件のレイヤーが追加されました`;

        this.newLayerNotice.textContent = message;
        this.newLayerNotice.classList.remove('no-transition');
        this.newLayerNotice.classList.add('is-visible');
        this.newLayerNotice.setAttribute('aria-hidden', 'false');
        this.clearNewLayerNoticeTimer();
        this.newLayerNoticeTimer = window.setTimeout(() => {
            this.hideNewLayerNotice();
        }, NEW_LAYER_NOTICE_MS);
    }

    hideNewLayerNotice({ immediate = false } = {}) {
        if (!this.newLayerNotice) {
            return;
        }

        this.newLayerNotice.classList.toggle('no-transition', immediate);
        this.newLayerNotice.classList.remove('is-visible');
        this.newLayerNotice.setAttribute('aria-hidden', 'true');
        this.clearNewLayerNoticeTimer();
    }

    closeWelcomePopup() {
        if (!this.welcomePopup) {
            return;
        }

        this.welcomePopup.classList.add('hidden');

        try {
            window.localStorage.setItem(WELCOME_POPUP_STORAGE_KEY, 'true');
        } catch {
            // Ignore storage write failures and simply close the popup for this session.
        }
    }

    clearNewLayerNoticeTimer() {
        if (this.newLayerNoticeTimer !== null) {
            window.clearTimeout(this.newLayerNoticeTimer);
            this.newLayerNoticeTimer = null;
        }
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
        this.setLayerPanelExpanded(!this.layerPanel.classList.contains('collapsed'));

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

        if (this.layerSelectAllControl && this.layerSelectAllToggle) {
            const rememberLayerSelectionState = () => {
                this.layerSelectAllHadAnyChecked = this.getVisibleLayerToggles()
                    .some((toggle) => toggle.checked);
            };

            this.layerSelectAllControl.addEventListener('pointerdown', rememberLayerSelectionState);
            this.layerSelectAllControl.addEventListener('touchstart', rememberLayerSelectionState, { passive: true });

            this.layerSelectAllToggle.onchange = () => {
                this.toggleAllLayers();
            };
        }
    }

    observeLayerPanelSize() {
        if (!this.layerPanel || typeof ResizeObserver === 'undefined') {
            return;
        }

        this.layerPanelResizeObserver = new ResizeObserver(() => {
            this.updateControlsOffset();
        });
        this.layerPanelResizeObserver.observe(this.layerPanel);
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
        this.setLayerPanelExpanded(true);
    }

    closeLayerPanel() {
        this.setLayerPanelExpanded(false);
    }

    setLayerPanelExpanded(isExpanded) {
        if (!this.layerPanel || !this.layerPanelContent || !this.layerPanelToggle) {
            return;
        }

        this.layerPanel.classList.toggle('collapsed', !isExpanded);
        this.layerPanelContent.classList.toggle('hidden', !isExpanded);
        this.layerPanelToggle.setAttribute('aria-expanded', String(isExpanded));
        this.layerPanelContent.setAttribute('aria-hidden', String(!isExpanded));

        if ('inert' in this.layerPanelContent) {
            this.layerPanelContent.inert = !isExpanded;
        }

        this.updateControlsOffset();
    }

    toggleLayer(isVisible, data) {
        this.mapView.setOverlayVisibility(data, isVisible);
        this.updateLayerPanelSummary();
        this.syncLayerSelectAllToggle();
    }

    setAllLayersVisible(isVisible) {
        this.getCurrentTabOverlays().forEach((data) => {
            const toggle = this.layerList?.querySelector(`.toggle[data-id="${data.id}"]`);
            if (toggle) {
                toggle.checked = isVisible;
            }

            this.mapView.setOverlayVisibility(data, isVisible);
        });

        this.updateLayerPanelSummary();
        this.syncLayerSelectAllToggle();
    }

    toggleAllLayers() {
        this.setAllLayersVisible(!this.layerSelectAllHadAnyChecked);
    }

    syncLayerSelectAllToggle() {
        if (!this.layerSelectAllToggle) {
            return;
        }

        const toggles = this.getVisibleLayerToggles();
        if (toggles.length === 0) {
            this.layerSelectAllToggle.checked = false;
            this.layerSelectAllToggle.indeterminate = false;
            return;
        }

        const checkedCount = toggles.filter((toggle) => toggle.checked).length;

        this.layerSelectAllToggle.checked = checkedCount > 0 && checkedCount === toggles.length;
        this.layerSelectAllToggle.indeterminate = checkedCount > 0 && checkedCount < toggles.length;
    }

    setOpacity(id, val) {
        this.mapView.setOverlayOpacity(id, val);
    }

    setBaseMapOpacity(val) {
        this.mapView.setBaseMapOpacity(val);
    }

    cycleBaseMap() {
        this.mapView.cycleBaseMap();
        this.updateLayerPanelSummary();
    }

    updateLayerPanelSummary() {
        const activeEntries = this.mapView.getActiveEntriesInOrder(overlays);
        const currentBaseMap = this.mapView.getCurrentBaseMap();

        this.layerPanelSummary.innerHTML = '';

        const baseMapItem = document.createElement('div');
        baseMapItem.className = 'layer-panel-summary-item layer-panel-summary-item-base';
        baseMapItem.innerHTML = `
            <span class="layer-panel-summary-year">現代</span>
            <button
                type="button"
                class="layer-panel-summary-name layer-panel-summary-name-button"
                aria-label="基本地図を切り替え"
            >
                <span class="layer-panel-summary-name-text">${currentBaseMap.name}</span>
                <span class="layer-panel-summary-switch-icon" aria-hidden="true">⇄</span>
            </button>
            <input
                type="range"
                class="layer-panel-summary-slider"
                min="0"
                max="1"
                step="0.1"
                value="${this.mapView.getBaseMapOpacity()}"
                aria-label="基本地図の透過度"
            >
        `;
        baseMapItem.querySelector('.layer-panel-summary-name-button').onclick = () => this.cycleBaseMap();
        baseMapItem.querySelector('.layer-panel-summary-slider').oninput = (e) => this.setBaseMapOpacity(e.target.value);
        this.layerPanelSummary.appendChild(baseMapItem);

        if (activeEntries.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'layer-panel-summary-empty';
            empty.textContent = '追加レイヤーが選択されていません';
            this.layerPanelSummary.appendChild(empty);
            this.updateControlsOffset();
            return;
        }

        activeEntries.forEach((entry) => {
            const item = document.createElement('div');
            item.className = 'layer-panel-summary-item';
            item.innerHTML = `
                <span class="layer-panel-summary-year">${entry.data.year ?? ''}</span>
                <span class="layer-panel-summary-name">${this.getShortLayerName(entry.data.name)}${this.getNewBadgeMarkup(entry.data)}</span>
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

    getNewBadgeMarkup(data) {
        return this.isRecentlyAdded(data) ? '<span class="new-badge">NEW</span>' : '';
    }

    isRecentlyAdded(data) {
        if (!data.addedAt) {
            return false;
        }

        const addedDate = new Date(`${data.addedAt}T00:00:00`);
        if (Number.isNaN(addedDate.getTime())) {
            return false;
        }

        const now = new Date();
        const diffMs = now.getTime() - addedDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        return diffDays >= 0 && diffDays < NEW_BADGE_WINDOW_DAYS;
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

    handleMapClick() {
        const isLayerPanelOpen = !this.layerPanel.classList.contains('collapsed');
        if (isLayerPanelOpen) {
            this.closeLayerPanel();
        }

        const isHeaderOpen = this.appHeader && !this.appHeader.classList.contains('collapsed');
        if (isHeaderOpen) {
            this.setHeaderCollapsed(true);
        }
    }
}

const initApp = () => new OkayamaMapApp();

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
    initApp();
}