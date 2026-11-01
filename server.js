/**
 * SmartFarm Backend Server
 * Express.js application serving static UI, REST API endpoints, and ESP8266 telemetry ingestion.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    service: "SmartFarm Backend",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/lands', require('./routes/lands'));
app.use('/api/telemetry', require('./routes/telemetry'));
app.use('/api/irrigation', require('./routes/irrigation'));
app.use('/api/alerts', require('./routes/alerts'));

// Analytics aggregation endpoint
app.get('/api/analytics', (req, res) => {
  const lands = db.getLands();
  const logs = db.getIrrigationLogs();
  const alerts = db.getAlerts();

  let totalWater = 0;
  let totalDuration = 0;

  logs.forEach(l => {
    totalWater += parseFloat(l.waterUsedLitres || 0);
    totalDuration += parseFloat(l.durationMinutes || 0);
  });

  res.json({
    totalLands: lands.length,
    totalIrrigationEvents: logs.length,
    totalWaterLitres: totalWater,
    totalDurationMinutes: totalDuration,
    activeAlerts: alerts.filter(a => !a.resolved).length,
    recentEvents: logs.slice(0, 10)
  });
});

// CSV Export Endpoint
app.get('/api/export/csv', (req, res) => {
  const logs = db.getIrrigationLogs();
  const lands = db.getLands();

  const headers = "Log ID,Land Name,Zone ID,Start Time,Stop Time,Duration (Mins),Water (Litres),Mode,Reason,Status\n";
  const rows = logs.map(l => {
    const land = lands.find(ld => ld.id === l.landId);
    return `"${l.id}","${land ? land.name : l.landId}","${l.zoneId}","${l.startTime}","${l.stopTime}",${l.durationMinutes || 0},${l.waterUsedLitres || 0},"${l.mode}","${l.reasonStart || ''}","${l.status}"`;
  }).join("\n");

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=smartfarm_logs.csv');
  res.send(headers + rows);
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌱 SmartFarm Server running on http://localhost:${PORT}`);
    console.log(`📡 ESP8266 Telemetry endpoint: http://localhost:${PORT}/api/telemetry`);
    console.log(`🌴 Supporting multiple lands & 3-zone slope hydrology`);
    console.log(`🌐 Multilingual: Kannada (kn), Hindi (hi), English (en)`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
