# SmartFarm System Architecture & Slope Hydrology

## 1. The Sloping Arecanut Plantation Problem

Arecanut (*Areca catechu*) is predominantly cultivated in the Western Ghats (Malnad and coastal regions of Karnataka, Kerala, and Assam). These plantations are situated on undulating slopes and hillsides.

### Hydrological Challenges on Sloping Terrain:
1. **Gravity Downhill Drainage:** Water naturally percolates downhill. The **Upper Slope (Zone 1)** drains rapidly and dries out within hours, suffering moisture stress and stunted palm growth.
2. **Lower Slope Saturation & Pooling:** Downhill runoff accumulates in the **Lower Slope (Zone 3)**, leading to root rot (*Koleroga* fungal exacerbation), topsoil erosion, and fertilizer wash-out.
3. **The Flaw of Uniform Irrigation:** Conventional irrigation opens a main line that waters the entire slope equally. By the time the upper slope receives enough moisture, the lower slope is flooded, wasting up to 40% of water.

```
       [Zone 1: Upper Slope]   ---> High drainage, rapid drying
               \ 
                \  Gravity water percolation & subsurface migration
                 \
          [Zone 2: Middle Slope] ---> Balanced infiltration
                   \
                    \  Downhill accumulation
                     \
             [Zone 3: Lower Slope] ---> Pooling risk, topsoil erosion
```

---

## 2. The SmartFarm 3-Zone Solution

SmartFarm divides every registered plantation into three independent hydrological zones:
- **Zone 1 – Upper Slope:** Configured with higher watering priority, shorter but more frequent irrigation cycles, and lower moisture trigger points.
- **Zone 2 – Middle Slope:** Standard threshold cycles.
- **Zone 3 – Lower Slope:** Monitored continuously for downhill runoff. Irrigation is delayed if upper slope drainage is already replenishing it.

### Safety Interlock Loop:
```
           +-----------------------------+
           | ESP32 Runoff & Flow Sensors |
           +-----------------------------+
                          |
            Runoff or High Moisture Detected?
                          |
             +------------+------------+
             |                         |
          [ YES ]                   [ NO ]
             |                         |
+--------------------------+   +-------------------+
|  Hardware Emergency Halt |   | Normal Threshold  |
|  - Relays de-energized   |   | Auto-Irrigation   |
|  - Audible Voice Alert   |   +-------------------+
|  - Cloud Alert Logged    |
+--------------------------+
```

---

## 3. Multilingual Voice & UI Architecture

SmartFarm provides first-class support for:
1. **Kannada (ಕನ್ನಡ)** – Primary language of Malnad arecanut farmers.
2. **Hindi (हिंदी)** – Universal agricultural language across India.
3. **English** – Standard scientific and technical terminology.

### SpeechSynthesis Decoupling:
Voice alerts run entirely client-side via the browser's `SpeechSynthesis` API with language tags (`kn-IN`, `hi-IN`, `en-IN`).
Crucially, voice alerts are strictly decoupled from hardware valve control: speech synthesis failure can never prevent an emergency valve shutoff.
