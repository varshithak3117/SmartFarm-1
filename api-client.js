/**
 * SmartFarm API Client
 * Connects frontend with Node.js Express backend and ESP32 REST endpoints.
 * Automatically falls back to offline/local storage if backend server is not running.
 */

const ApiClient = {
  baseUrl: 'http://localhost:3000/api',
  isBackendAvailable: false,

  async checkBackendHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        this.isBackendAvailable = true;
        return true;
      }
    } catch (e) {
      this.isBackendAvailable = false;
    }
    return false;
  },

  async getLands() {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/lands`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return StorageManager.getLands();
  },

  async createLand(landData) {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/lands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(landData)
        });
        if (res.ok) {
          const created = await res.json();
          // Update local mirror
          StorageManager.addLand(created);
          return created;
        }
      } catch (e) {}
    }
    return StorageManager.addLand(landData);
  },

  async sendIrrigationCommand(command) {
    // command: { landId, zoneId, action: 'start'|'stop'|'pause'|'resume', reason }
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/irrigation/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(command)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    // Local execution
    const zone = StorageManager.getZoneById(command.zoneId);
    if (!zone) return { success: false, error: 'Zone not found' };

    if (command.action === 'start') {
      zone.valveStatus = 'open';
      zone.irrigationStatus = 'running';
      zone.currentDurationMinutes = 0;
    } else if (command.action === 'stop') {
      zone.valveStatus = 'closed';
      zone.irrigationStatus = 'stopped';
    } else if (command.action === 'pause') {
      zone.valveStatus = 'paused';
      zone.irrigationStatus = 'paused';
    } else if (command.action === 'resume') {
      zone.valveStatus = 'open';
      zone.irrigationStatus = 'running';
    }

    StorageManager.saveZone(zone);
    StorageManager.recordIrrigationEvent({
      landId: command.landId,
      zoneId: command.zoneId,
      action: command.action,
      mode: 'manual',
      reason: command.reason || 'Manual command'
    });

    return {
      success: true,
      confirmedByHardware: false,
      hardwareMode: 'demo_simulated',
      zone
    };
  }
};
