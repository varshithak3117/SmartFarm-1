# SmartFarm REST API Documentation

Base URL: `http://localhost:3000/api`

---

## 1. Land Management

### `GET /api/lands`
Retrieves all registered agricultural lands.

**Response:**
```json
[
  {
    "id": "land_malnad_01",
    "name": "Devi Mane Arecanut Grove",
    "location": "Thirthahalli, Karnataka",
    "area": 2.5,
    "areaUnit": "acres",
    "cropType": "Arecanut + Pepper",
    "latitude": 13.693,
    "longitude": 75.244,
    "controllerId": "ESP32_MALNAD_01",
    "controllerStatus": "online",
    "irrigationMode": "auto"
  }
]
```

### `POST /api/lands`
Registers a new land and **automatically provisions 3 independent slope zones**:
- Zone 1 – Upper Slope
- Zone 2 – Middle Slope
- Zone 3 – Lower Slope

**Request Body:**
```json
{
  "name": "Kaveri Valley Arecanut Field",
  "location": "Sringeri, Karnataka",
  "area": 2.0,
  "areaUnit": "acres",
  "cropType": "Arecanut",
  "latitude": 13.421,
  "longitude": 75.253,
  "controllerId": "ESP32_SRINGERI_04",
  "description": "Steep north slope plantation."
}
```

### `GET /api/lands/:id`
Retrieves a land record along with all of its monitored zones.

### `PUT /api/lands/:id`
Updates land metadata.

### `DELETE /api/lands/:id`
Deletes a land, safely purging its associated slope zones, alerts, and records.

---

## 2. Telemetry Ingestion (ESP32 / Sensors)

### `POST /api/telemetry`
Called by ESP32 microcontrollers to push periodic sensor data.

**Request Body:**
```json
{
  "landId": "land_malnad_01",
  "zoneId": "zone_land_malnad_01_1",
  "sensorId": "SENSOR_Z1",
  "moisturePercentage": 28.5,
  "flowRateLpm": 24.0,
  "runoffDetected": false,
  "sensorValid": true,
  "controllerId": "ESP32_MALNAD_01"
}
```

**Response:**
```json
{
  "status": "received",
  "safetyInterlockActive": false,
  "desiredValveState": "closed",
  "timestamp": "2026-10-29T14:40:00.000Z"
}
```

---

## 3. Irrigation Control & Safety Interlocks

### `POST /api/irrigation/command`
Dispatches a manual or automated valve control command.

**Request Body:**
```json
{
  "landId": "land_malnad_01",
  "zoneId": "zone_land_malnad_01_1",
  "action": "start",
  "reason": "Upper slope dry stress"
}
```

**Safety Enforcement:**
- If `runoffDetected` is active on this land, the command is **rejected** with HTTP `403 Forbidden`.
- If sensor reading is invalid or offline, manual start is blocked to prevent unchecked slope erosion.

---

## 4. Alerts & Notifications

### `GET /api/alerts`
Retrieves alert records with optional query filtering (`?priority=critical`, `?unresolved=true`).

### `POST /api/alerts/:id/resolve`
Marks an alert as resolved.

---

## 5. Analytics & CSV Export

### `GET /api/analytics`
Returns aggregate farm water usage, total duration, and alert statistics.

### `GET /api/export/csv`
Streams a formatted CSV download containing all irrigation logs.
