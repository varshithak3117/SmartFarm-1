/**
 * Lands & Zones API Routes
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all lands
router.get('/', (req, res) => {
  const lands = db.getLands();
  res.json(lands);
});

// POST create a land (automatically provisions 3 slope zones)
router.post('/', (req, res) => {
  const { name, location, area, areaUnit, cropType, latitude, longitude, controllerId, description } = req.body;
  if (!name || !location) {
    return res.status(400).json({ error: "Land name and location are required." });
  }

  const createdLand = db.createLand({
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

  res.status(201).json(createdLand);
});

// GET land by ID + its 3 zones
router.get('/:id', (req, res) => {
  const land = db.getLandById(req.params.id);
  if (!land) {
    return res.status(404).json({ error: "Land not found." });
  }
  const zones = db.getZonesByLand(land.id);
  res.json({ land, zones });
});

// PUT update land
router.put('/:id', (req, res) => {
  const updated = db.updateLand(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: "Land not found." });
  }
  res.json(updated);
});

// DELETE land and its zones
router.delete('/:id', (req, res) => {
  db.deleteLand(req.params.id);
  res.json({ success: true, message: "Land and associated slope zones deleted." });
});

// GET zones for a land
router.get('/:id/zones', (req, res) => {
  const zones = db.getZonesByLand(req.params.id);
  res.json(zones);
});

// PUT update a zone (thresholds, valve status)
router.put('/zones/:zoneId', (req, res) => {
  const updated = db.updateZone(req.params.zoneId, req.body);
  if (!updated) {
    return res.status(404).json({ error: "Zone not found." });
  }
  res.json(updated);
});

module.exports = router;
