/**
 * SmartFarm Storage Manager & Data Model
 * Handles persistent storage (LocalStorage with backend REST sync),
 * multi-land management, automatic 3-zone slope provisioning, and event logs.
 */

const StorageManager = {
  KEYS: {
    LANDS: 'smartfarm_lands_v1',
    ZONES: 'smartfarm_zones_v1',
    ALERTS: 'smartfarm_alerts_v1',
    IRRIGATION_LOGS: 'smartfarm_irrigation_logs_v1',
    SETTINGS: 'smartfarm_settings_v1',
    ACTIVE_LAND_ID: 'smartfarm_active_land_id_v1'
  },

  isDemoMode() {
    const settings = this.getSettings();
    return settings.demoMode !== false; // defaults to true
  },

  getSettings() {
    try {
      const raw = localStorage.getItem(this.KEYS.SETTINGS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      demoMode: true,
      voiceEnabled: true,
      language: 'en',
      apiUrl: 'http://localhost:3000/api',
      defaultMinMoisture: 30,
      defaultTargetMoisture: 65,
      defaultMaxDuration: 40,
      refreshRateSec: 4
    };
  },

  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {}
    return updated;
  },

  getActiveLandId() {
    try {
      const saved = localStorage.getItem(this.KEYS.ACTIVE_LAND_ID);
      if (saved) return saved;
    } catch (e) {}
    const lands = this.getLands();
    return lands.length > 0 ? lands[0].id : null;
  },

  setActiveLandId(id) {
    try {
      localStorage.setItem(this.KEYS.ACTIVE_LAND_ID, id);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('activeLandChanged', { detail: { landId: id } }));
  },

  /**
   * Initialize default seed lands and zones if first time loading
   */
  init() {
    const existing = this.getLands();
    if (!existing || existing.length === 0) {
      this.seedDefaultData();
    }
  },

  seedDefaultData() {
    const initialLands = [
      {
        id: "land_malnad_01",
        name: "Devi Mane Arecanut Grove",
        location: "Thirthahalli, Karnataka",
        area: 2.5,
        areaUnit: "acres",
        cropType: "Arecanut + Pepper",
        latitude: 13.693,
        longitude: 75.244,
        controllerId: "ESP32_MALNAD_01",
        controllerStatus: "online",
        irrigationMode: "auto",
        description: "Steep terraced arecanut plantation with black pepper vines on arecanut palms.",
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        id: "land_sringeri_02",
        name: "Hill Crest Plantation",
        location: "Sringeri, Chikkamagaluru",
        area: 4.0,
        areaUnit: "acres",
        cropType: "Arecanut",
        latitude: 13.421,
        longitude: 75.253,
        controllerId: "ESP32_SRINGERI_02",
        controllerStatus: "online",
        irrigationMode: "manual",
        description: "East-facing slope arecanut orchard with gravity sprinkler lines.",
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
      },
      {
        id: "land_koppa_03",
        name: "Stream Side Arecanut Farm",
        location: "Koppa, Karnataka",
        area: 1.8,
        areaUnit: "acres",
        cropType: "Arecanut + Cocoa",
        latitude: 13.532,
        longitude: 75.361,
        controllerId: "ESP32_KOPPA_03",
        controllerStatus: "online",
        irrigationMode: "auto",
        description: "Lower valley gradient plantation prone to runoff and seasonal drainage wash.",
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      }
    ];

    try {
      localStorage.setItem(this.KEYS.LANDS, JSON.stringify(initialLands));
    } catch (e) {}

    // Provision 3 slope zones for each land
    const initialZones = [];
    initialLands.forEach(land => {
      initialZones.push(...this.generateThreeZones(land.id));
    });

    try {
      localStorage.setItem(this.KEYS.ZONES, JSON.stringify(initialZones));
    } catch (e) {}

    // Seed sample alerts
    const initialAlerts = [
      {
        id: "alert_01",
        landId: "land_malnad_01",
        zoneId: "zone_land_malnad_01_1",
        type: "low_moisture",
        priority: "warning",
        messageEn: "Devi Mane Grove: Upper Slope moisture low (24%). Irrigation recommended.",
        messageKn: "ದೇವಿ ಮನೆ ತೋಟ: ಮೇಲ್ಭಾಗದ ಇಳಿಜಾರಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ (24%). ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ.",
        messageHi: "देवी मने बागान: ऊपरी ढलान की नमी कम है (24%)। सिंचाई की सिफारिश की जाती है।",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        isRead: false,
        resolved: false
      },
      {
        id: "alert_02",
        landId: "land_koppa_03",
        zoneId: "zone_land_koppa_03_3",
        type: "runoff_warning",
        priority: "medium",
        messageEn: "Stream Side Farm: Lower Slope moisture at 74%. Gravity percolation active.",
        messageKn: "ಹೊಳೆ ಬದಿ ತೋಟ: ಕೆಳಭಾಗದ ಇಳಿಜಾರಿನ ತೇವಾಂಶ 74% ತಲುಪಿದೆ. ನೀರು ಶೇಖರಣೆಯಾಗುತ್ತಿದೆ.",
        messageHi: "नहर किनारा खेत: निचली ढलान पर 74% नमी। ढलान जल संचयन सक्रिय।",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        isRead: true,
        resolved: true
      }
    ];

    try {
      localStorage.setItem(this.KEYS.ALERTS, JSON.stringify(initialAlerts));
    } catch (e) {}

    // Seed sample irrigation logs
    const initialLogs = [
      {
        id: "log_101",
        landId: "land_malnad_01",
        zoneId: "zone_land_malnad_01_1",
        startTime: new Date(Date.now() - 86400000 * 1).toLocaleTimeString(),
        stopTime: new Date(Date.now() - 86400000 * 1 + 2400000).toLocaleTimeString(),
        durationMinutes: 40,
        waterUsedLitres: 960,
        mode: "auto",
        reasonStart: "Moisture < 30%",
        reasonStop: "Target 65% reached",
        status: "confirmed"
      },
      {
        id: "log_102",
        landId: "land_sringeri_02",
        zoneId: "zone_land_sringeri_02_2",
        startTime: new Date(Date.now() - 86400000 * 2).toLocaleTimeString(),
        stopTime: new Date(Date.now() - 86400000 * 2 + 1800000).toLocaleTimeString(),
        durationMinutes: 30,
        waterUsedLitres: 720,
        mode: "manual",
        reasonStart: "Manual operator request",
        reasonStop: "Manual stop",
        status: "confirmed"
      }
    ];

    try {
      localStorage.setItem(this.KEYS.IRRIGATION_LOGS, JSON.stringify(initialLogs));
    } catch (e) {}
  },

  /**
   * Generates the 3 mandatory independent slope zones for a land
   */
  generateThreeZones(landId) {
    return [
      {
        id: `zone_${landId}_1`,
        landId: landId,
        zoneNumber: 1,
        name: "Zone 1 – Upper Slope",
        slopePosition: "Upper Slope",
        minMoistureThreshold: 30,
        targetMoisture: 65,
        maxDurationMinutes: 45,
        currentMoisture: 28.5,
        moistureStatus: "dry",
        valveStatus: "closed",
        irrigationStatus: "stopped",
        runoffStatus: "none",
        sensorStatus: "online",
        flowRateLpm: 24,
        waterConsumedToday: 180,
        currentDurationMinutes: 0,
        lastUpdate: new Date().toLocaleTimeString()
      },
      {
        id: `zone_${landId}_2`,
        landId: landId,
        zoneNumber: 2,
        name: "Zone 2 – Middle Slope",
        slopePosition: "Middle Slope",
        minMoistureThreshold: 30,
        targetMoisture: 65,
        maxDurationMinutes: 45,
        currentMoisture: 48.0,
        moistureStatus: "normal",
        valveStatus: "closed",
        irrigationStatus: "stopped",
        runoffStatus: "none",
        sensorStatus: "online",
        flowRateLpm: 24,
        waterConsumedToday: 120,
        currentDurationMinutes: 0,
        lastUpdate: new Date().toLocaleTimeString()
      },
      {
        id: `zone_${landId}_3`,
        landId: landId,
        zoneNumber: 3,
        name: "Zone 3 – Lower Slope",
        slopePosition: "Lower Slope",
        minMoistureThreshold: 28,
        targetMoisture: 60,
        maxDurationMinutes: 35,
        currentMoisture: 62.5,
        moistureStatus: "normal",
        valveStatus: "closed",
        irrigationStatus: "stopped",
        runoffStatus: "none",
        sensorStatus: "online",
        flowRateLpm: 24,
        waterConsumedToday: 60,
        currentDurationMinutes: 0,
        lastUpdate: new Date().toLocaleTimeString()
      }
    ];
  },

  // Lands CRUD
  getLands() {
    try {
      const raw = localStorage.getItem(this.KEYS.LANDS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  getLandById(id) {
    const lands = this.getLands();
    return lands.find(l => l.id === id) || null;
  },

  addLand(landData) {
    const lands = this.getLands();
    const newId = `land_${Date.now()}`;
    const newLand = {
      id: newId,
      name: landData.name || "New Arecanut Plantation",
      location: landData.location || "Karnataka, India",
      area: parseFloat(landData.area) || 1.0,
      areaUnit: landData.areaUnit || "acres",
      cropType: landData.cropType || "Arecanut",
      latitude: parseFloat(landData.latitude) || 13.693,
      longitude: parseFloat(landData.longitude) || 75.244,
      controllerId: landData.controllerId || `ESP32_${Math.floor(1000 + Math.random() * 9000)}`,
      controllerStatus: "online",
      irrigationMode: landData.irrigationMode || "auto",
      description: landData.description || "",
      createdAt: new Date().toISOString()
    };

    lands.push(newLand);
    localStorage.setItem(this.KEYS.LANDS, JSON.stringify(lands));

    // Automatically create Zone 1, Zone 2, and Zone 3
    const zones = this.getZones();
    const newZones = this.generateThreeZones(newId);
    zones.push(...newZones);
    localStorage.setItem(this.KEYS.ZONES, JSON.stringify(zones));

    // Notify listeners
    window.dispatchEvent(new CustomEvent('landsUpdated'));
    return newLand;
  },

  updateLand(id, updateData) {
    const lands = this.getLands();
    const idx = lands.findIndex(l => l.id === id);
    if (idx !== -1) {
      lands[idx] = { ...lands[idx], ...updateData };
      localStorage.setItem(this.KEYS.LANDS, JSON.stringify(lands));
      window.dispatchEvent(new CustomEvent('landsUpdated'));
      return lands[idx];
    }
    return null;
  },

  deleteLand(id) {
    let lands = this.getLands();
    lands = lands.filter(l => l.id !== id);
    localStorage.setItem(this.KEYS.LANDS, JSON.stringify(lands));

    // Delete associated zones
    let zones = this.getZones();
    zones = zones.filter(z => z.landId !== id);
    localStorage.setItem(this.KEYS.ZONES, JSON.stringify(zones));

    // Delete associated alerts
    let alerts = this.getAlerts();
    alerts = alerts.filter(a => a.landId !== id);
    localStorage.setItem(this.KEYS.ALERTS, JSON.stringify(alerts));

    // If active land was deleted, switch to another land
    if (this.getActiveLandId() === id) {
      this.setActiveLandId(lands.length > 0 ? lands[0].id : null);
    }

    window.dispatchEvent(new CustomEvent('landsUpdated'));
    return true;
  },

  // Zones CRUD
  getZones() {
    try {
      const raw = localStorage.getItem(this.KEYS.ZONES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  getZonesByLand(landId) {
    const zones = this.getZones();
    return zones.filter(z => z.landId === landId).sort((a, b) => a.zoneNumber - b.zoneNumber);
  },

  getZoneById(zoneId) {
    const zones = this.getZones();
    return zones.find(z => z.id === zoneId) || null;
  },

  saveZone(zone) {
    const zones = this.getZones();
    const idx = zones.findIndex(z => z.id === zone.id);
    if (idx !== -1) {
      zones[idx] = zone;
      localStorage.setItem(this.KEYS.ZONES, JSON.stringify(zones));
      return zone;
    }
    return null;
  },

  // Alerts CRUD
  getAlerts() {
    try {
      const raw = localStorage.getItem(this.KEYS.ALERTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  addAlert(alertData) {
    const alerts = this.getAlerts();
    const newAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      landId: alertData.landId,
      zoneId: alertData.zoneId || null,
      type: alertData.type || 'info',
      priority: alertData.priority || 'medium',
      messageEn: alertData.messageEn || alertData.message || '',
      messageKn: alertData.messageKn || '',
      messageHi: alertData.messageHi || '',
      timestamp: new Date().toISOString(),
      isRead: false,
      resolved: false
    };

    alerts.unshift(newAlert);
    // Keep max 100 alerts
    if (alerts.length > 100) alerts.length = 100;

    localStorage.setItem(this.KEYS.ALERTS, JSON.stringify(alerts));
    window.dispatchEvent(new CustomEvent('alertsUpdated'));
    return newAlert;
  },

  resolveAlert(alertId) {
    const alerts = this.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      localStorage.setItem(this.KEYS.ALERTS, JSON.stringify(alerts));
      window.dispatchEvent(new CustomEvent('alertsUpdated'));
    }
  },

  markAllAlertsRead() {
    const alerts = this.getAlerts();
    alerts.forEach(a => { a.isRead = true; });
    localStorage.setItem(this.KEYS.ALERTS, JSON.stringify(alerts));
    window.dispatchEvent(new CustomEvent('alertsUpdated'));
  },

  // Irrigation records & analytics
  getIrrigationLogs() {
    try {
      const raw = localStorage.getItem(this.KEYS.IRRIGATION_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  recordIrrigationEvent(eventData) {
    const logs = this.getIrrigationLogs();
    const newLog = {
      id: `log_${Date.now()}`,
      landId: eventData.landId,
      zoneId: eventData.zoneId,
      startTime: eventData.startTime || new Date().toLocaleTimeString(),
      stopTime: eventData.stopTime || new Date().toLocaleTimeString(),
      durationMinutes: eventData.durationMinutes || 0,
      waterUsedLitres: eventData.waterUsedLitres || 0,
      mode: eventData.mode || 'auto',
      reasonStart: eventData.reasonStart || eventData.reason || 'Normal cycle',
      reasonStop: eventData.reasonStop || 'Complete',
      status: 'confirmed'
    };
    logs.unshift(newLog);
    if (logs.length > 150) logs.length = 150;
    localStorage.setItem(this.KEYS.IRRIGATION_LOGS, JSON.stringify(logs));
    return newLog;
  },

  // Aggregated Farm Calculations
  getFarmSummary() {
    const lands = this.getLands();
    const zones = this.getZones();
    const alerts = this.getAlerts();

    let totalWaterToday = 0;
    let needingWaterCount = 0;
    let currentlyIrrigatingCount = 0;

    zones.forEach(z => {
      totalWaterToday += parseFloat(z.waterConsumedToday || 0);
      if (z.moistureStatus === 'dry' || z.currentMoisture < z.minMoistureThreshold) {
        needingWaterCount++;
      }
      if (z.valveStatus === 'open' && z.irrigationStatus === 'running') {
        currentlyIrrigatingCount++;
      }
    });

    const activeAlertsCount = alerts.filter(a => !a.resolved).length;

    return {
      totalLands: lands.length,
      totalZones: zones.length,
      zonesNeedingWater: needingWaterCount,
      zonesIrrigating: currentlyIrrigatingCount,
      waterUsedTodayLitres: Math.round(totalWaterToday),
      activeAlertsCount: activeAlertsCount,
      hasRunoffAlert: alerts.some(a => !a.resolved && a.type === 'runoff_detected')
    };
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  StorageManager.init();
}
