/**
 * SmartFarm Slope Hydrology & Demo Simulation Engine
 * Models gravity drainage, subsurface water migration from upper to lower slopes,
 * runoff detection, valve flow rates, and safe automated threshold control.
 */

const SimulationEngine = {
  active: true,
  tickIntervalMs: 3500, // Update every 3.5 seconds
  timerId: null,
  speedMultiplier: 1,

  // Slope hydrological parameters
  drainageRate: {
    1: 0.35, // Upper slope drains rapidly due to gravity
    2: 0.20, // Middle slope moderate retention
    3: 0.10  // Lower slope retains water and receives downhill drainage
  },

  irrigationRate: 1.4, // % moisture gain per tick when valve is open
  flowRateLpm: 24, // Flow rate in litres per minute per valve channel

  init() {
    this.start();
  },

  start() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs / this.speedMultiplier);
  },

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  setSpeed(multiplier) {
    this.speedMultiplier = Math.max(0.5, Math.min(5, multiplier));
    this.start();
  },

  /**
   * Main simulation step
   */
  tick() {
    if (!StorageManager.isDemoMode()) return;

    const lands = StorageManager.getLands();
    let stateChanged = false;

    lands.forEach(land => {
      // If controller is offline, skip sensor updates
      if (land.controllerStatus === 'offline') return;

      const zones = StorageManager.getZonesByLand(land.id);
      let upperExcessWater = 0;

      zones.forEach(zone => {
        const zoneNum = zone.zoneNumber;
        let moisture = zone.currentMoisture;
        let valveOpen = zone.valveStatus === 'open' && zone.irrigationStatus === 'running';

        if (valveOpen) {
          // Increase moisture
          moisture += this.irrigationRate;

          // Increment water usage
          const waterThisTick = (this.flowRateLpm / 60) * (this.tickIntervalMs / 1000) * this.speedMultiplier;
          zone.waterConsumedToday = (parseFloat(zone.waterConsumedToday || 0) + waterThisTick).toFixed(1);
          zone.currentDurationMinutes = (parseFloat(zone.currentDurationMinutes || 0) + (this.tickIntervalMs / 60000) * this.speedMultiplier).toFixed(1);

          // Check if target moisture reached in Auto mode
          if (land.irrigationMode === 'auto' && moisture >= zone.targetMoisture) {
            zone.valveStatus = 'closed';
            zone.irrigationStatus = 'stopped';
            StorageManager.recordIrrigationEvent({
              landId: land.id,
              zoneId: zone.id,
              action: 'stop',
              reason: 'Target moisture reached'
            });

            // Notification
            StorageManager.addAlert({
              landId: land.id,
              zoneId: zone.id,
              type: 'target_reached',
              priority: 'info',
              messageEn: `Zone ${zoneNum} reached target moisture of ${zone.targetMoisture}%. Valve closed automatically.`,
              messageKn: `ವಲಯ ${zoneNum} ನಿಗದಿತ ತೇವಾಂಶ (${zone.targetMoisture}%) ತಲುಪಿದೆ. ವಾಲ್ವ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮುಚ್ಚಲ್ಪಟ್ಟಿದೆ.`,
              messageHi: `ज़ोन ${zoneNum} लक्षित नमी (${zone.targetMoisture}%) पर पहुंच गया है। वाल्व अपने आप बंद हो गया।`
            });
          }

          // Safety: Check max duration
          if (parseFloat(zone.currentDurationMinutes) >= zone.maxDurationMinutes) {
            zone.valveStatus = 'closed';
            zone.irrigationStatus = 'stopped';
            StorageManager.addAlert({
              landId: land.id,
              zoneId: zone.id,
              type: 'max_duration',
              priority: 'warning',
              messageEn: `Max permitted duration (${zone.maxDurationMinutes} mins) reached for Zone ${zoneNum}. Auto shutoff engaged.`,
              messageKn: `ವಲಯ ${zoneNum} ಗಾಗಿ ಗರಿಷ್ಠ ಸಮಯ (${zone.maxDurationMinutes} ನಿಮಿಷ) ತಲುಪಿದೆ. ಸ್ವಯಂಚಾಲಿತ ಸ್ಥಗಿತಗೊಂಡಿದೆ.`,
              messageHi: `ज़ोन ${zoneNum} के लिए अधिकतम समय सीमा (${zone.maxDurationMinutes} मिनट) समाप्त। सुरक्षा शटऑफ सक्रिय।`
            });
          }

          // Water downhill migration
          if (zoneNum === 1 && moisture > 65) {
            upperExcessWater += (moisture - 65) * 0.15;
          }
        } else {
          // Natural drying & drainage on slope
          const drain = this.drainageRate[zoneNum] || 0.2;
          moisture = Math.max(12, moisture - drain);

          // Lower slope receives runoff or downhill percolation
          if (zoneNum === 3 && upperExcessWater > 0) {
            moisture = Math.min(95, moisture + upperExcessWater);
          }

          // Auto-start check in Auto Mode
          if (land.irrigationMode === 'auto' && moisture < zone.minMoistureThreshold) {
            // Check if safe to start (no runoff, sensor valid)
            if (zone.runoffStatus !== 'detected' && zone.sensorStatus === 'online') {
              zone.valveStatus = 'open';
              zone.irrigationStatus = 'running';
              zone.currentDurationMinutes = 0;
              StorageManager.recordIrrigationEvent({
                landId: land.id,
                zoneId: zone.id,
                action: 'start',
                reason: 'Moisture dropped below threshold'
              });

              const alertOpts = {
                landId: land.id,
                zoneId: zone.id,
                type: 'low_moisture_auto',
                priority: 'medium',
                messageEn: `${land.name}, Zone ${zoneNum} (${zone.slopePosition}): Low moisture (${Math.round(moisture)}%). Auto-irrigation started.`,
                messageKn: `${land.name}, ವಲಯ ${zoneNum}: ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ (${Math.round(moisture)}%). ಸ್ವಯಂಚಾಲಿತ ನೀರಾವರಿ ಪ್ರಾರಂಭವಾಗಿದೆ.`,
                messageHi: `${land.name}, ज़ोन ${zoneNum}: मिट्टी की नमी कम है (${Math.round(moisture)}%)। स्वचालित सिंचाई शुरू हुई।`,
                voiceTextKn: `${land.name}, ವಲಯ ${zoneNum} ರಲ್ಲಿ ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ. ನೀರಾವರಿ ಆರಂಭಿಸಲಾಗಿದೆ.`,
                voiceTextHi: `${land.name}, ज़ोन ${zoneNum} में नमी कम है। सिंचाई शुरू की गई है।`,
                voiceTextEn: `${land.name}, Zone ${zoneNum} has low soil moisture. Irrigation started.`
              };
              StorageManager.addAlert(alertOpts);
              VoiceAlerts.announce({
                textKn: alertOpts.voiceTextKn,
                textHi: alertOpts.voiceTextHi,
                textEn: alertOpts.voiceTextEn,
                alertKey: `low_moisture_${land.id}_${zone.id}`,
                priority: 'medium'
              });
            }
          }
        }

        // Cap moisture between 10% and 95%
        moisture = Math.max(10, Math.min(95, parseFloat(moisture.toFixed(1))));
        zone.currentMoisture = moisture;
        zone.lastUpdate = new Date().toLocaleTimeString();

        // Moisture status category
        if (moisture < zone.minMoistureThreshold) {
          zone.moistureStatus = 'dry';
        } else if (moisture > 70) {
          zone.moistureStatus = 'wet';
        } else {
          zone.moistureStatus = 'normal';
        }

        // Runoff detection logic (especially in Lower Slope Zone 3 or over-saturated conditions)
        if (zoneNum === 3 && moisture >= 78) {
          if (zone.runoffStatus !== 'detected') {
            zone.runoffStatus = 'detected';
            
            // Safety: Halt irrigation in this land to prevent downhill wash and erosion
            zones.forEach(z => {
              if (z.valveStatus === 'open') {
                z.valveStatus = 'paused';
                z.irrigationStatus = 'paused';
              }
            });

            const runoffAlert = {
              landId: land.id,
              zoneId: zone.id,
              type: 'runoff_detected',
              priority: 'critical',
              messageEn: `RUNOFF DETECTED on ${land.name} Lower Slope! Soil saturated. Valves paused to prevent erosion.`,
              messageKn: `${land.name} ಕೆಳಭಾಗದ ಇಳಿಜಾರಿನಲ್ಲಿ ನೀರು ಹರಿದುಹೋಗುವಿಕೆ ಪತ್ತೆಯಾಗಿದೆ! ಮಣ್ಣಿನ ಸವೆತ ತಡೆಯಲು ವಾಲ್ವ್‌ಗಳನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ.`,
              messageHi: `${land.name} की निचली ढलान पर पानी का बहाव पाया गया! मिट्टी कटाव रोकने के लिए वाल्व रोक दिए गए हैं।`,
              voiceTextKn: `${land.name} ನಲ್ಲಿ ನೀರು ಹರಿದುಹೋಗುವಿಕೆ ಪತ್ತೆಯಾಗಿದೆ. ನೀರಾವರಿಯನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ.`,
              voiceTextHi: `${land.name} में पानी का बहाव पाया गया है। सिंचाई रोक दी गई है।`,
              voiceTextEn: `Runoff detected in ${land.name}. Irrigation has been paused.`
            };

            StorageManager.addAlert(runoffAlert);
            VoiceAlerts.announce({
              textKn: runoffAlert.voiceTextKn,
              textHi: runoffAlert.voiceTextHi,
              textEn: runoffAlert.voiceTextEn,
              alertKey: `runoff_${land.id}`,
              priority: 'critical'
            });
          }
        } else if (moisture < 68 && zone.runoffStatus === 'detected') {
          // Cleared safely after drying
          zone.runoffStatus = 'none';
        }

        StorageManager.saveZone(zone);
        stateChanged = true;
      });
    });

    if (stateChanged) {
      window.dispatchEvent(new CustomEvent('simulationUpdate'));
    }
  },

  /**
   * Helper test triggers for user demo testing
   */
  simulateDrySpell(landId) {
    const zones = StorageManager.getZonesByLand(landId);
    zones.forEach((z, idx) => {
      z.currentMoisture = Math.max(12, 18 + idx * 4); // Zone 1: 18%, Zone 2: 22%, Zone 3: 26%
      z.moistureStatus = 'dry';
      StorageManager.saveZone(z);
    });
    window.dispatchEvent(new CustomEvent('simulationUpdate'));
  },

  simulateRunoffEvent(landId) {
    const zones = StorageManager.getZonesByLand(landId);
    const z3 = zones.find(z => z.zoneNumber === 3) || zones[2];
    if (z3) {
      z3.currentMoisture = 86;
      z3.runoffStatus = 'detected';
      z3.moistureStatus = 'wet';
      StorageManager.saveZone(z3);

      // Pause all running zones
      zones.forEach(z => {
        if (z.valveStatus === 'open') {
          z.valveStatus = 'paused';
          z.irrigationStatus = 'paused';
          StorageManager.saveZone(z);
        }
      });

      const land = StorageManager.getLandById(landId);
      const runoffAlert = {
        landId: landId,
        zoneId: z3.id,
        type: 'runoff_detected',
        priority: 'critical',
        messageEn: `[DEMO TEST] Runoff detected on Lower Slope of ${land ? land.name : 'Land'}. Safety interlock halted valves.`,
        messageKn: `[ಡೆಮೊ ಪರೀಕ್ಷೆ] ${land ? land.name : 'ಜಮೀನಿನ'} ಕೆಳ ಇಳಿಜಾರಿನಲ್ಲಿ ನೀರು ಹರಿವು ಪತ್ತೆಯಾಗಿದೆ. ವಾಲ್ವ್‌ಗಳು ಸ್ಥಗಿತಗೊಂಡಿವೆ.`,
        messageHi: `[डेमो परीक्षण] ${land ? land.name : 'खेत'} की निचली ढलान पर बहाव पाया गया। सुरक्षा शटऑफ सक्रिय।`,
        voiceTextKn: `${land ? land.name : 'ಜಮೀನಿನಲ್ಲಿ'} ನೀರು ಹರಿದುಹೋಗುವಿಕೆ ಪತ್ತೆಯಾಗಿದೆ. ನೀರಾವರಿ ನಿಲ್ಲಿಸಲಾಗಿದೆ.`,
        voiceTextHi: `${land ? land.name : 'खेत'} में पानी का बहाव पाया गया है। सिंचाई रोक दी गई है।`,
        voiceTextEn: `Runoff detected in ${land ? land.name : 'plantation'}. Irrigation has been paused.`
      };

      StorageManager.addAlert(runoffAlert);
      VoiceAlerts.announce({
        textKn: runoffAlert.voiceTextKn,
        textHi: runoffAlert.voiceTextHi,
        textEn: runoffAlert.voiceTextEn,
        alertKey: `manual_runoff_${landId}`,
        priority: 'critical'
      });
      window.dispatchEvent(new CustomEvent('simulationUpdate'));
    }
  },

  resetRunoff(landId) {
    const zones = StorageManager.getZonesByLand(landId);
    zones.forEach(z => {
      z.runoffStatus = 'none';
      if (z.currentMoisture > 70) z.currentMoisture = 55;
      z.moistureStatus = 'normal';
      if (z.irrigationStatus === 'paused') {
        z.irrigationStatus = 'stopped';
        z.valveStatus = 'closed';
      }
      StorageManager.saveZone(z);
    });
    window.dispatchEvent(new CustomEvent('simulationUpdate'));
  }
};

// Initialize
if (typeof window !== 'undefined') {
  SimulationEngine.init();
}
