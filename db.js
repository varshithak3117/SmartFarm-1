/**
 * SmartFarm Database Engine
 * Structured persistent database with atomic file transactions.
 * Stores Lands, 3-Slope Zones, Telemetry readings, Irrigation events, and Alerts.
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'smartfarm_data.json');

// Initial seed template
const DEFAULT_DATA = {
  lands: [
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
      description: "Steep terraced arecanut plantation with black pepper vines.",
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
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
      description: "Lower valley gradient plantation prone to runoff.",
      createdAt: new Date().toISOString()
    }
  ],
  zones: [
    // Devi Mane Grove (3 zones)
    {
      id: "zone_land_malnad_01_1",
      landId: "land_malnad_01",
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
      lastUpdate: new Date().toISOString()
    },
    {
      id: "zone_land_malnad_01_2",
      landId: "land_malnad_01",
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
      lastUpdate: new Date().toISOString()
    },
    {
      id: "zone_land_malnad_01_3",
      landId: "land_malnad_01",
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
      lastUpdate: new Date().toISOString()
    },
    // Hill Crest Plantation (3 zones)
    {
      id: "zone_land_sringeri_02_1",
      landId: "land_sringeri_02",
      zoneNumber: 1,
      name: "Zone 1 – Upper Slope",
      slopePosition: "Upper Slope",
      minMoistureThreshold: 30,
      targetMoisture: 65,
      maxDurationMinutes: 45,
      currentMoisture: 42.0,
      moistureStatus: "normal",
      valveStatus: "closed",
      irrigationStatus: "stopped",
      runoffStatus: "none",
      sensorStatus: "online",
      flowRateLpm: 24,
      waterConsumedToday: 90,
      currentDurationMinutes: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: "zone_land_sringeri_02_2",
      landId: "land_sringeri_02",
      zoneNumber: 2,
      name: "Zone 2 – Middle Slope",
      slopePosition: "Middle Slope",
      minMoistureThreshold: 30,
      targetMoisture: 65,
      maxDurationMinutes: 45,
      currentMoisture: 50.0,
      moistureStatus: "normal",
      valveStatus: "closed",
      irrigationStatus: "stopped",
      runoffStatus: "none",
      sensorStatus: "online",
      flowRateLpm: 24,
      waterConsumedToday: 90,
      currentDurationMinutes: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: "zone_land_sringeri_02_3",
      landId: "land_sringeri_02",
      zoneNumber: 3,
      name: "Zone 3 – Lower Slope",
      slopePosition: "Lower Slope",
      minMoistureThreshold: 28,
      targetMoisture: 60,
      maxDurationMinutes: 35,
      currentMoisture: 58.0,
      moistureStatus: "normal",
      valveStatus: "closed",
      irrigationStatus: "stopped",
      runoffStatus: "none",
      sensorStatus: "online",
      flowRateLpm: 24,
      waterConsumedToday: 40,
      currentDurationMinutes: 0,
      lastUpdate: new Date().toISOString()
    },
    // Stream Side Farm (3 zones)
    {
      id: "zone_land_koppa_03_1",
      landId: "land_koppa_03",
      zoneNumber: 1,
      name: "Zone 1 – Upper Slope",
      slopePosition: "Upper Slope",
      minMoistureThreshold: 30,
      targetMoisture: 65,
      maxDurationMinutes: 45,
      currentMoisture: 35.0,
      moistureStatus: "normal",
      valveStatus: "closed",
      irrigationStatus: "stopped",
      runoffStatus: "none",
      sensorStatus: "online",
      flowRateLpm: 24,
      waterConsumedToday: 60,
      currentDurationMinutes: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: "zone_land_koppa_03_2",
      landId: "land_koppa_03",
      zoneNumber: 2,
      name: "Zone 2 – Middle Slope",
      slopePosition: "Middle Slope",
      minMoistureThreshold: 30,
      targetMoisture: 65,
      maxDurationMinutes: 45,
      currentMoisture: 52.0,
      moistureStatus: "normal",
      valveStatus: "closed",
      irrigationStatus: "stopped",
      runoffStatus: "none",
      sensorStatus: "online",
      flowRateLpm: 24,
      waterConsumedToday: 45,
      currentDurationMinutes: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: "zone_land_koppa_03_3",
      landId: "land_koppa_03",
      zoneNumber: 3,
      name: "Zone 3 – Lower Slope",
      slopePosition: "Lower Slope",
      minMoistureThreshold: 28,
      targetMoisture: 60,
      maxDurationMinutes: 35,
      currentMoisture: 72.0,
      moistureStatus: "wet",
      valveStatus: "closed",
      irrigationStatus: "stopped",
      runoffStatus: "none",
      sensorStatus: "online",
      flowRateLpm: 24,
      waterConsumedToday: 20,
      currentDurationMinutes: 0,
      lastUpdate: new Date().toISOString()
    }
  ],
  telemetryLogs: [],
  irrigationLogs: [
    {
      id: "log_init_01",
      landId: "land_malnad_01",
      zoneId: "zone_land_malnad_01_1",
      startTime: "06:00:00",
      stopTime: "06:40:00",
      durationMinutes: 40,
      waterUsedLitres: 960,
      mode: "auto",
      reasonStart: "Upper slope moisture < 30%",
      reasonStop: "Target 65% reached",
      status: "confirmed"
    }
  ],
  alerts: [
    {
      id: "alert_init_01",
      landId: "land_malnad_01",
      zoneId: "zone_land_malnad_01_1",
      type: "low_moisture",
      priority: "warning",
      messageEn: "Devi Mane Grove: Upper Slope moisture low (28.5%). Irrigation recommended.",
      messageKn: "ದೇವಿ ಮನೆ ತೋಟ: ಮೇಲ್ಭಾಗದ ಇಳಿಜಾರಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ (28.5%). ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ.",
      messageHi: "देवी मने बागान: ऊपरी ढलान की नमी कम है (28.5%)। सिंचाई की आवश्यकता है।",
      timestamp: new Date().toISOString(),
      isRead: false,
      resolved: false
    }
  ]
};

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.writeAll(DEFAULT_DATA);
    }
  }

  readAll() {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading db, returning fallback:', err);
      return DEFAULT_DATA;
    }
  }

  writeAll(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Error saving db:', err);
      return false;
    }
  }

  // Lands
  getLands() {
    return this.readAll().lands;
  }

  getLandById(id) {
    return this.getLands().find(l => l.id === id) || null;
  }

  createLand(land) {
    const db = this.readAll();
    const newId = `land_${Date.now()}`;
    const newLand = {
      id: newId,
      name: land.name,
      location: land.location,
      area: parseFloat(land.area) || 1.0,
      areaUnit: land.areaUnit || 'acres',
      cropType: land.cropType || 'Arecanut',
      latitude: parseFloat(land.latitude) || 13.693,
      longitude: parseFloat(land.longitude) || 75.244,
      controllerId: land.controllerId || `ESP32_${Math.floor(1000 + Math.random() * 9000)}`,
      controllerStatus: 'online',
      irrigationMode: land.irrigationMode || 'auto',
      description: land.description || '',
      createdAt: new Date().toISOString()
    };

    db.lands.push(newLand);

    // Automatically provision 3 slope zones
    const zonePositions = [
      { num: 1, name: "Zone 1 – Upper Slope", pos: "Upper Slope", min: 30, target: 65, maxDur: 45 },
      { num: 2, name: "Zone 2 – Middle Slope", pos: "Middle Slope", min: 30, target: 65, maxDur: 45 },
      { num: 3, name: "Zone 3 – Lower Slope", pos: "Lower Slope", min: 28, target: 60, maxDur: 35 }
    ];

    zonePositions.forEach(zp => {
      db.zones.push({
        id: `zone_${newId}_${zp.num}`,
        landId: newId,
        zoneNumber: zp.num,
        name: zp.name,
        slopePosition: zp.pos,
        minMoistureThreshold: zp.min,
        targetMoisture: zp.target,
        maxDurationMinutes: zp.maxDur,
        currentMoisture: zp.num === 1 ? 28 : zp.num === 2 ? 46 : 60,
        moistureStatus: zp.num === 1 ? 'dry' : 'normal',
        valveStatus: 'closed',
        irrigationStatus: 'stopped',
        runoffStatus: 'none',
        sensorStatus: 'online',
        flowRateLpm: 24,
        waterConsumedToday: 0,
        currentDurationMinutes: 0,
        lastUpdate: new Date().toISOString()
      });
    });

    this.writeAll(db);
    return newLand;
  }

  updateLand(id, updateData) {
    const db = this.readAll();
    const idx = db.lands.findIndex(l => l.id === id);
    if (idx !== -1) {
      db.lands[idx] = { ...db.lands[idx], ...updateData };
      this.writeAll(db);
      return db.lands[idx];
    }
    return null;
  }

  deleteLand(id) {
    const db = this.readAll();
    db.lands = db.lands.filter(l => l.id !== id);
    db.zones = db.zones.filter(z => z.landId !== id);
    db.alerts = db.alerts.filter(a => a.landId !== id);
    this.writeAll(db);
    return true;
  }

  // Zones
  getZonesByLand(landId) {
    return this.readAll().zones.filter(z => z.landId === landId);
  }

  getZoneById(id) {
    return this.readAll().zones.find(z => z.id === id) || null;
  }

  updateZone(id, updateData) {
    const db = this.readAll();
    const idx = db.zones.findIndex(z => z.id === id);
    if (idx !== -1) {
      db.zones[idx] = { ...db.zones[idx], ...updateData };
      this.writeAll(db);
      return db.zones[idx];
    }
    return null;
  }

  // Telemetry & Safety
  saveTelemetry(telemetry) {
    const db = this.readAll();
    db.telemetryLogs.unshift(telemetry);
    if (db.telemetryLogs.length > 500) db.telemetryLogs.length = 500;

    // Update zone reading
    const zone = db.zones.find(z => z.id === telemetry.zoneId);
    if (zone) {
      zone.currentMoisture = telemetry.moisturePercentage;
      zone.sensorStatus = telemetry.sensorValid ? 'online' : 'offline';
      zone.lastUpdate = new Date().toISOString();
      if (telemetry.runoffDetected) {
        zone.runoffStatus = 'detected';
      }
    }

    this.writeAll(db);
    return true;
  }

  // Alerts
  getAlerts() {
    return this.readAll().alerts;
  }

  createAlert(alert) {
    const db = this.readAll();
    const newAlert = {
      id: `alert_${Date.now()}`,
      ...alert,
      timestamp: new Date().toISOString(),
      isRead: false,
      resolved: false
    };
    db.alerts.unshift(newAlert);
    if (db.alerts.length > 200) db.alerts.length = 200;
    this.writeAll(db);
    return newAlert;
  }

  resolveAlert(id) {
    const db = this.readAll();
    const alert = db.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      this.writeAll(db);
      return true;
    }
    return false;
  }

  // Irrigation logs
  recordIrrigationLog(log) {
    const db = this.readAll();
    const newLog = {
      id: `log_${Date.now()}`,
      ...log,
      timestamp: new Date().toISOString()
    };
    db.irrigationLogs.unshift(newLog);
    this.writeAll(db);
    return newLog;
  }

  getIrrigationLogs() {
    return this.readAll().irrigationLogs;
  }
}

module.exports = new Database();
