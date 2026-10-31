/**
 * Alerts & Safety Management Routes
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  let alerts = db.getAlerts();
  if (req.query.unresolved === 'true') {
    alerts = alerts.filter(a => !a.resolved);
  }
  if (req.query.priority) {
    alerts = alerts.filter(a => a.priority === req.query.priority);
  }
  res.json(alerts);
});

router.post('/', (req, res) => {
  const { landId, zoneId, type, priority, messageEn, messageKn, messageHi } = req.body;
  const alert = db.createAlert({
    landId,
    zoneId,
    type,
    priority: priority || 'info',
    messageEn,
    messageKn,
    messageHi
  });
  res.status(201).json(alert);
});

router.post('/:id/resolve', (req, res) => {
  const success = db.resolveAlert(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "Alert not found." });
  }
  res.json({ success: true, message: "Alert resolved." });
});

module.exports = router;
