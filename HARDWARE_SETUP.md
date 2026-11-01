# Field Deployment & Hardware Setup Guide

## 1. Physical Layout on a Sloping Plantation

For a typical 1 to 5 acre arecanut plantation situated on a hill slope:

1. **Zone 1 (Upper Slope):**
   - Place Capacitive Soil Moisture Sensor 1 at the root zone (depth of 20–30 cm, where arecanut feeder roots reside) on the upper crest of the terrace.
   - Install Solenoid Valve 1 on the upper feeder line.

2. **Zone 2 (Middle Slope):**
   - Place Capacitive Soil Moisture Sensor 2 in the midpoint of the slope gradient.
   - Install Solenoid Valve 2 on the middle feeder line.

3. **Zone 3 (Lower Slope & Valley Base):**
   - Place Capacitive Soil Moisture Sensor 3 near the lower palms.
   - Install Solenoid Valve 3 on the lower feeder line.
   - Install the **Runoff / Water Accumulation Detector** in the lowest natural drainage ditch or contour trench.

---

## 2. Water Delivery & Pressure Compensation

- **Gravity Considerations:** Solenoid valves on lower slopes experience higher static water pressure due to gravity head. Use pressure-compensating (PC) drippers or micro-jets to maintain uniform flow across elevation differentials.
- **Valve Power:** 12V DC latching or normally-closed solenoids connected to the ESP8266 relay module.

---

## 3. Power Supply & Surge Protection

- In rural plantation areas where grid power fluctuates, power the controller using a **12V 7Ah Lead-Acid or LiFePO4 battery** connected to a 20W Solar PV panel and MPPT solar charge controller.
- Use an LM2596 step-down regulator to provide clean 5V DC to the ESP8266.
- Ground the controller chassis with an earth spike to prevent electrostatic build-up during monsoon thunderstorms.
