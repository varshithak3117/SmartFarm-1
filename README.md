# SmartFarm ESP8266 Firmware & Hardware Integration Guide

This directory contains the complete Arduino firmware sketch for the **SmartFarm 3-Zone Slope Irrigation Controller**.

## Hardware Components Required

| Component | Quantity | Purpose | ESP8266 Pin Connection |
| :--- | :---: | :--- | :--- |
| **ESP8266 NodeMCU Dev Board** | 1 | Microcontroller with Wi-Fi and one ADC input | Host |
| **CD74HC4067 or CD74HC4051 Analog Multiplexer** | 1 | Shares the single ESP8266 ADC between three sensors | S0: D5, S1: D6, SIG: A0 |
| **Capacitive Soil Moisture Sensor v1.2 / v2.0** | 3 | Corrosion-free moisture measurement | MUX channels 0, 1, and 2 |
| **3-Channel or 4-Channel 5V Relay Module** | 1 | Switches 12V DC Solenoid Valves | Z1: D1, Z2: D2, Z3: D3 |
| **12V DC Solenoid Valves (Normally Closed)** | 3 | Individual zone water lines | Connected to Relay Common/NO terminals |
| **Optical / Float Switch Runoff Sensor** | 1 | Detects downhill water pooling | D8 (Internal Pullup) |
| **YF-S201 Water Flow Sensor** | 1 | Measures water volume (Litres) | D7 (Hardware Interrupt) |
| **12V 2A DC Power Supply** | 1 | Powers solenoid valves | Power rails |
| **LM2596 DC-DC Buck Converter (12V to 5V)** | 1 | Steps down 12V to 5V for ESP8266 & Relays | ESP8266 VIN & GND |

---

## Wiring Pinout Diagram

```
           +---------------------------------------------+
           |               ESP8266 NodeMCU               |
           |                                             |
           |  [A0]              <--- MUX Signal          |
           |  [D5 / S0, D6 / S1] ---> MUX Select       |
           |                                             |
           |  [D8 (IN)]        <--- Runoff Float Switch  |
           |  [D7 (INT)]       <--- Flow Meter Pulse (YF)|
           |                                             |
           |  [D1 (OUT)]       ---> Relay 1 (Zone 1 Valve)|
           |  [D2 (OUT)]       ---> Relay 2 (Zone 2 Valve)|
           |  [D3 (OUT)]       ---> Relay 3 (Zone 3 Valve)|
           |                                             |
           |  [GPIO 2 (OUT)]   ---> Onboard Status LED   |
           +---------------------------------------------+
```

---

## Calibration Steps

### 1. Soil Moisture Sensor Calibration
Raw 10-bit ADC values range from 0 to 1023:
1. **Dry Air Reading:** Place the sensor in dry air. Record the reading (typically `~850`). Update `AIR_VALUE` in `SmartFarm_ESP8266.ino`.
2. **Saturated Water Reading:** Dip sensor in water up to the safe depth line. Record reading (typically `~350`). Update `WATER_VALUE`.

### 2. Runoff Sensor Placement
Install the runoff sensor at the lowest drainage channel of **Zone 3 (Lower Slope)**. When excessive water percolates downhill or surface runoff begins, the sensor triggers and the ESP8266 firmware instantly executes a local emergency shutoff within milliseconds.

---

## Compiling & Flashing
1. Install [Arduino IDE](https://www.arduino.cc/en/software).
2. Install the **ESP8266 Board Package** (`esp8266 by ESP8266 Community`).
3. Install **ArduinoJson** library (Tools -> Manage Libraries -> search `ArduinoJson`).
4. Open `SmartFarm_ESP8266.ino`.
5. Enter your local Wi-Fi SSID, Password, and your computer's IP running the SmartFarm backend.
6. Select Board **NodeMCU 1.0 (ESP-12E Module)** and click **Upload**.
