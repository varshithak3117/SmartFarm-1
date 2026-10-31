/**
 * SmartFarm – ESP32 Firmware for Sloping Arecanut Plantations
 * 
 * Hardware Features:
 * - 3 Capacitive Soil Moisture Sensors (Zone 1 Upper, Zone 2 Middle, Zone 3 Lower)
 * - 1 YF-S201 Flow Rate Pulse Sensor
 * - 1 Downhill Slope Runoff / Accumulation Detector
 * - 3 Relay Output Channels for 12V Solenoid Irrigation Valves
 * - Local Watchdog & Hardware Runoff Interlock (Fail-safe: works even without Wi-Fi)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Requires ArduinoJson v6 or v7

// ----------------- WI-FI CONFIGURATION -----------------
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// SmartFarm Backend Server Endpoint
const char* SERVER_URL = "http://192.168.1.100:3000/api/telemetry";

// Controller & Land Identification
const char* CONTROLLER_ID = "ESP32_MALNAD_01";
const char* LAND_ID = "land_malnad_01";

// ----------------- PIN DEFINITIONS -----------------
// Soil Moisture Analog Pins (ADC1 channels)
#define PIN_MOISTURE_Z1 34  // Upper Slope (Zone 1)
#define PIN_MOISTURE_Z2 35  // Middle Slope (Zone 2)
#define PIN_MOISTURE_Z3 32  // Lower Slope (Zone 3)

// Runoff Sensor (Digital Float Switch or Conductivity probe at base of slope)
#define PIN_RUNOFF_SENSOR 14

// Water Flow Sensor Pulse Pin
#define PIN_FLOW_SENSOR 13

// Relay Pins for 12V DC Solenoid Valves (Active LOW or HIGH depending on relay board)
#define PIN_VALVE_Z1 25     // Valve 1 (Upper Slope)
#define PIN_VALVE_Z2 26     // Valve 2 (Middle Slope)
#define PIN_VALVE_Z3 27     // Valve 3 (Lower Slope)

// Status LED
#define PIN_LED_STATUS 2

// ----------------- CALIBRATION CONSTANTS -----------------
// Raw ADC readings for soil calibration (0 - 4095)
// In air (0% moisture) approx 3200, in water (100% moisture) approx 1400
const int AIR_VALUE = 3200;
const int WATER_VALUE = 1400;

// Maximum continuous watering safety limit (in milliseconds = 45 mins)
const unsigned long MAX_SAFE_DURATION_MS = 45UL * 60UL * 1000UL;

// ----------------- RUNTIME VARIABLES -----------------
volatile unsigned long flowPulseCount = 0;
float currentFlowRateLpm = 0.0;
unsigned long lastFlowCalcTime = 0;
unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 5000; // Send reading every 5 seconds

// Valve start timestamps for watchdog
unsigned long valve1StartTime = 0;
unsigned long valve2StartTime = 0;
unsigned long valve3StartTime = 0;

// Flow sensor ISR
void IRAM_ATTR pulseCounter() {
  flowPulseCount++;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[SmartFarm] Booting ESP32 Slope Irrigation Controller...");

  // Initialize Relay outputs (Start with all valves closed)
  pinMode(PIN_VALVE_Z1, OUTPUT);
  pinMode(PIN_VALVE_Z2, OUTPUT);
  pinMode(PIN_VALVE_Z3, OUTPUT);
  digitalWrite(PIN_VALVE_Z1, LOW); // Closed
  digitalWrite(PIN_VALVE_Z2, LOW); // Closed
  digitalWrite(PIN_VALVE_Z3, LOW); // Closed

  // Status LED
  pinMode(PIN_LED_STATUS, OUTPUT);
  digitalWrite(PIN_LED_STATUS, LOW);

  // Runoff Sensor with internal pull-up
  pinMode(PIN_RUNOFF_SENSOR, INPUT_PULLUP);

  // Flow Sensor interrupt
  pinMode(PIN_FLOW_SENSOR, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR), pulseCounter, RISING);

  // Moisture ADC resolution
  analogReadResolution(12);

  // Connect to Wi-Fi
  connectWiFi();

  Serial.println("[SmartFarm] Setup complete. Local slope safety monitoring active.");
}

void loop() {
  // Ensure Wi-Fi connection
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(PIN_LED_STATUS, LOW);
    connectWiFi();
  }

  // 1. HARDWARE-LEVEL SAFETY CHECK (Downhill Runoff & Water Accumulation)
  bool runoffDetected = checkRunoffCondition();
  if (runoffDetected) {
    // Immediate local fail-safe shutoff of all valves to prevent soil erosion
    emergencyHaltAllValves("LOCAL HARDWARE RUNOFF INTERLOCK ACTIVATED!");
  }

  // 2. WATCHDOG: Ensure no valve exceeds max duration even if server is offline
  enforceMaxDurationWatchdog();

  // 3. Compute flow rate every second
  unsigned long now = millis();
  if (now - lastFlowCalcTime >= 1000) {
    // Sensor calibration: 7.5 pulses per second = approx 1 L/min for YF-S201
    detachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR));
    currentFlowRateLpm = (flowPulseCount / 7.5);
    flowPulseCount = 0;
    lastFlowCalcTime = now;
    attachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR), pulseCounter, RISING);
  }

  // 4. Send Periodic Telemetry to SmartFarm Backend
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = now;
    readSensorsAndSendTelemetry(runoffDetected);
  }
}

// ----------------- SENSOR ACQUISITION & TELEMETRY -----------------
void readSensorsAndSendTelemetry(bool runoffDetected) {
  // Read and convert 3 slope zones
  float moistureZ1 = readMoisturePercent(PIN_MOISTURE_Z1);
  float moistureZ2 = readMoisturePercent(PIN_MOISTURE_Z2);
  float moistureZ3 = readMoisturePercent(PIN_MOISTURE_Z3);

  Serial.printf("[Sensors] Z1(Upper): %.1f%% | Z2(Middle): %.1f%% | Z3(Lower): %.1f%% | Flow: %.1f L/m | Runoff: %s\n",
    moistureZ1, moistureZ2, moistureZ3, currentFlowRateLpm, runoffDetected ? "YES" : "NO");

  // Send for each zone to backend
  sendZoneTelemetry(1, "zone_land_malnad_01_1", moistureZ1, runoffDetected);
  sendZoneTelemetry(2, "zone_land_malnad_01_2", moistureZ2, false);
  sendZoneTelemetry(3, "zone_land_malnad_01_3", moistureZ3, runoffDetected);
}

float readMoisturePercent(int pin) {
  // Take 5 samples for smoothing
  long sum = 0;
  for (int i = 0; i < 5; i++) {
    sum += analogRead(pin);
    delay(5);
  }
  int raw = sum / 5;

  // Constrain and map to percentage
  raw = constrain(raw, WATER_VALUE, AIR_VALUE);
  float percent = map(raw, AIR_VALUE, WATER_VALUE, 0, 100);
  return percent;
}

bool checkRunoffCondition() {
  // Active LOW on float switch or high conductivity on probe
  return (digitalRead(PIN_RUNOFF_SENSOR) == LOW);
}

void emergencyHaltAllValves(const char* reason) {
  digitalWrite(PIN_VALVE_Z1, LOW);
  digitalWrite(PIN_VALVE_Z2, LOW);
  digitalWrite(PIN_VALVE_Z3, LOW);
  valve1StartTime = 0;
  valve2StartTime = 0;
  valve3StartTime = 0;
  Serial.printf("[SAFETY ALERT] %s\n", reason);
}

void enforceMaxDurationWatchdog() {
  unsigned long now = millis();
  if (digitalRead(PIN_VALVE_Z1) == HIGH && (now - valve1StartTime > MAX_SAFE_DURATION_MS)) {
    digitalWrite(PIN_VALVE_Z1, LOW);
    valve1StartTime = 0;
    Serial.println("[WATCHDOG] Zone 1 max duration exceeded. Auto-closed.");
  }
  if (digitalRead(PIN_VALVE_Z2) == HIGH && (now - valve2StartTime > MAX_SAFE_DURATION_MS)) {
    digitalWrite(PIN_VALVE_Z2, LOW);
    valve2StartTime = 0;
    Serial.println("[WATCHDOG] Zone 2 max duration exceeded. Auto-closed.");
  }
  if (digitalRead(PIN_VALVE_Z3) == HIGH && (now - valve3StartTime > MAX_SAFE_DURATION_MS)) {
    digitalWrite(PIN_VALVE_Z3, LOW);
    valve3StartTime = 0;
    Serial.println("[WATCHDOG] Zone 3 max duration exceeded. Auto-closed.");
  }
}

void sendZoneTelemetry(int zoneNum, const char* zoneId, float moisture, bool runoff) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-esp32-device", CONTROLLER_ID);

  StaticJsonDocument<256> doc;
  doc["landId"] = LAND_ID;
  doc["zoneId"] = zoneId;
  doc["controllerId"] = CONTROLLER_ID;
  doc["moisturePercentage"] = moisture;
  doc["flowRateLpm"] = currentFlowRateLpm;
  doc["runoffDetected"] = runoff;
  doc["sensorValid"] = true;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  if (httpCode > 0) {
    digitalWrite(PIN_LED_STATUS, HIGH);
    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
      String response = http.getString();
      StaticJsonDocument<256> respDoc;
      deserializeJson(respDoc, response);

      // Actuate valves based on desired state returned by backend
      const char* desiredState = respDoc["desiredValveState"] | "closed";
      setValveState(zoneNum, strcmp(desiredState, "open") == 0);
    }
  } else {
    Serial.printf("[HTTP] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
    digitalWrite(PIN_LED_STATUS, LOW);
  }
  http.end();
}

void setValveState(int zoneNum, bool open) {
  int pin = (zoneNum == 1) ? PIN_VALVE_Z1 : (zoneNum == 2) ? PIN_VALVE_Z2 : PIN_VALVE_Z3;
  unsigned long* startTimePtr = (zoneNum == 1) ? &valve1StartTime : (zoneNum == 2) ? &valve2StartTime : &valve3StartTime;

  if (open) {
    if (digitalRead(pin) == LOW) {
      *startTimePtr = millis();
      digitalWrite(pin, HIGH);
      Serial.printf("[Relay] Zone %d valve OPENED.\n", zoneNum);
    }
  } else {
    if (digitalRead(pin) == HIGH) {
      digitalWrite(pin, LOW);
      *startTimePtr = 0;
      Serial.printf("[Relay] Zone %d valve CLOSED.\n", zoneNum);
    }
  }
}

void connectWiFi() {
  Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(PIN_LED_STATUS, HIGH);
  } else {
    Serial.println("\n[WiFi] Connection failed. Operating in local offline safety mode.");
  }
}
