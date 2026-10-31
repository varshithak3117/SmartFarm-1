/**
 * Irrigation Control & Safety Interlock Route
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/command', (req, res) => {
  const { landId, zoneId, action, reason } = req.body;

  if (!landId || !zoneId || !action) {
    return res.status(400).json({ error: "Missing required fields: landId, zoneId, action." });
  }

  const land = db.getLandById(landId);
  const zone = db.getZoneById(zoneId);

  if (!land || !zone) {
    return res.status(404).json({ error: "Land or Zone not found." });
  }

  // Safety check 1: Runoff prevention
  if (action === 'start' || action === 'resume') {
    if (zone.runoffStatus === 'detected') {
      return res.status(403).json({
        success: false,
        error: "COMMAND REJECTED: Safety interlock active. Runoff detected on slope. Clear runoff condition before opening valve."
      });
    }

    if (zone.sensorStatus === 'offline') {
      return res.status(403).json({
        success: false,
        error: "COMMAND REJECTED: Soil moisture sensor offline. Operating blindly risks severe erosion on sloping terrain."
      });
    }
  }

  let newValveStatus = zone.valveStatus;
  let newIrrigationStatus = zone.irrigationStatus;

  if (action === 'start' || action === 'resume') {
    newValveStatus = 'open';
    newIrrigationStatus = 'running';
  } else if (action === 'pause') {
    newValveStatus = 'paused';
    newIrrigationStatus = 'paused';
  } else if (action === 'stop') {
    newValveStatus = 'closed';
    newIrrigationStatus = 'stopped';
  }

  const updatedZone = db.updateZone(zoneId, {
    valveStatus: newValveStatus,
    irrigationStatus: newIrrigationStatus,
    lastCommandTime: new Date().toISOString()
  });

  // Record irrigation event log
  db.recordIrrigationLog({
    landId,
    zoneId,
    action,
    startTime: action === 'start' ? new Date().toLocaleTimeString() : zone.lastCommandTime || '',
    stopTime: action === 'stop' ? new Date().toLocaleTimeString() : '',
    mode: land.irrigationMode || 'manual',
    reasonStart: action === 'start' ? (reason || 'Manual farmer command') : '',
    reasonStop: action === 'stop' ? (reason || 'Manual stop') : '',
    status: 'confirmed_by_controller'
  });

  res.json({
    success: true,
    commandAccepted: true,
    action,
    zone: updatedZone,
    safetyStatus: "SAFE_SLOPE_OPERATION",
    message: `Valve command '${action.toUpperCase()}' dispatched successfully.`
  });
});

module.exports = router;
