# SmartFarm ESP32 Firmware & Hardware Integration Guide

This directory contains the complete Arduino firmware sketch for the **SmartFarm 3-Zone Slope Irrigation Controller**.

## Hardware Components Required

| Component | Quantity | Purpose | ESP32 Pin Connection |
| :--- | :---: | :--- | :--- |
| **ESP32 NodeMCU Dev Board** | 1 | Microcontroller with Wi-Fi & ADC | Host |
| **Capacitive Soil Moisture Sensor v1.2 / v2.0** | 3 | Corrosion-free moisture measurement | Z1: GPIO 34, Z2: GPIO 35, Z3: GPIO 32 |
| **3-Channel or 4-Channel 5V Relay Module** | 1 | Switches 12V DC Solenoid Valves | Z1: GPIO 25, Z2: GPIO 26, Z3: GPIO 27 |
| **12V DC Solenoid Valves (Normally Closed)** | 3 | Individual zone water lines | Connected to Relay Common/NO terminals |
| **Optical / Float Switch Runoff Sensor** | 1 | Detects downhill water pooling | GPIO 14 (Internal Pullup) |
| **YF-S201 Water Flow Sensor** | 1 | Measures water volume (Litres) | GPIO 13 (Hardware Interrupt) |
| **12V 2A DC Power Supply** | 1 | Powers solenoid valves | Power rails |
| **LM2596 DC-DC Buck Converter (12V to 5V)** | 1 | Steps down 12V to 5V for ESP32 & Relays | ESP32 VIN & GND |

---

## Wiring Pinout Diagram

```
           +---------------------------------------------+
           |                ESP32 DevKit                 |
           |                                             |
           |  [GPIO 34 (ADC1)] <--- Zone 1 Upper Sensor  |
           |  [GPIO 35 (ADC1)] <--- Zone 2 Middle Sensor |
           |  [GPIO 32 (ADC1)] <--- Zone 3 Lower Sensor  |
           |                                             |
           |  [GPIO 14 (IN)]   <--- Runoff Float Switch  |
           |  [GPIO 13 (INT)]  <--- Flow Meter Pulse (YF)|
           |                                             |
           |  [GPIO 25 (OUT)]  ---> Relay 1 (Zone 1 Valve)|
           |  [GPIO 26 (OUT)]  ---> Relay 2 (Zone 2 Valve)|
           |  [GPIO 27 (OUT)]  ---> Relay 3 (Zone 3 Valve)|
           |                                             |
           |  [GPIO 2 (OUT)]   ---> Onboard Status LED   |
           +---------------------------------------------+
```

---

## Calibration Steps

### 1. Soil Moisture Sensor Calibration
Raw 12-bit ADC values range from 0 to 4095:
1. **Dry Air Reading:** Place the sensor in dry air. Record the reading (typically `~3200`). Update `AIR_VALUE` in `SmartFarm_ESP32.ino`.
2. **Saturated Water Reading:** Dip sensor in water up to the safe depth line. Record reading (typically `~1400`). Update `WATER_VALUE`.

### 2. Runoff Sensor Placement
Install the runoff sensor at the lowest drainage channel of **Zone 3 (Lower Slope)**. When excessive water percolates downhill or surface runoff begins, the sensor triggers and the ESP32 firmware instantly executes a local emergency shutoff within milliseconds.

---

## Compiling & Flashing
1. Install [Arduino IDE](https://www.arduino.cc/en/software).
2. Install the **ESP32 Board Package** (`esp32 by Espressif Systems`).
3. Install **ArduinoJson** library (Tools -> Manage Libraries -> search `ArduinoJson`).
4. Open `SmartFarm_ESP32.ino`.
5. Enter your local Wi-Fi SSID, Password, and your computer's IP running the SmartFarm backend.
6. Select Board **ESP32 Dev Module** and click **Upload**.
