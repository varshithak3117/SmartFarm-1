/**
 * SmartFarm Main Application Controller
 * Handles page navigation, rendering of all 10 views, event delegation,
 * dynamic calculations, modal workflows, and multilingual reactivity.
 */

const App = {
  currentPage: 'page-home',

  init() {
    I18N.applyTranslations();
    this.setupEventListeners();
    this.renderCurrentPage();
    this.updateTopBar();
    ApiClient.checkBackendHealth();
  },

  setupEventListeners() {
    // Navigation items
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.getAttribute('data-navigate');
        this.navigateTo(targetPage);
      });
    });

    // Language selector in top bar & settings
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = I18N.currentLang;
      langSelect.addEventListener('change', (e) => {
        I18N.setLanguage(e.target.value);
      });
    }

    const settingsLangSelect = document.getElementById('settingsLangSelect');
    if (settingsLangSelect) {
      settingsLangSelect.value = I18N.currentLang;
      settingsLangSelect.addEventListener('change', (e) => {
        I18N.setLanguage(e.target.value);
      });
    }

    const voiceLanguageControls = [
      document.getElementById('voiceLanguageSelect'),
      document.getElementById('voiceLanguageQuickSelect')
    ].filter(Boolean);
    voiceLanguageControls.forEach(select => {
      select.value = VoiceAlerts.language;
      select.addEventListener('change', (e) => {
        VoiceAlerts.setLanguage(e.target.value);
        voiceLanguageControls.forEach(control => { control.value = VoiceAlerts.language; });
      });
    });

    const searchForm = document.getElementById('siteSearchForm');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.searchCurrentPage();
      });
    }

    const voiceSearchButton = document.getElementById('voiceSearchButton');
    if (voiceSearchButton) {
      voiceSearchButton.addEventListener('click', () => this.startVoiceSearch(voiceSearchButton));
    }

    // Active land selector dropdown in header
    const landSelect = document.getElementById('activeLandSelect');
    if (landSelect) {
      landSelect.addEventListener('change', (e) => {
        StorageManager.setActiveLandId(e.target.value);
      });
    }

    // Voice alert toggle in header
    const voiceToggle = document.getElementById('voiceToggle');
    if (voiceToggle) {
      voiceToggle.checked = VoiceAlerts.enabled;
      voiceToggle.addEventListener('change', (e) => {
        VoiceAlerts.setEnabled(e.target.checked);
      });
    }

    // Global events
    window.addEventListener('languageChanged', (event) => {
      if (langSelect) langSelect.value = event.detail.lang;
      if (settingsLangSelect) settingsLangSelect.value = event.detail.lang;
      let savedVoiceLanguage = null;
      try {
        savedVoiceLanguage = localStorage.getItem('smartfarm_voice_language');
      } catch (e) {}
      if (voiceLanguageControls.length && !savedVoiceLanguage) {
        VoiceAlerts.setLanguage(event.detail.lang, false);
        voiceLanguageControls.forEach(control => { control.value = VoiceAlerts.language; });
      }
      this.updateTopBar();
      this.renderCurrentPage();
    });

    window.addEventListener('landsUpdated', () => {
      this.updateTopBar();
      this.renderCurrentPage();
    });

    window.addEventListener('activeLandChanged', () => {
      this.updateTopBar();
      this.renderCurrentPage();
    });

    window.addEventListener('alertsUpdated', () => {
      this.renderAlertBadge();
      if (this.currentPage === 'page-alerts' || this.currentPage === 'page-home') {
        this.renderCurrentPage();
      }
    });

    window.addEventListener('simulationUpdate', () => {
      this.updateRealtimeBadges();
    });

    // Mobile sidebar toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.app-sidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  },

  searchCurrentPage() {
    const searchInput = document.getElementById('siteSearchInput');
    const status = document.getElementById('searchStatus');
    const resultsContainer = document.getElementById('siteSearchResults');
    const query = searchInput ? searchInput.value.trim().toLocaleLowerCase() : '';
    if (!searchInput || !status || !resultsContainer) return;
    resultsContainer.replaceChildren();
    status.textContent = '';
    if (!query) return;

    const lands = StorageManager.getLands();
    const landById = new Map(lands.map(land => [land.id, land]));
    const records = [];

    lands.forEach(land => {
      records.push({
        typeKey: 'searchTypeLand',
        title: land.name,
        detail: `${land.location} · ${land.cropType} · ${land.area} ${land.areaUnit}`,
        searchText: Object.values(land).join(' '),
        page: 'page-lands',
        landId: land.id
      });
    });

    StorageManager.getZones().forEach(zone => {
      const land = landById.get(zone.landId);
      records.push({
        typeKey: 'searchTypeZone',
        title: zone.name,
        detail: `${land ? land.name : ''} · ${zone.currentMoisture}% moisture · ${zone.irrigationStatus}`,
        searchText: `${Object.values(zone).join(' ')} ${land ? land.name : ''}`,
        page: 'page-zones',
        landId: zone.landId
      });
    });

    const languageSuffix = { en: 'En', kn: 'Kn', hi: 'Hi' }[I18N.currentLang] || 'En';
    StorageManager.getAlerts().forEach(alert => {
      const land = landById.get(alert.landId);
      const message = alert[`message${languageSuffix}`] || alert.messageEn || alert.message || '';
      records.push({
        typeKey: 'searchTypeAlert',
        title: message || alert.type,
        detail: `${land ? land.name : ''} · ${alert.priority} · ${alert.resolved ? I18N.t('statusResolved') : I18N.t('statusUnresolved')}`,
        searchText: `${Object.values(alert).join(' ')} ${land ? land.name : ''}`,
        page: 'page-alerts',
        landId: alert.landId
      });
    });

    StorageManager.getIrrigationLogs().forEach(log => {
      const land = landById.get(log.landId);
      const zone = StorageManager.getZoneById(log.zoneId);
      records.push({
        typeKey: 'searchTypeIrrigation',
        title: `${land ? land.name : I18N.t('searchTypeIrrigation')} · ${zone ? zone.name : log.mode}`,
        detail: `${log.durationMinutes} min · ${log.waterUsedLitres} L · ${log.reasonStart || ''}`,
        searchText: `${Object.values(log).join(' ')} ${land ? land.name : ''} ${zone ? zone.name : ''}`,
        page: 'page-irrigation',
        landId: log.landId
      });
    });

    const matchingRecords = records.filter(record => record.searchText.toLocaleLowerCase().includes(query));
    const activePage = document.querySelector('.page-view.active');
    const pageText = activePage ? activePage.textContent.replace(/\s+/g, ' ').trim() : '';
    const pageMatch = pageText.toLocaleLowerCase().indexOf(query);
    if (pageMatch !== -1) {
      const heading = activePage.querySelector('h1');
      matchingRecords.push({
        typeKey: 'searchTypePage',
        title: heading ? heading.textContent.trim() : I18N.t('searchTypePage'),
        detail: `...${pageText.slice(Math.max(0, pageMatch - 45), pageMatch + query.length + 75)}...`,
        page: this.currentPage
      });
    }

    status.textContent = matchingRecords.length
      ? `${matchingRecords.length} ${I18N.t('searchResults')}`
      : I18N.t('searchNoResults');

    matchingRecords.forEach(record => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-result';
      const type = document.createElement('span');
      type.className = 'search-result-type';
      type.textContent = I18N.t(record.typeKey);
      const title = document.createElement('strong');
      title.textContent = record.title;
      const detail = document.createElement('span');
      detail.textContent = record.detail;
      button.append(type, title, detail);
      button.addEventListener('click', () => {
        if (record.landId) StorageManager.setActiveLandId(record.landId);
        this.navigateTo(record.page);
      });
      resultsContainer.append(button);
    });
  },

  startVoiceSearch(button) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const status = document.getElementById('searchStatus');
    if (!Recognition) {
      status.textContent = I18N.t('searchUnsupported');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = VoiceAlerts.getLanguageTag();
    recognition.continuous = false;
    recognition.interimResults = false;
    button.disabled = true;
    status.textContent = I18N.t('searchListening');
    recognition.onresult = (event) => {
      const input = document.getElementById('siteSearchInput');
      input.value = event.results[0][0].transcript.trim();
      this.searchCurrentPage();
    };
    recognition.onerror = () => {
      status.textContent = I18N.t('searchFailed');
    };
    recognition.onend = () => {
      button.disabled = false;
    };
    try {
      recognition.start();
    } catch (error) {
      button.disabled = false;
      status.textContent = I18N.t('searchFailed');
    }
  },

  navigateTo(pageId) {
    this.currentPage = pageId;

    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-navigate') === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile sidebar if open
    const sidebar = document.querySelector('.app-sidebar');
    if (sidebar) sidebar.classList.remove('open');

    // Switch view
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const activeView = document.getElementById(pageId);
    if (activeView) {
      activeView.classList.add('active');
    }

    this.renderCurrentPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  updateTopBar() {
    // Populate active land dropdown
    const landSelect = document.getElementById('activeLandSelect');
    if (landSelect) {
      const lands = StorageManager.getLands();
      const currentActiveId = StorageManager.getActiveLandId();
      landSelect.innerHTML = lands.map(l => 
        `<option value="${l.id}" ${l.id === currentActiveId ? 'selected' : ''}>${l.name}</option>`
      ).join('');
    }

    this.renderAlertBadge();
  },

  renderAlertBadge() {
    const alerts = StorageManager.getAlerts();
    const unresolvedCount = alerts.filter(a => !a.resolved).length;
    const badge = document.getElementById('activeAlertsCountBadge');
    if (badge) {
      badge.textContent = unresolvedCount;
      badge.style.display = unresolvedCount > 0 ? 'inline-block' : 'none';
    }
  },

  renderCurrentPage() {
    switch (this.currentPage) {
      case 'page-home':
        this.renderHomeDashboard();
        break;
      case 'page-lands':
        this.renderMyLandsPage();
        break;
      case 'page-land-detail':
        this.renderLandDetailPage();
        break;
      case 'page-zones':
        this.renderZoneMonitoringPage();
        break;
      case 'page-irrigation':
        this.renderIrrigationControlPage();
        break;
      case 'page-weather':
        this.renderWeatherPage();
        break;
      case 'page-analytics':
        this.renderAnalyticsPage();
        break;
      case 'page-alerts':
        this.renderAlertsPage();
        break;
      case 'page-recommendations':
        this.renderRecommendationsPage();
        break;
      case 'page-settings':
        this.renderSettingsPage();
        break;
    }
  },

  /**
   * 1. Home Dashboard View
   */
  renderHomeDashboard() {
    const summary = StorageManager.getFarmSummary();

    // Summary KPIs
    document.getElementById('statTotalLands').textContent = summary.totalLands;
    document.getElementById('statTotalZones').textContent = summary.totalZones;
    document.getElementById('statNeedWater').textContent = summary.zonesNeedingWater;
    document.getElementById('statIrrigating').textContent = summary.zonesIrrigating;
    document.getElementById('statWaterToday').textContent = `${summary.waterUsedTodayLitres} L`;
    document.getElementById('statActiveAlerts').textContent = summary.activeAlertsCount;

    const overallStatusEl = document.getElementById('statOverallStatus');
    if (overallStatusEl) {
      if (summary.hasRunoffAlert) {
        overallStatusEl.innerHTML = `<span class="badge badge-danger">⚠️ ${I18N.t('runoffDetected')}</span>`;
      } else if (summary.zonesIrrigating > 0) {
        overallStatusEl.innerHTML = `<span class="badge badge-primary">💧 ${I18N.t('statusIrrigating')} (${summary.zonesIrrigating})</span>`;
      } else if (summary.zonesNeedingWater > 0) {
        overallStatusEl.innerHTML = `<span class="badge badge-warning">⏳ ${I18N.t('statusActionNeeded')} (${summary.zonesNeedingWater})</span>`;
      } else {
        overallStatusEl.innerHTML = `<span class="badge badge-success">✅ ${I18N.t('statusOptimal')}</span>`;
      }
    }

    // Render Land Summary Cards
    const lands = StorageManager.getLands();
    const container = document.getElementById('homeLandCardsContainer');
    if (container) {
      if (lands.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <p>No agricultural lands registered yet.</p>
            <button class="btn btn-primary" onclick="App.openAddLandModal()">${I18N.t('addLandBtn')}</button>
          </div>
        `;
      } else {
        container.innerHTML = lands.map(land => {
          const zones = StorageManager.getZonesByLand(land.id);
          const z1 = zones.find(z => z.zoneNumber === 1) || { currentMoisture: 0, moistureStatus: 'unknown' };
          const z2 = zones.find(z => z.zoneNumber === 2) || { currentMoisture: 0, moistureStatus: 'unknown' };
          const z3 = zones.find(z => z.zoneNumber === 3) || { currentMoisture: 0, moistureStatus: 'unknown' };

          const landAlerts = StorageManager.getAlerts().filter(a => a.landId === land.id && !a.resolved);
          const isIrrigating = zones.some(z => z.valveStatus === 'open');
          const totalWater = zones.reduce((s, z) => s + parseFloat(z.waterConsumedToday || 0), 0);

          return `
            <div class="land-card">
              <div class="land-card-header">
                <div>
                  <h3 class="land-name">${land.name}</h3>
                  <div class="land-subtitle">📍 ${land.location} | 📐 ${land.area} ${I18N.t(land.areaUnit || 'acres')}</div>
                </div>
                <span class="badge ${land.controllerStatus === 'online' ? 'badge-success' : 'badge-danger'}">
                  ${land.controllerStatus === 'online' ? I18N.t('controllerOnline') : I18N.t('controllerOffline')}
                </span>
              </div>

              <div class="land-card-body">
                <div class="crop-info">
                  <strong>${I18N.t('crop')}:</strong> ${land.cropType} | 
                  <strong>${I18N.t('navIrrigation')}:</strong> <span class="badge badge-subtle">${land.irrigationMode === 'auto' ? I18N.t('modeAuto') : I18N.t('modeManual')}</span>
                </div>

                <div class="slope-zones-preview">
                  <div class="slope-zone-chip zone-upper">
                    <span class="zone-chip-label">Z1 Upper</span>
                    <span class="zone-chip-value ${z1.moistureStatus}">${z1.currentMoisture}%</span>
                  </div>
                  <div class="slope-zone-chip zone-middle">
                    <span class="zone-chip-label">Z2 Middle</span>
                    <span class="zone-chip-value ${z2.moistureStatus}">${z2.currentMoisture}%</span>
                  </div>
                  <div class="slope-zone-chip zone-lower">
                    <span class="zone-chip-label">Z3 Lower</span>
                    <span class="zone-chip-value ${z3.moistureStatus}">${z3.currentMoisture}%</span>
                  </div>
                </div>

                <div class="land-stats-row">
                  <div>💧 ${I18N.t('waterUsed')}: <strong>${Math.round(totalWater)} L</strong></div>
                  <div>🚨 ${I18N.t('kpiActiveAlerts')}: <strong class="${landAlerts.length > 0 ? 'text-danger' : 'text-success'}">${landAlerts.length}</strong></div>
                  <div>🚰 Status: <strong>${isIrrigating ? '<span class="text-primary">' + I18N.t('irrRunning') + '</span>' : I18N.t('irrStopped')}</strong></div>
                </div>
              </div>

              <div class="land-card-footer">
                <button class="btn btn-primary btn-sm" onclick="App.openLand('${land.id}')">
                  ${I18N.t('viewDashboard')} →
                </button>
                <button class="btn btn-outline btn-sm" onclick="App.openEditLandModal('${land.id}')">
                  ⚙️ ${I18N.t('editLand')}
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Weather summary on home
    this.renderHomeWeatherWidget();

    // Smart Recommendations summary
    this.renderRecommendationsSummary();

    // Recent alerts summary
    this.renderRecentAlertsWidget();
  },

  async renderHomeWeatherWidget() {
    const activeLand = StorageManager.getLandById(StorageManager.getActiveLandId());
    const container = document.getElementById('homeWeatherWidget');
    if (!container || !activeLand) return;

    const weather = await WeatherService.getForecastForLand(activeLand);
    const desc = WeatherService.getWeatherDescription(weather.current.weatherCode, I18N.currentLang);

    container.innerHTML = `
      <div class="weather-summary-box">
        <div class="weather-now">
          <span class="weather-icon">${desc.icon}</span>
          <div>
            <div class="weather-temp">${weather.current.temp}°C</div>
            <div class="weather-condition">${desc.text} (${activeLand.name})</div>
          </div>
        </div>
        <div class="weather-details-grid">
          <div>🌧️ ${I18N.t('rainProbability')}: <strong>${weather.next24hRainProbMax}%</strong></div>
          <div>💧 ${I18N.t('expectedRain')}: <strong>${weather.next24hRainSum} mm</strong></div>
          <div>💨 Wind: <strong>${weather.current.windSpeed} km/h</strong></div>
          <div>📡 Source: <span class="badge badge-subtle">${weather.status === 'online' ? 'Live API' : 'Fallback'}</span></div>
        </div>
      </div>
    `;
  },

  renderRecentAlertsWidget() {
    const container = document.getElementById('homeRecentAlertsContainer');
    if (!container) return;

    const alerts = StorageManager.getAlerts().slice(0, 4);
    if (alerts.length === 0) {
      container.innerHTML = `<div class="p-3 text-muted">No recent alerts. All sloping lands operating within safe limits.</div>`;
      return;
    }

    container.innerHTML = alerts.map(a => {
      const msg = I18N.currentLang === 'kn' ? (a.messageKn || a.messageEn) : 
                  I18N.currentLang === 'hi' ? (a.messageHi || a.messageEn) : a.messageEn;
      const priorityClass = a.priority === 'critical' ? 'alert-critical' : a.priority === 'warning' ? 'alert-warning' : 'alert-info';
      return `
        <div class="alert-card ${priorityClass}">
          <div class="alert-header">
            <strong>${a.priority.toUpperCase()}</strong>
            <span class="alert-time">${new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="alert-msg">${msg}</div>
        </div>
      `;
    }).join('');
  },

  renderRecommendationsSummary() {
    const container = document.getElementById('homeRecommendationsContainer');
    if (!container) return;

    const recoms = this.generateSmartRecommendations();
    if (recoms.length === 0) {
      container.innerHTML = `<div class="p-3 text-muted">No immediate action needed. Soil moisture across all slope zones is within optimal parameters.</div>`;
      return;
    }

    container.innerHTML = recoms.slice(0, 3).map(r => `
      <div class="recom-card priority-${r.priority}">
        <div class="recom-header">
          <span class="badge ${r.priority === 'high' ? 'badge-danger' : r.priority === 'medium' ? 'badge-warning' : 'badge-subtle'}">
            ${I18N.t(r.priority === 'high' ? 'priorityHigh' : r.priority === 'medium' ? 'priorityMedium' : 'priorityLow')}
          </span>
          <span class="recom-target">🏞️ ${r.landName} ${r.zoneName ? `– ${r.zoneName}` : ''}</span>
        </div>
        <div class="recom-body">
          <div class="recom-reason">${r.reason}</div>
          <div class="recom-action">👉 <strong>${I18N.t('recomAction')}:</strong> ${r.action}</div>
        </div>
      </div>
    `).join('');
  },

  /**
   * 2. My Lands View
   */
  renderMyLandsPage() {
    const lands = StorageManager.getLands();
    const container = document.getElementById('myLandsGrid');
    if (!container) return;

    if (lands.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No registered plantations found</h3>
          <p>Register your first sloping arecanut land to begin monitoring.</p>
          <button class="btn btn-primary" onclick="App.openAddLandModal()">${I18N.t('addLandBtn')}</button>
        </div>
      `;
      return;
    }

    container.innerHTML = lands.map(land => {
      const zones = StorageManager.getZonesByLand(land.id);
      return `
        <div class="card p-4">
          <div class="d-flex justify-between align-center mb-3">
            <div>
              <h2 class="h4 mb-1">${land.name}</h2>
              <p class="text-muted text-sm">📍 ${land.location} | 📐 ${land.area} ${I18N.t(land.areaUnit)} | 🌴 ${land.cropType}</p>
            </div>
            <div class="badge ${land.controllerStatus === 'online' ? 'badge-success' : 'badge-danger'}">
              ${land.controllerId} (${land.controllerStatus})
            </div>
          </div>

          <p class="text-sm mb-3">${land.description || 'Sloping arecanut plantation with 3 calibrated elevation zones.'}</p>

          <div class="zones-table mb-4">
            <table class="table">
              <thead>
                <tr>
                  <th>${I18N.t('navZones')}</th>
                  <th>Position</th>
                  <th>Moisture</th>
                  <th>Status</th>
                  <th>Valve</th>
                  <th>Runoff</th>
                </tr>
              </thead>
              <tbody>
                ${zones.map(z => `
                  <tr>
                    <td><strong>Zone ${z.zoneNumber}</strong></td>
                    <td>${z.slopePosition}</td>
                    <td><strong class="moisture-${z.moistureStatus}">${z.currentMoisture}%</strong></td>
                    <td><span class="badge badge-${z.moistureStatus === 'dry' ? 'warning' : z.moistureStatus === 'wet' ? 'info' : 'success'}">${I18N.t('moisture' + z.moistureStatus.charAt(0).toUpperCase() + z.moistureStatus.slice(1))}</span></td>
                    <td><span class="badge badge-${z.valveStatus === 'open' ? 'primary' : 'subtle'}">${z.valveStatus.toUpperCase()}</span></td>
                    <td><span class="badge badge-${z.runoffStatus === 'detected' ? 'danger' : 'subtle'}">${z.runoffStatus === 'detected' ? '⚠️ DETECTED' : 'None'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="d-flex gap-2 justify-end">
            <button class="btn btn-outline btn-sm" onclick="App.openEditLandModal('${land.id}')">✏️ ${I18N.t('editLand')}</button>
            <button class="btn btn-danger btn-sm" onclick="App.confirmDeleteLand('${land.id}')">🗑️ ${I18N.t('deleteLand')}</button>
            <button class="btn btn-primary btn-sm" onclick="App.openLand('${land.id}')">${I18N.t('viewDashboard')} →</button>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * 3. Land Dashboard View (Specific Land)
   */
  renderLandDetailPage() {
    const activeLandId = StorageManager.getActiveLandId();
    const land = StorageManager.getLandById(activeLandId);
    const container = document.getElementById('landDetailContainer');
    if (!container || !land) return;

    const zones = StorageManager.getZonesByLand(land.id);
    const totalWater = zones.reduce((s, z) => s + parseFloat(z.waterConsumedToday || 0), 0);

    container.innerHTML = `
      <div class="land-detail-header card p-4 mb-4">
        <div class="d-flex justify-between align-center flex-wrap gap-3">
          <div>
            <span class="badge badge-primary mb-1">Land ID: ${land.id}</span>
            <h1 class="h3">${land.name}</h1>
            <p class="text-muted">📍 ${land.location} | 📐 ${land.area} ${I18N.t(land.areaUnit)} | 🌴 ${land.cropType}</p>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-outline" onclick="App.navigateTo('page-irrigation')">🚰 ${I18N.t('navIrrigation')}</button>
            <button class="btn btn-outline" onclick="App.navigateTo('page-weather')">🌤️ ${I18N.t('navWeather')}</button>
            <button class="btn btn-primary" onclick="App.navigateTo('page-zones')">📊 ${I18N.t('navZones')}</button>
          </div>
        </div>
      </div>

      <div class="kpi-grid mb-4">
        <div class="kpi-card">
          <div class="kpi-title">${I18N.t('kpiTotalZones')}</div>
          <div class="kpi-value">${zones.length}</div>
          <div class="kpi-sub">3 Slope Elevation Zones</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">${I18N.t('waterUsed')}</div>
          <div class="kpi-value">${Math.round(totalWater)} L</div>
          <div class="kpi-sub">Today's Consumption</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">ESP8266 Controller</div>
          <div class="kpi-value text-success">${land.controllerStatus.toUpperCase()}</div>
          <div class="kpi-sub">${land.controllerId}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Operation Mode</div>
          <div class="kpi-value">${land.irrigationMode === 'auto' ? 'AUTOMATIC' : 'MANUAL'}</div>
          <div class="kpi-sub">Slope Safety Interlock Active</div>
        </div>
      </div>

      <h3 class="h4 mb-3">Independent 3-Zone Slope Conditions</h3>
      <div class="zones-grid mb-4">
        ${this.renderZoneCardsHtml(zones, land)}
      </div>

      <!-- Demo Test Panel -->
      <div class="card p-3 bg-subtle">
        <div class="d-flex justify-between align-center flex-wrap gap-2">
          <div>
            <strong>🧪 Demo Simulation Controls:</strong> Test how the sloping system responds to extreme hydrological events.
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline" onclick="SimulationEngine.simulateDrySpell('${land.id}')">☀️ Simulate Dry Spell</button>
            <button class="btn btn-sm btn-warning" onclick="SimulationEngine.simulateRunoffEvent('${land.id}')">🌊 Simulate Runoff Event</button>
            <button class="btn btn-sm btn-secondary" onclick="SimulationEngine.resetRunoff('${land.id}')">🔄 Reset Slope</button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 4. Zone Monitoring View
   */
  renderZoneMonitoringPage() {
    const activeLandId = StorageManager.getActiveLandId();
    const land = StorageManager.getLandById(activeLandId);
    const container = document.getElementById('zoneMonitoringCardsContainer');
    if (!container || !land) return;

    const zones = StorageManager.getZonesByLand(land.id);
    container.innerHTML = this.renderZoneCardsHtml(zones, land, true);
  },

  renderZoneCardsHtml(zones, land, fullDetails = false) {
    return zones.map(zone => {
      const isZ1 = zone.zoneNumber === 1;
      const isZ2 = zone.zoneNumber === 2;
      const isZ3 = zone.zoneNumber === 3;

      const slopeClass = isZ1 ? 'slope-upper' : isZ2 ? 'slope-middle' : 'slope-lower';
      const slopeDesc = isZ1 ? I18N.t('upperSlopeDesc') : isZ2 ? I18N.t('middleSlopeDesc') : I18N.t('lowerSlopeDesc');
      const isRunning = zone.valveStatus === 'open';
      const isPaused = zone.irrigationStatus === 'paused';

      return `
        <div class="zone-card ${slopeClass}">
          <div class="zone-card-top">
            <div>
              <span class="zone-number-badge">Zone ${zone.zoneNumber}</span>
              <h3 class="zone-name">${I18N.t(`zone${zone.zoneNumber}Name`)}</h3>
              <p class="zone-slope-role">${slopeDesc}</p>
            </div>
            <div class="zone-valve-badge">
              <span class="badge ${isRunning ? 'badge-primary' : isPaused ? 'badge-warning' : 'badge-subtle'}">
                ${isRunning ? I18N.t('valveOpen') : isPaused ? I18N.t('valvePaused') : I18N.t('valveClosed')}
              </span>
            </div>
          </div>

          <div class="moisture-meter-box">
            <div class="d-flex justify-between align-center mb-1">
              <span>${I18N.t('navIrrigation')} ${I18N.t('percent')}</span>
              <span class="moisture-number ${zone.moistureStatus}">${zone.currentMoisture}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill fill-${zone.moistureStatus}" style="width: ${zone.currentMoisture}%"></div>
            </div>
            <div class="d-flex justify-between text-xs text-muted mt-1">
              <span>Min: ${zone.minMoistureThreshold}%</span>
              <span>Status: <strong class="text-${zone.moistureStatus}">${I18N.t('moisture' + zone.moistureStatus.charAt(0).toUpperCase() + zone.moistureStatus.slice(1))}</strong></span>
              <span>Target: ${zone.targetMoisture}%</span>
            </div>
          </div>

          <div class="zone-details-grid">
            <div class="detail-item">
              <span class="detail-label">Runoff Sensor:</span>
              <span class="detail-val ${zone.runoffStatus === 'detected' ? 'text-danger font-bold' : 'text-success'}">
                ${zone.runoffStatus === 'detected' ? '⚠️ ' + I18N.t('runoffDetected') : '✅ ' + I18N.t('runoffNone')}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Flow Rate:</span>
              <span class="detail-val">${isRunning ? `${zone.flowRateLpm || 24} L/min` : '0 L/min'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Water Today:</span>
              <span class="detail-val">${Math.round(zone.waterConsumedToday || 0)} L</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Sensor Status:</span>
              <span class="detail-val ${zone.sensorStatus === 'online' ? 'text-success' : 'text-danger'}">
                ${zone.sensorStatus === 'online' ? I18N.t('sensorOnline') : I18N.t('sensorOffline')}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Last Reading:</span>
              <span class="detail-val">${zone.lastUpdate || 'Just now'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Duration:</span>
              <span class="detail-val">${zone.currentDurationMinutes || 0} / ${zone.maxDurationMinutes} ${I18N.t('minutes')}</span>
            </div>
          </div>

          <div class="zone-actions-bar">
            ${isRunning ? `
              <button class="btn btn-warning btn-sm" onclick="App.triggerZoneAction('${land.id}', '${zone.id}', 'pause')">⏸️ ${I18N.t('btnPause')}</button>
              <button class="btn btn-danger btn-sm" onclick="App.triggerZoneAction('${land.id}', '${zone.id}', 'stop')">⏹️ ${I18N.t('btnStop')}</button>
            ` : isPaused ? `
              <button class="btn btn-success btn-sm" onclick="App.triggerZoneAction('${land.id}', '${zone.id}', 'resume')">▶️ ${I18N.t('btnResume')}</button>
              <button class="btn btn-danger btn-sm" onclick="App.triggerZoneAction('${land.id}', '${zone.id}', 'stop')">⏹️ ${I18N.t('btnStop')}</button>
            ` : `
              <button class="btn btn-primary btn-sm" onclick="App.triggerZoneAction('${land.id}', '${zone.id}', 'start')">🚿 ${I18N.t('btnStart')}</button>
            `}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * 5. Irrigation Control View
   */
  renderIrrigationControlPage() {
    const activeLandId = StorageManager.getActiveLandId();
    const land = StorageManager.getLandById(activeLandId);
    const container = document.getElementById('irrigationControlContainer');
    if (!container || !land) return;

    const zones = StorageManager.getZonesByLand(land.id);

    container.innerHTML = `
      <div class="card p-4 mb-4">
        <div class="d-flex justify-between align-center flex-wrap gap-2">
          <div>
            <h2 class="h4">${land.name} – ${I18N.t('navIrrigation')}</h2>
            <p class="text-muted">${I18N.t('autoExplanation')}</p>
          </div>
          <div class="d-flex align-center gap-2">
            <label class="font-bold">${I18N.t('modeAuto')}:</label>
            <input type="checkbox" id="landAutoModeToggle" class="switch-input" ${land.irrigationMode === 'auto' ? 'checked' : ''} onchange="App.toggleLandIrrigationMode('${land.id}', this.checked)">
          </div>
        </div>
      </div>

      <div class="row">
        ${zones.map(z => `
          <div class="col-md-4 mb-3">
            <div class="card p-3">
              <h3 class="h5 mb-2">${I18N.t(`zone${z.zoneNumber}Name`)}</h3>
              <p class="text-xs text-muted mb-3">${z.slopePosition}</p>

              <div class="mb-3">
                <label class="text-sm font-semibold">${I18N.t('thresholdMin')}: <span id="val_min_${z.id}">${z.minMoistureThreshold}%</span></label>
                <input type="range" class="form-range" min="15" max="50" value="${z.minMoistureThreshold}" oninput="document.getElementById('val_min_${z.id}').textContent = this.value + '%'" onchange="App.updateZoneThreshold('${z.id}', 'minMoistureThreshold', this.value)">
              </div>

              <div class="mb-3">
                <label class="text-sm font-semibold">${I18N.t('thresholdTarget')}: <span id="val_target_${z.id}">${z.targetMoisture}%</span></label>
                <input type="range" class="form-range" min="50" max="85" value="${z.targetMoisture}" oninput="document.getElementById('val_target_${z.id}').textContent = this.value + '%'" onchange="App.updateZoneThreshold('${z.id}', 'targetMoisture', this.value)">
              </div>

              <div class="mb-3">
                <label class="text-sm font-semibold">${I18N.t('maxDuration')}: <span id="val_dur_${z.id}">${z.maxDurationMinutes} ${I18N.t('minutes')}</span></label>
                <input type="range" class="form-range" min="15" max="90" step="5" value="${z.maxDurationMinutes}" oninput="document.getElementById('val_dur_${z.id}').textContent = this.value + ' mins'" onchange="App.updateZoneThreshold('${z.id}', 'maxDurationMinutes', this.value)">
              </div>

              <div class="valve-status-indicator p-2 text-center rounded mb-3 ${z.valveStatus === 'open' ? 'bg-primary-subtle text-primary font-bold' : 'bg-subtle'}">
                Valve: ${z.valveStatus.toUpperCase()} (${z.currentMoisture}% Moisture)
              </div>

              <div class="d-flex gap-2">
                ${z.valveStatus === 'open' ? `
                  <button class="btn btn-danger w-100" onclick="App.triggerZoneAction('${land.id}', '${z.id}', 'stop')">⏹️ ${I18N.t('btnStop')}</button>
                ` : `
                  <button class="btn btn-primary w-100" onclick="App.triggerZoneAction('${land.id}', '${z.id}', 'start')">🚿 ${I18N.t('btnStart')}</button>
                `}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * 6. Weather Page View
   */
  async renderWeatherPage() {
    const activeLandId = StorageManager.getActiveLandId();
    const land = StorageManager.getLandById(activeLandId);
    const container = document.getElementById('weatherPageContainer');
    if (!container || !land) return;

    container.innerHTML = `<div class="p-4 text-center">Fetching live meteorological data from Open-Meteo for ${land.name} (${land.latitude}, ${land.longitude})...</div>`;

    const weather = await WeatherService.getForecastForLand(land);
    const rainAdvice = WeatherService.shouldDelayIrrigationForRain(weather);
    const desc = WeatherService.getWeatherDescription(weather.current.weatherCode, I18N.currentLang);

    container.innerHTML = `
      <div class="card p-4 mb-4">
        <div class="d-flex justify-between align-center flex-wrap gap-2">
          <div>
            <h2 class="h3">${I18N.t('weatherTitle')}</h2>
            <p class="text-muted">📍 ${land.name} | Lat: ${weather.latitude.toFixed(3)}, Lon: ${weather.longitude.toFixed(3)}</p>
          </div>
          <span class="badge ${weather.status === 'online' ? 'badge-success' : 'badge-subtle'}">
            ${weather.source}
          </span>
        </div>
      </div>

      ${rainAdvice.delay ? `
        <div class="alert alert-warning mb-4">
          <div class="alert-title">🌧️ ${I18N.t('forecastSummary')}: Rain Delay Advised</div>
          <p>${I18N.currentLang === 'kn' ? rainAdvice.reasonKn : I18N.currentLang === 'hi' ? rainAdvice.reasonHi : rainAdvice.reasonEn}</p>
        </div>
      ` : `
        <div class="alert alert-info mb-4">
          <div class="alert-title">☀️ Weather Conditions Favorable</div>
          <p>${I18N.t('noRainAdvice')}</p>
        </div>
      `}

      <div class="row mb-4">
        <div class="col-md-6 mb-3">
          <div class="card p-4">
            <h3 class="h5 mb-3">Current Conditions</h3>
            <div class="d-flex align-center gap-4">
              <span style="font-size: 3.5rem;">${desc.icon}</span>
              <div>
                <div class="h2 mb-0">${weather.current.temp}°C</div>
                <div class="text-muted">${desc.text}</div>
                <div class="text-sm mt-1">Humidity: <strong>${weather.current.humidity}%</strong> | Wind: <strong>${weather.current.windSpeed} km/h</strong></div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <div class="card p-4">
            <h3 class="h5 mb-3">24-Hour Precipitation Outlook</h3>
            <div class="kpi-grid">
              <div class="kpi-card p-3">
                <div class="kpi-title">${I18N.t('rainProbability')}</div>
                <div class="kpi-value text-primary">${weather.next24hRainProbMax}%</div>
              </div>
              <div class="kpi-card p-3">
                <div class="kpi-title">${I18N.t('expectedRain')}</div>
                <div class="kpi-value text-primary">${weather.next24hRainSum} mm</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <h3 class="h5 mb-3">5-Day Agricultural Forecast</h3>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Condition</th>
                <th>Temp Max / Min</th>
                <th>Rain Probability</th>
                <th>Precipitation (mm)</th>
              </tr>
            </thead>
            <tbody>
              ${weather.daily.map(d => {
                const dayDesc = WeatherService.getWeatherDescription(d.weatherCode, I18N.currentLang);
                return `
                  <tr>
                    <td><strong>${d.dayName}</strong> <span class="text-xs text-muted">(${d.date})</span></td>
                    <td>${dayDesc.icon} ${dayDesc.text}</td>
                    <td>${d.maxTemp}°C / ${d.minTemp}°C</td>
                    <td><strong>${d.precipProb}%</strong></td>
                    <td>${d.precipSum} mm</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /**
   * 7. Analytics View
   */
  renderAnalyticsPage() {
    setTimeout(() => {
      AnalyticsEngine.renderAllCharts();
    }, 50);

    const logs = StorageManager.getIrrigationLogs();
    const tableBody = document.getElementById('analyticsLogsTableBody');
    if (tableBody) {
      if (logs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No irrigation events logged yet.</td></tr>`;
      } else {
        tableBody.innerHTML = logs.slice(0, 15).map(l => {
          const land = StorageManager.getLandById(l.landId);
          const zone = StorageManager.getZoneById(l.zoneId);
          return `
            <tr>
              <td><code>${l.id}</code></td>
              <td>${land ? land.name : l.landId}</td>
              <td>${zone ? zone.name : l.zoneId}</td>
              <td>${l.startTime}</td>
              <td>${l.durationMinutes} mins</td>
              <td>${l.waterUsedLitres} L</td>
              <td><span class="badge badge-success">${l.status}</span></td>
            </tr>
          `;
        }).join('');
      }
    }
  },

  /**
   * 8. Alerts Page View
   */
  renderAlertsPage() {
    const alerts = StorageManager.getAlerts();
    const container = document.getElementById('alertsListContainer');
    if (!container) return;

    if (alerts.length === 0) {
      container.innerHTML = `<div class="p-4 text-center text-muted">No alerts or warnings recorded.</div>`;
      return;
    }

    container.innerHTML = alerts.map(a => {
      const msg = I18N.currentLang === 'kn' ? (a.messageKn || a.messageEn) : 
                  I18N.currentLang === 'hi' ? (a.messageHi || a.messageEn) : a.messageEn;
      const isCritical = a.priority === 'critical';
      const isWarning = a.priority === 'warning';
      const land = StorageManager.getLandById(a.landId);

      return `
        <div class="card p-3 mb-2 border-left-${isCritical ? 'danger' : isWarning ? 'warning' : 'primary'} ${a.resolved ? 'opacity-75' : ''}">
          <div class="d-flex justify-between align-center">
            <div>
              <span class="badge badge-${isCritical ? 'danger' : isWarning ? 'warning' : 'subtle'} mr-2">${a.priority.toUpperCase()}</span>
              <strong>${land ? land.name : a.landId}</strong> – <span class="text-xs text-muted">${new Date(a.timestamp).toLocaleString()}</span>
            </div>
            <div>
              ${a.resolved ? `
                <span class="badge badge-success">✅ ${I18N.t('statusResolved')}</span>
              ` : `
                <button class="btn btn-sm btn-outline" onclick="App.resolveAlert('${a.id}')">✓ ${I18N.t('resolveBtn')}</button>
              `}
            </div>
          </div>
          <p class="mt-2 mb-0">${msg}</p>
        </div>
      `;
    }).join('');
  },

  /**
   * 9. Recommendations View
   */
  renderRecommendationsPage() {
    const container = document.getElementById('recommendationsPageList');
    if (!container) return;

    const recoms = this.generateSmartRecommendations();
    if (recoms.length === 0) {
      container.innerHTML = `
        <div class="card p-4 text-center text-muted">
          All sloping plantations are in balanced equilibrium. No immediate adjustments suggested.
        </div>
      `;
      return;
    }

    container.innerHTML = recoms.map(r => `
      <div class="card p-4 mb-3 border-left-${r.priority === 'high' ? 'danger' : r.priority === 'medium' ? 'warning' : 'primary'}">
        <div class="d-flex justify-between align-center mb-2">
          <span class="badge badge-${r.priority === 'high' ? 'danger' : r.priority === 'medium' ? 'warning' : 'subtle'}">
            ${I18N.t(r.priority === 'high' ? 'priorityHigh' : r.priority === 'medium' ? 'priorityMedium' : 'priorityLow')}
          </span>
          <span class="text-sm text-muted">Target: <strong>${r.landName}</strong> (${r.zoneName || 'All Slopes'})</span>
        </div>
        <p class="mb-2"><strong>${r.reason}</strong></p>
        <div class="p-2 bg-subtle rounded">
          👉 <strong>${I18N.t('recomAction')}:</strong> ${r.action}
        </div>
      </div>
    `).join('');
  },

  /**
   * Generates real-time rule-based recommendations
   */
  generateSmartRecommendations() {
    const recommendations = [];
    const lands = StorageManager.getLands();

    lands.forEach(land => {
      const zones = StorageManager.getZonesByLand(land.id);
      const z1 = zones.find(z => z.zoneNumber === 1);
      const z2 = zones.find(z => z.zoneNumber === 2);
      const z3 = zones.find(z => z.zoneNumber === 3);

      // Rule 1: Upper slope dry but lower slope wet -> gravity disparity
      if (z1 && z3 && z1.currentMoisture < 28 && z3.currentMoisture > 65) {
        recommendations.push({
          landName: land.name,
          zoneName: z1.name,
          priority: 'high',
          reason: I18N.currentLang === 'kn' ? 
            `${land.name}: ಮೇಲ್ಭಾಗದ ಇಳಿಜಾರಿನಲ್ಲಿ ತೇವಾಂಶ 28% ಕ್ಕಿಂತ ಕಡಿಮೆಯಿದೆ ಆದರೆ ಕೆಳಭಾಗದಲ್ಲಿ ನೀರು ಸಂಗ್ರಹವಾಗಿದೆ.` :
            I18N.currentLang === 'hi' ?
            `${land.name}: ऊपरी ढलान पर नमी 28% से कम है जबकि निचली ढलान पर पानी जमा है।` :
            `${land.name}: Upper Slope moisture is below 28% while Lower Slope has accumulated downhill drainage.`,
          action: I18N.currentLang === 'kn' ?
            `ಕೇವಲ ವಲಯ 1 (ಮೇಲ್ಭಾಗ) ಕ್ಕೆ ಮಾತ್ರ ಡ್ರಿಪ್ ನೀರಾವರಿ ನೀಡಿ; ಕೆಳಭಾಗದ ವಲಯ 3 ನ್ನು ಆಫ್ ಮಾಡಿ.` :
            I18N.currentLang === 'hi' ?
            `केवल ज़ोन 1 (ऊपरी ढलान) में ड्रिप सिंचाई चलाएं; ज़ोन 3 को बंद रखें।` :
            `Irrigate Zone 1 (Upper Slope) independently; keep Zone 3 closed to prevent excessive pooling.`
        });
      }

      // Rule 2: Runoff detected on lower slope
      if (z3 && z3.runoffStatus === 'detected') {
        recommendations.push({
          landName: land.name,
          zoneName: z3.name,
          priority: 'high',
          reason: I18N.currentLang === 'kn' ?
            `${land.name} ಕೆಳಭಾಗದಲ್ಲಿ ನೀರು ಹರಿದುಹೋಗುವಿಕೆ ಪತ್ತೆಯಾಗಿದೆ. ಮಣ್ಣಿನ ಸವೆತದ ಅಪಾಯವಿದೆ.` :
            I18N.currentLang === 'hi' ?
            `${land.name} की निचली ढलान पर बहाव देखा गया है। कटाव का खतरा है।` :
            `Runoff detected downhill in ${land.name}. Risk of topsoil and fertilizer erosion.`,
          action: I18N.currentLang === 'kn' ?
            `ತಕ್ಷಣ ಮೇಲ್ಭಾಗದ ಕಾಲುವೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ನೀರಾವರಿ ವಿರಾಮಗೊಳಿಸಿ.` :
            I18N.currentLang === 'hi' ?
            `तत्काल सिंचाई रोकें और जल निकास नालियों की जांच करें।` :
            `Pause all uphill valves and check contour trenches and drainage channels.`
        });
      }

      // Rule 3: Middle slope balanced
      if (z2 && z2.moistureStatus === 'normal') {
        recommendations.push({
          landName: land.name,
          zoneName: z2.name,
          priority: 'low',
          reason: `${land.name} Zone 2 (Middle Slope) moisture is optimal (approx. ${z2.currentMoisture}%).`,
          action: `Maintain current schedule. No valve action required.`
        });
      }
    });

    return recommendations;
  },

  /**
   * 10. Settings View
   */
  renderSettingsPage() {
    const settings = StorageManager.getSettings();
    const voiceSwitch = document.getElementById('settingsVoiceToggle');
    if (voiceSwitch) voiceSwitch.checked = VoiceAlerts.enabled;
  },

  // Interactive Action Triggers
  async triggerZoneAction(landId, zoneId, action) {
    const res = await ApiClient.sendIrrigationCommand({
      landId,
      zoneId,
      action,
      reason: `Manual farmer action: ${action}`
    });

    if (res.success) {
      this.renderCurrentPage();
    }
  },

  updateZoneThreshold(zoneId, key, value) {
    const zone = StorageManager.getZoneById(zoneId);
    if (zone) {
      zone[key] = parseFloat(value);
      StorageManager.saveZone(zone);
    }
  },

  toggleLandIrrigationMode(landId, isAuto) {
    StorageManager.updateLand(landId, { irrigationMode: isAuto ? 'auto' : 'manual' });
    this.renderCurrentPage();
  },

  resolveAlert(alertId) {
    StorageManager.resolveAlert(alertId);
    this.renderAlertBadge();
    this.renderCurrentPage();
  },

  openLand(landId) {
    StorageManager.setActiveLandId(landId);
    this.navigateTo('page-land-detail');
  },

  // Modal Handlers
  openAddLandModal() {
    const modal = document.getElementById('addLandModal');
    if (modal) modal.classList.add('show');
  },

  closeAddLandModal() {
    const modal = document.getElementById('addLandModal');
    if (modal) modal.classList.remove('show');
  },

  handleAddLandSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.landName.value.trim();
    const location = form.landLocation.value.trim();
    const area = parseFloat(form.landArea.value) || 1;
    const areaUnit = form.landAreaUnit.value;
    const cropType = form.landCropType.value;
    const latitude = parseFloat(form.landLat.value) || 13.693;
    const longitude = parseFloat(form.landLon.value) || 75.244;
    const controllerId = form.landControllerId.value.trim() || `ESP8266_${Math.floor(1000 + Math.random() * 9000)}`;
    const description = form.landDesc.value.trim();

    if (!name) return;

    const newLand = StorageManager.addLand({
      name,
      location,
      area,
      areaUnit,
      cropType,
      latitude,
      longitude,
      controllerId,
      description
    });

    StorageManager.setActiveLandId(newLand.id);
    this.closeAddLandModal();
    form.reset();
    this.navigateTo('page-land-detail');
  },

  openEditLandModal(landId) {
    const land = StorageManager.getLandById(landId);
    if (!land) return;

    const modal = document.getElementById('editLandModal');
    if (modal) {
      modal.setAttribute('data-land-id', landId);
      document.getElementById('editLandName').value = land.name;
      document.getElementById('editLandLocation').value = land.location;
      document.getElementById('editLandArea').value = land.area;
      document.getElementById('editLandAreaUnit').value = land.areaUnit || 'acres';
      document.getElementById('editLandCropType').value = land.cropType;
      document.getElementById('editLandControllerId').value = land.controllerId;
      document.getElementById('editLandDesc').value = land.description || '';
      modal.classList.add('show');
    }
  },

  closeEditLandModal() {
    const modal = document.getElementById('editLandModal');
    if (modal) modal.classList.remove('show');
  },

  handleEditLandSubmit(e) {
    e.preventDefault();
    const modal = document.getElementById('editLandModal');
    const landId = modal.getAttribute('data-land-id');
    if (!landId) return;

    StorageManager.updateLand(landId, {
      name: document.getElementById('editLandName').value.trim(),
      location: document.getElementById('editLandLocation').value.trim(),
      area: parseFloat(document.getElementById('editLandArea').value) || 1,
      areaUnit: document.getElementById('editLandAreaUnit').value,
      cropType: document.getElementById('editLandCropType').value,
      controllerId: document.getElementById('editLandControllerId').value.trim(),
      description: document.getElementById('editLandDesc').value.trim()
    });

    this.closeEditLandModal();
    this.renderCurrentPage();
  },

  confirmDeleteLand(landId) {
    const land = StorageManager.getLandById(landId);
    if (!land) return;

    const confirmed = confirm(I18N.t('confirmDeleteLand') + `\n\nLand: ${land.name}`);
    if (confirmed) {
      StorageManager.deleteLand(landId);
      this.navigateTo('page-lands');
    }
  },

  updateRealtimeBadges() {
    // If on home or zone monitoring page, dynamically refresh zone moisture numbers without disrupting inputs
    if (this.currentPage === 'page-home') {
      const summary = StorageManager.getFarmSummary();
      const irrigatingEl = document.getElementById('statIrrigating');
      if (irrigatingEl) irrigatingEl.textContent = summary.zonesIrrigating;
      const waterEl = document.getElementById('statWaterToday');
      if (waterEl) waterEl.textContent = `${summary.waterUsedTodayLitres} L`;
    } else if (this.currentPage === 'page-zones' || this.currentPage === 'page-land-detail') {
      const activeLandId = StorageManager.getActiveLandId();
      const zones = StorageManager.getZonesByLand(activeLandId);
      zones.forEach(z => {
        const moistureEl = document.querySelector(`.zone-card:nth-child(${z.zoneNumber}) .moisture-number`);
        if (moistureEl) {
          moistureEl.textContent = `${z.currentMoisture}%`;
          moistureEl.className = `moisture-number ${z.moistureStatus}`;
        }
        const fillEl = document.querySelector(`.zone-card:nth-child(${z.zoneNumber}) .progress-bar-fill`);
        if (fillEl) {
          fillEl.style.width = `${z.currentMoisture}%`;
          fillEl.className = `progress-bar-fill fill-${z.moistureStatus}`;
        }
      });
    }
  }
};

// Global startup
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
