/**
 * ESP32 Telemetry Ingestion Route
 * Ingests moisture readings, flow meters, and runoff float/capacitive sensors.
 * Implements server-side slope safety guard: auto-interlocks on downhill runoff.
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const {
    landId,
    zoneId,
    sensorId,
    moisturePercentage,
    flowRateLpm,
    runoffDetected,
    sensorValid,
    controllerId
  } = req.body;

  if (!landId || !zoneId) {
    return res.status(400).json({ error: "Missing required fields: landId, zoneId." });
  }

  const land = db.getLandById(landId);
  const zone = db.getZoneById(zoneId);

  if (!land || !zone) {
    return res.status(404).json({ error: "Land or Zone not found." });
  }

  // Update controller heartbeat
  if (controllerId) {
    db.updateLand(landId, { controllerStatus: 'online', lastHeartbeat: new Date().toISOString() });
  }

  // Save telemetry
  db.saveTelemetry({
    landId,
    zoneId,
    sensorId: sensorId || `SENSOR_${zone.zoneNumber}`,
    moisturePercentage: parseFloat(moisturePercentage) || 0,
    flowRateLpm: parseFloat(flowRateLpm) || 0,
    runoffDetected: !!runoffDetected,
    sensorValid: sensorValid !== false,
    timestamp: new Date().toISOString(),
    source: req.headers['x-esp32-device'] ? 'esp32_hardware' : 'api_client'
  });

  // Safety Interlock Check
  if (runoffDetected) {
    // Runoff detected! Automatically close or pause valves on this land
    const zones = db.getZonesByLand(landId);
    zones.forEach(z => {
      if (z.valveStatus === 'open') {
        db.updateZone(z.id, { valveStatus: 'paused', irrigationStatus: 'paused' });
      }
    });

    db.createAlert({
      landId,
      zoneId,
      type: 'runoff_detected',
      priority: 'critical',
      messageEn: `RUNOFF DETECTED by sensor on ${land.name} (${zone.name})! Valves paused downhill.`,
      messageKn: `${land.name} (${zone.name}) ನಲ್ಲಿ ನೀರು ಹರಿದುಹೋಗುವಿಕೆ ಪತ್ತೆಯಾಗಿದೆ! ವಾಲ್ವ್‌ಗಳನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ.`,
      messageHi: `${land.name} (${zone.name}) पर जल बहाव पाया गया! सुरक्षा हेतु वाल्व रोक दिए गए।`
    });
  }

  // Return desired valve state for this zone to the ESP32
  const updatedZone = db.getZoneById(zoneId);
  res.json({
    status: "received",
    safetyInterlockActive: !!runoffDetected,
    desiredValveState: updatedZone.valveStatus, // 'open' | 'closed' | 'paused'
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
