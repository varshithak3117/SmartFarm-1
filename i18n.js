/**
 * SmartFarm Multilingual Localization Dictionary
 * Complete translations for Kannada (ಕನ್ನಡ), Hindi (हिंदी), and English (English)
 */

const I18N = {
  currentLang: 'en', // 'en' | 'kn' | 'hi'

  translations: {
    en: {
      appName: "SmartFarm",
      tagline: "Smart Irrigation for Sloping Arecanut Plantations",
      welcomeFarmer: "Welcome back, Farmer",
      welcomeSubtitle: "Monitor slopes, save water, and prevent runoff across your arecanut groves",
      demoBadge: "DEMO MODE (Simulated)",
      liveBadge: "LIVE HARDWARE",
      demoNotice: "Simulation active: Slope physics, gravity runoff, and sensor telemetry are simulated.",
      
      // Nav
      navHome: "Home Dashboard",
      navLands: "My Lands",
      navLandDetail: "Land Dashboard",
      navZones: "Zone Monitoring",
      navIrrigation: "Irrigation Control",
      navWeather: "Weather & Forecast",
      navAnalytics: "Analytics & History",
      navAlerts: "Alerts & Safety",
      navRecommendations: "Smart Recommendations",
      navSettings: "Settings",

      // Top bar & Actions
      addLandBtn: "+ Add New Land",
      voiceAlertsToggle: "Voice Alerts",
      searchPlaceholder: "Search lands, zones, alerts...",
      searchButton: "Search",
      searchResults: "matches found",
      searchNoResults: "No matching farm information found.",
      searchTypeLand: "Land",
      searchTypeZone: "Zone",
      searchTypeAlert: "Alert",
      searchTypeIrrigation: "Irrigation",
      searchTypePage: "Current page",
      searchListening: "Listening... say what you want to find.",
      searchUnsupported: "Voice search is not supported in this browser.",
      searchFailed: "Voice search failed. Check microphone permissions.",
      voiceReady: "Voice alert is using the selected language.",
      voiceUnavailable: "A matching speech voice is not installed in this browser or device. Install a Kannada or Hindi text-to-speech voice and try again.",
      quickSelectLand: "Select Active Land",
      allLandsOverview: "All Registered Lands",
      notifications: "Notifications",
      markAllRead: "Mark all as read",
      systemStatus: "System Status: Healthy",

      // Summary KPIs
      kpiTotalLands: "Total Lands",
      kpiTotalZones: "Monitored Zones",
      kpiNeedWater: "Zones Needing Water",
      kpiIrrigating: "Currently Irrigating",
      kpiWaterToday: "Water Used Today",
      kpiActiveAlerts: "Active Alerts",
      kpiStatus: "Irrigation Status",
      statusOptimal: "All Slopes Stable",
      statusActionNeeded: "Attention Needed",
      statusIrrigating: "Active Watering",

      // Zone Names and Slope Positions
      zone1Name: "Zone 1 – Upper Slope",
      zone2Name: "Zone 2 – Middle Slope",
      zone3Name: "Zone 3 – Lower Slope",
      upperSlopeDesc: "Steep upper crest – prone to rapid drainage & drought stress",
      middleSlopeDesc: "Transition zone – steady gradient & standard infiltration",
      lowerSlopeDesc: "Valley / base – prone to gravity water accumulation & soil erosion",

      // Status Badges
      moistureDry: "Dry (Needs Water)",
      moistureNormal: "Optimal Moisture",
      moistureWet: "High Moisture (Saturated)",
      valveOpen: "Valve OPEN",
      valveClosed: "Valve CLOSED",
      valvePaused: "Valve PAUSED",
      irrRunning: "Irrigating",
      irrPaused: "Safety Paused",
      irrStopped: "Idle / Stopped",
      runoffNone: "No Runoff Detected",
      runoffDetected: "RUNOFF DETECTED!",
      runoffWarning: "Erosion Risk Detected",
      sensorOnline: "Sensor Online",
      sensorOffline: "Sensor Disconnected",
      controllerOnline: "ESP32 Online",
      controllerOffline: "ESP32 Offline",

      // Land Details
      location: "Location",
      area: "Area",
      crop: "Crop",
      cropArecanut: "Arecanut (Betel Nut)",
      cropArecanutPepper: "Arecanut + Black Pepper Intercrop",
      cropArecanutCocoa: "Arecanut + Cocoa Intercrop",
      controllerId: "Controller ID",
      viewDashboard: "Open Land Dashboard",
      editLand: "Edit Land",
      deleteLand: "Remove Land",
      confirmDeleteLand: "Are you sure you want to remove this land? This will permanently delete its 3 slope zones and historical logs.",

      // Irrigation Controls
      modeAuto: "Automatic Mode",
      modeManual: "Manual Mode",
      autoExplanation: "Auto mode irrigates automatically when moisture drops below threshold, with safety pause on runoff and rainfall forecast delay.",
      btnStart: "Start Irrigation",
      btnStop: "Emergency Stop",
      btnPause: "Pause",
      btnResume: "Resume",
      thresholdMin: "Min Moisture Threshold",
      thresholdTarget: "Target Moisture Level",
      maxDuration: "Max Permitted Duration",
      maxWaterLimit: "Max Water Volume",
      cooldownTime: "Safety Cooldown Time",
      flowRate: "Flow Rate",
      lastUpdate: "Last Reading",
      irrDuration: "Irrigation Duration",
      waterUsed: "Water Consumed",

      // Safety & Runoff
      safetyHeader: "Sloping Land Safety Guard",
      safetyActive: "Safety interlocks active: Runoff detection, flow spike monitor, gravity runoff prevention.",
      runoffAlertTitle: "Runoff Warning on Lower Slope",
      runoffAlertDesc: "Water accumulation detected downhill. Upper slope irrigation paused to protect soil from erosion.",
      clearSafety: "Acknowledge & Clear Safety Alert",

      // Weather
      weatherTitle: "Weather & Rainfall Forecast (Open-Meteo)",
      currentTemp: "Current Temperature",
      rainProbability: "Rain Probability",
      expectedRain: "Expected Rain",
      forecastSummary: "Forecast Analysis",
      rainExpectedAdvice: "Heavy rain expected today! System automatically delayed scheduled irrigation to save water.",
      noRainAdvice: "Dry spell forecasted. Normal slope irrigation schedules in effect.",
      weatherUpdated: "Weather updated",

      // Recommendations
      recomTitle: "Smart Irrigation Recommendations",
      priorityHigh: "High Priority",
      priorityMedium: "Medium Priority",
      priorityLow: "Tip / Optimization",
      recomAction: "Recommended Action",

      // Analytics
      analyticsTitle: "Water Usage & Soil Hydrology Analytics",
      chartMoistureTitle: "Soil Moisture Across Slopes (% over time)",
      chartWaterUsageTitle: "Daily Water Consumption (Litres)",
      chartZoneComparison: "Water Distribution by Slope Zone",
      chartLandComparison: "Water Usage by Land",
      exportCsvBtn: "Export Irrigation Records (CSV)",
      waterSavingsTitle: "Estimated Water Savings",
      waterSavingsDesc: "Compared to conventional unzoned flood irrigation on sloping plantations, SmartFarm zone management saved approx.",
      filterToday: "Today",
      filterWeek: "This Week",
      filterMonth: "This Month",

      // Alerts Page
      alertsTitle: "Alerts & Safety History",
      filterAllAlerts: "All Alerts",
      filterUnresolved: "Active / Unresolved",
      filterResolved: "Resolved History",
      resolveBtn: "Resolve",
      statusResolved: "Resolved",
      statusUnresolved: "Active",

      // Settings
      settingsTitle: "System & Hardware Settings",
      langSelectLabel: "Interface Language",
      voiceSettings: "Voice Alerts & Synthesis",
      voiceEnabled: "Enable Voice Alerts",
      voiceTestBtn: "Test Voice Alert",
      voiceLanguage: "Voice Language Tag",
      hardwareApiEndpoint: "Backend / ESP32 Endpoint",
      simulationSpeed: "Demo Simulation Speed",
      saveSettingsBtn: "Save Preferences",

      // Units & Common
      acres: "Acres",
      hectares: "Hectares",
      guntas: "Guntas",
      litres: "Litres",
      minutes: "mins",
      seconds: "sec",
      percent: "%",
      celsius: "°C",
      mmPerHour: "mm",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      confirm: "Confirm",
      success: "Saved successfully",
      error: "An error occurred",
      notAvailable: "N/A"
    },

    kn: {
      appName: "ಸ್ಮಾರ್ಟ್‌ಫಾರ್ಮ್ (SmartFarm)",
      tagline: "ಇಳಿಜಾರು ಅಡಿಕೆ ತೋಟಗಳಿಗಾಗಿ ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ",
      welcomeFarmer: "ಸ್ವಾಗತ, ರೈತ ಮಿತ್ರರೇ",
      welcomeSubtitle: "ನಿಮ್ಮ ಅಡಿಕೆ ತೋಟಗಳ ಇಳಿಜಾರಿನ ತೇವಾಂಶ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ, ನೀರು ಉಳಿಸಿ ಮತ್ತು ಮಣ್ಣಿನ ಸವೆತ ತಡೆಯಿರಿ",
      demoBadge: "ಡೆಮೊ ಮೋಡ್ (ಸಿಮ್ಯುಲೇಶನ್)",
      liveBadge: "ಲೈವ್ ಯಂತ್ರಾಂಶ (Live ESP32)",
      demoNotice: "ಸಿಮ್ಯುಲೇಶನ್ ಸಕ್ರಿಯವಾಗಿದೆ: ಇಳಿಜಾರಿನ ಗುರುತ್ವಾಕರ್ಷಣೆಯ ನೀರು ಹರಿವು ಮತ್ತು ಸೆನ್ಸರ್ ಅಂಕಿಅಂಶಗಳು ನಕಲಿ ಮಾದರಿಯಾಗಿದೆ.",
      
      // Nav
      navHome: "ಮುಖ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      navLands: "ನನ್ನ ಜಮೀನುಗಳು",
      navLandDetail: "ಜಮೀನಿನ ವಿವರ",
      navZones: "ವಲಯಗಳ ಮೇಲ್ವಿಚಾರಣೆ",
      navIrrigation: "ನೀರಾವರಿ ನಿಯಂತ್ರಣ",
      navWeather: "ಹವಾಮಾನ & ಮಳೆ ಮುನ್ಸೂಚನೆ",
      navAnalytics: "ವಿಶ್ಲೇಷಣೆ & ಇತಿಹಾಸ",
      navAlerts: "ಎಚ್ಚರಿಕೆಗಳು & ಸುರಕ್ಷತೆ",
      navRecommendations: "ಸ್ಮಾರ್ಟ್ ಶಿಫಾರಸುಗಳು",
      navSettings: "ಸಂಯೋಜನೆಗಳು (Settings)",

      // Top bar & Actions
      addLandBtn: "+ ಹೊಸ ಜಮೀನು ಸೇರಿಸಿ",
      voiceAlertsToggle: "ಧ್ವನಿ ಎಚ್ಚರಿಕೆ (Voice)",
      searchPlaceholder: "ಭೂಮಿ, ವಲಯಗಳು, ಎಚ್ಚರಿಕೆಗಳಲ್ಲಿ ಹುಡುಕಿ...",
      searchButton: "ಹುಡುಕಿ",
      searchResults: "ಹೊಂದಾಣಿಕೆಗಳು ಕಂಡುಬಂದಿವೆ",
      searchNoResults: "ಹೊಂದಾಣಿಕೆಯ ಕೃಷಿ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ.",
      searchTypeLand: "ಭೂಮಿ",
      searchTypeZone: "ವಲಯ",
      searchTypeAlert: "ಎಚ್ಚರಿಕೆ",
      searchTypeIrrigation: "ನೀರಾವರಿ",
      searchTypePage: "ಪ್ರಸ್ತುತ ಪುಟ",
      searchListening: "ಕೇಳುತ್ತಿದ್ದೇನೆ... ಹುಡುಕಬೇಕಾದುದನ್ನು ಹೇಳಿ.",
      searchUnsupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಹುಡುಕಾಟ ಲಭ್ಯವಿಲ್ಲ.",
      searchFailed: "ಧ್ವನಿ ಹುಡುಕಾಟ ವಿಫಲವಾಗಿದೆ. ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
      voiceReady: "ಧ್ವನಿ ಎಚ್ಚರಿಕೆ ಆಯ್ಕೆ ಮಾಡಿದ ಭಾಷೆಯನ್ನು ಬಳಸುತ್ತಿದೆ.",
      voiceUnavailable: "ಈ ಬ್ರೌಸರ್ ಅಥವಾ ಸಾಧನದಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ. ಕನ್ನಡ ಅಥವಾ ಹಿಂದಿ ಪಠ್ಯ-ಧ್ವನಿ ಧ್ವನಿಯನ್ನು ಸ್ಥಾಪಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      quickSelectLand: "ಸಕ್ರಿಯ ಜಮೀನು ಆಯ್ಕೆಮಾಡಿ",
      allLandsOverview: "ನೋಂದಾಯಿತ ಎಲ್ಲಾ ಜಮೀನುಗಳು",
      notifications: "ಸೂಚನೆಗಳು",
      markAllRead: "ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
      systemStatus: "ವ್ಯವಸ್ಥೆ ಸ್ಥಿತಿ: ಉತ್ತಮವಾಗಿದೆ",

      // Summary KPIs
      kpiTotalLands: "ಒಟ್ಟು ಜಮೀನುಗಳು",
      kpiTotalZones: "ಮೇಲ್ವಿಚಾರಣೆಯ ವಲಯಗಳು",
      kpiNeedWater: "ನೀರು ಬೇಕಾದ ವಲಯಗಳು",
      kpiIrrigating: "ಪ್ರಸ್ತುತ ನೀರು ಹರಿಯುತ್ತಿರುವ ವಲಯಗಳು",
      kpiWaterToday: "ಇಂದು ಬಳಸಲಾದ ನೀರು",
      kpiActiveAlerts: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು",
      kpiStatus: "ನೀರಾವರಿ ಸ್ಥಿತಿ",
      statusOptimal: "ಎಲ್ಲಾ ಇಳಿಜಾರುಗಳು ಸ್ಥಿರವಾಗಿವೆ",
      statusActionNeeded: "ಗಮನ ಅಗತ್ಯವಿದೆ",
      statusIrrigating: "ನೀರಾವರಿ ಚಾಲನೆಯಲ್ಲಿದೆ",

      // Zone Names and Slope Positions
      zone1Name: "ವಲಯ 1 – ಮೇಲ್ಭಾಗದ ಇಳಿಜಾರು",
      zone2Name: "ವಲಯ 2 – ಮಧ್ಯಮ ಇಳಿಜಾರು",
      zone3Name: "ವಲಯ 3 – ಕೆಳಭಾಗದ ಇಳಿಜಾರು",
      upperSlopeDesc: "ಕಡಿದಾದ ಮೇಲ್ಭಾಗ – ನೀರು ಬೇಗ ಇಳಿದು ಒಣಗುವ ಅಪಾಯ ಹೆಚ್ಚು",
      middleSlopeDesc: "ಮಧ್ಯಮ ಇಳಿಜಾರು – ಸಮತೋಲಿತ ತೇವಾಂಶ ಹೀರಿಕೊಳ್ಳುವಿಕೆ",
      lowerSlopeDesc: "ಕೆಳ ಕಣಿವೆ ಭಾಗ – ನೀರು ನಿಲ್ಲುವಿಕೆ ಮತ್ತು ಮಣ್ಣಿನ ಸವೆತದ ಅಪಾಯ",

      // Status Badges
      moistureDry: "ಒಣಗಿದೆ (ನೀರು ಅಗತ್ಯ)",
      moistureNormal: "ಸಾಮಾನ್ಯ ತೇವಾಂಶ (ಉತ್ತಮ)",
      moistureWet: "ಹೆಚ್ಚು ತೇವಾಂಶ (ತೇವ)",
      valveOpen: "ವಾಲ್ವ್ ತೆರೆದಿದೆ",
      valveClosed: "ವಾಲ್ವ್ ಮುಚ್ಚಲಾಗಿದೆ",
      valvePaused: "ವಾಲ್ವ್ ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ",
      irrRunning: "ನೀರಾವರಿ ಚಾಲನೆಯಲ್ಲಿದೆ",
      irrPaused: "ಸುರಕ್ಷತಾ ವಿರಾಮ",
      irrStopped: "ನಿಲ್ಲಿಸಲಾಗಿದೆ",
      runoffNone: "ಯಾವುದೇ ನೀರು ಹರಿವು ಇಲ್ಲ",
      runoffDetected: "ನೀರು ಹರಿದುಹೋಗುವಿಕೆ ಪತ್ತೆಯಾಗಿದೆ!",
      runoffWarning: "ಮಣ್ಣಿನ ಸವೆತದ ಎಚ್ಚರಿಕೆ",
      sensorOnline: "ಸೆನ್ಸರ್ ಆನ್‌ಲೈನ್",
      sensorOffline: "ಸೆನ್ಸರ್ ಸಂಪರ್ಕ ಕಡಿತ",
      controllerOnline: "ESP32 ಸಂಪರ್ಕದಲ್ಲಿದೆ",
      controllerOffline: "ESP32 ಆಫ್‌ಲೈನ್",

      // Land Details
      location: "ಸ್ಥಳ",
      area: "ವಿಸ್ತೀರ್ಣ",
      crop: "ಬೆಳೆ",
      cropArecanut: "ಅಡಿಕೆ ತೋಟ",
      cropArecanutPepper: "ಅಡಿಕೆ + ಕಾಳುಮೆಣಸು ಮಿಶ್ರಬೆಳೆ",
      cropArecanutCocoa: "ಅಡಿಕೆ + ಕೋಕೋ ಮಿಶ್ರಬೆಳೆ",
      controllerId: "ಕಂಟ್ರೋಲರ್ ಐಡಿ",
      viewDashboard: "ಜಮೀನಿನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",
      editLand: "ಜಮೀನು ತಿದ್ದುಪಡಿ",
      deleteLand: "ಜಮೀನು ತೆಗೆದುಹಾಕಿ",
      confirmDeleteLand: "ಈ ಜಮೀನನ್ನು ಖಚಿತವಾಗಿ ತೆಗೆದುಹಾಕಬೇಕೇ? ಇದರ 3 ವಲಯಗಳು ಮತ್ತು ದಾಖಲೆಗಳು ಅಳಿಸಿಹೋಗುತ್ತವೆ.",

      // Irrigation Controls
      modeAuto: "ಸ್ವಯಂಚಾಲಿತ ಮೋಡ್ (Auto)",
      modeManual: "ಹಸ್ತಚಾಲಿತ ಮೋಡ್ (Manual)",
      autoExplanation: "ಸ್ವಯಂಚಾಲಿತ ಮೋಡ್‌ನಲ್ಲಿ ತೇವಾಂಶ ಕಡಿಮೆಯಾದಾಗ ವಾಲ್ವ್ ತಾನಾಗಿಯೇ ತೆರೆಯುತ್ತದೆ ಮತ್ತು ಮಳೆ ಅಥವಾ ನೀರು ಹರಿವು ಕಂಡಾಗ ತಕ್ಷಣ ನಿಲ್ಲುತ್ತದೆ.",
      btnStart: "ನೀರಾವರಿ ಪ್ರಾರಂಭಿಸಿ",
      btnStop: "ತುರ್ತು ಸ್ಥಗಿತ (Stop)",
      btnPause: "ವಿರಾಮಗೊಳಿಸಿ",
      btnResume: "ಮುಂದುವರಿಸಿ",
      thresholdMin: "ಕನಿಷ್ಠ ತೇವಾಂಶ ಮಿತಿ",
      thresholdTarget: "ಗುರಿ ತೇವಾಂಶ ಮಟ್ಟ",
      maxDuration: "ಗರಿಷ್ಠ ಅನುಮತಿಸಲಾದ ಸಮಯ",
      maxWaterLimit: "ಗರಿಷ್ಠ ನೀರಿನ ಪ್ರಮಾಣ",
      cooldownTime: "ಸುರಕ್ಷತಾ ಕೂಲ್‌ಡೌನ್ ಸಮಯ",
      flowRate: "ಹರಿವಿನ ಪ್ರಮಾಣ",
      lastUpdate: "ಕೊನೆಯ ಅಪ್‌ಡೇಟ್",
      irrDuration: "ನೀರಾವರಿ ಸಮಯ",
      waterUsed: "ಬಳಸಿದ ನೀರು",

      // Safety & Runoff
      safetyHeader: "ಇಳಿಜಾರು ಜಮೀನಿನ ಸುರಕ್ಷತಾ ಕವಚ",
      safetyActive: "ಸುರಕ್ಷತಾ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ: ನೀರು ಹರಿವು ಪತ್ತೆ, ಅತಿಯಾದ ಹರಿವು ತಡೆ, ಮಣ್ಣಿನ ಸವೆತ ರಕ್ಷಣೆ.",
      runoffAlertTitle: "ಕೆಳ ಇಳಿಜಾರಿನಲ್ಲಿ ನೀರು ಹರಿಯುವಿಕೆ ಎಚ್ಚರಿಕೆ",
      runoffAlertDesc: "ಕೆಳಭಾಗದಲ್ಲಿ ನೀರು ಸಂಗ್ರಹವಾಗುತ್ತಿದೆ. ಮಣ್ಣಿನ ಸವೆತ ತಡೆಯಲು ಮೇಲ್ಭಾಗದ ನೀರಾವರಿಯನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ.",
      clearSafety: "ಎಚ್ಚರಿಕೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮುಕ್ತಾಯಗೊಳಿಸಿ",

      // Weather
      weatherTitle: "ಹವಾಮಾನ & ಮಳೆ ಮುನ್ಸೂಚನೆ (Open-Meteo)",
      currentTemp: "ಪ್ರಸ್ತುತ ತಾಪಮಾನ",
      rainProbability: "ಮಳೆಯ ಸಂಭವನೀಯತೆ",
      expectedRain: "ನಿರೀಕ್ಷಿತ ಮಳೆ",
      forecastSummary: "ಮುನ್ಸೂಚನೆ ವಿಶ್ಲೇಷಣೆ",
      rainExpectedAdvice: "ಇಂದು ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ! ನೀರು ಉಳಿಸಲು ಸ್ವಯಂಚಾಲಿತ ನೀರಾವರಿಯನ್ನು ಮುಂದೂಡಲಾಗಿದೆ.",
      noRainAdvice: "ಮಳೆಯ ಸಾಧ್ಯತೆ ಕಡಿಮೆ ಇದೆ. ನಿಯಮಿತ ಇಳಿಜಾರು ನೀರಾವರಿ ಮುಂದುವರಿಯುತ್ತದೆ.",
      weatherUpdated: "ಹವಾಮಾನ ನವೀಕರಿಸಲಾಗಿದೆ",

      // Recommendations
      recomTitle: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಶಿಫಾರಸುಗಳು",
      priorityHigh: "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ",
      priorityMedium: "ಮಧ್ಯಮ ಆದ್ಯತೆ",
      priorityLow: "ಸಲಹೆ / ಆಪ್ಟಿಮೈಸೇಶನ್",
      recomAction: "ಸೂಚಿಸಲಾದ ಕ್ರಮ",

      // Analytics
      analyticsTitle: "ನೀರಿನ ಬಳಕೆ ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶ ವಿಶ್ಲೇಷಣೆ",
      chartMoistureTitle: "ಇಳಿಜಾರುಗಳಲ್ಲಿ ಮಣ್ಣಿನ ತೇವಾಂಶ (% ಕಾಲಾವಧಿಯಲ್ಲಿ)",
      chartWaterUsageTitle: "ದೈನಂದಿನ ನೀರಿನ ಬಳಕೆ (ಲೀಟರ್‌ಗಳು)",
      chartZoneComparison: "ಇಳಿಜಾರಿನ ವಲಯವಾರು ನೀರಿನ ಹಂಚಿಕೆ",
      chartLandComparison: "ಜಮೀನುವಾರು ನೀರಿನ ಬಳಕೆ",
      exportCsvBtn: "ದಾಖಲೆಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (CSV)",
      waterSavingsTitle: "ಅಂದಾಜು ಉಳಿತಾಯವಾದ ನೀರು",
      waterSavingsDesc: "ಇಳಿಜಾರು ತೋಟಗಳಲ್ಲಿ ಸಾಂಪ್ರದಾಯಿಕ ಕಾಲುವೆ ನೀರಾವರಿಗೆ ಹೋಲಿಸಿದರೆ ಉಳಿತಾಯವಾದ ನೀರು ಸುಮಾರು",
      filterToday: "ಇಂದು",
      filterWeek: "ಈ ವಾರ",
      filterMonth: "ಈ ತಿಂಗಳು",

      // Alerts Page
      alertsTitle: "ಎಚ್ಚರಿಕೆಗಳು & ಸುರಕ್ಷತಾ ಇತಿಹಾಸ",
      filterAllAlerts: "ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆಗಳು",
      filterUnresolved: "ಸಕ್ರಿಯ ಸಮಸ್ಯೆಗಳು",
      filterResolved: "ಪರಿಹರಿಸಲಾದ ಇತಿಹಾಸ",
      resolveBtn: "ಪರಿಹರಿಸಲಾಗಿದೆ",
      statusResolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
      statusUnresolved: "ಸಕ್ರಿಯವಾಗಿದೆ",

      // Settings
      settingsTitle: "ವ್ಯವಸ್ಥೆ ಮತ್ತು ಹಾರ್ಡ್‌ವೇರ್ ಸಂಯೋಜನೆಗಳು",
      langSelectLabel: "ವೆಬ್‌ಸೈಟ್ ಭಾಷೆ",
      voiceSettings: "ಧ್ವನಿ ಎಚ್ಚರಿಕೆಗಳು (Voice Alerts)",
      voiceEnabled: "ಧ್ವನಿ ಎಚ್ಚರಿಕೆಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ",
      voiceTestBtn: "ಧ್ವನಿ ಪರೀಕ್ಷಿಸಿ (Test Voice)",
      voiceLanguage: "ಧ್ವನಿ ಭಾಷಾ ಟ್ಯಾಗ್",
      hardwareApiEndpoint: "ಬ್ಯಾಕೆಂಡ್ / ESP32 ಸಂಪರ್ಕ ವಿಳಾಸ",
      simulationSpeed: "ಸಿಮ್ಯುಲೇಶನ್ ವೇಗ",
      saveSettingsBtn: "ಆಯ್ಕೆಗಳನ್ನು ಉಳಿಸಿ",

      // Units & Common
      acres: "ಎಕರೆ",
      hectares: "ಹೆಕ್ಟೇರ್",
      guntas: "ಗುಂಟೆ",
      litres: "ಲೀಟರ್",
      minutes: "ನಿಮಿಷ",
      seconds: "ಸೆಕೆಂಡ್",
      percent: "%",
      celsius: "°C",
      mmPerHour: "ಮಿ.ಮೀ",
      save: "ಉಳಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      close: "ಮುಚ್ಚಿ",
      confirm: "ದೃಢೀಕರಿಸಿ",
      success: "ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ",
      error: "ದೋಷ ಸಂಭವಿಸಿದೆ",
      notAvailable: "ಲಭ್ಯವಿಲ್ಲ"
    },

    hi: {
      appName: "स्मार्टफार्म (SmartFarm)",
      tagline: "ढलानदार सुपारी के बागानों के लिए स्मार्ट सिंचाई प्रबंधन प्रणाली",
      welcomeFarmer: "स्वागत है, किसान मित्र",
      welcomeSubtitle: "ढलानों पर नमी की निगरानी करें, पानी बचाएं और मिट्टी का कटाव रोकें",
      demoBadge: "डेमो मोड (सिम्युलेटेड)",
      liveBadge: "लाइव हार्डवेयर (Live ESP32)",
      demoNotice: "सिमुलेशन सक्रिय है: ढलान पर पानी का बहाव और सेंसर डेटा सिम्युलेट किया गया है।",
      
      // Nav
      navHome: "मुख्य डैशबोर्ड",
      navLands: "मेरे खेत / बागान",
      navLandDetail: "खेत का विवरण",
      navZones: "ज़ोन निगरानी",
      navIrrigation: "सिंचाई नियंत्रण",
      navWeather: "मौसम और बारिश का अनुमान",
      navAnalytics: "विश्लेषण और इतिहास",
      navAlerts: "चेतावनी और सुरक्षा",
      navRecommendations: "स्मार्ट अनुशंसाएं",
      navSettings: "सेटिंग्स",

      // Top bar & Actions
      addLandBtn: "+ नया खेत जोड़ें",
      voiceAlertsToggle: "ध्वनि अलर्ट (Voice)",
      searchPlaceholder: "खेत, ज़ोन, चेतावनियां खोजें...",
      searchButton: "खोजें",
      searchResults: "मिलान मिले",
      searchNoResults: "खेती से जुड़ी कोई जानकारी नहीं मिली।",
      searchTypeLand: "खेत",
      searchTypeZone: "ज़ोन",
      searchTypeAlert: "चेतावनी",
      searchTypeIrrigation: "सिंचाई",
      searchTypePage: "वर्तमान पृष्ठ",
      searchListening: "सुन रहा है... खोजने के लिए बोलें।",
      searchUnsupported: "इस ब्राउज़र में वॉइस खोज समर्थित नहीं है।",
      searchFailed: "वॉइस खोज विफल हुई। माइक्रोफ़ोन अनुमति जांचें।",
      voiceReady: "वॉइस अलर्ट चुनी गई भाषा का उपयोग कर रहा है।",
      voiceUnavailable: "इस ब्राउज़र या डिवाइस में मेल खाती आवाज़ उपलब्ध नहीं है। कन्नड़ या हिंदी टेक्स्ट-टू-स्पीच आवाज़ इंस्टॉल करके फिर कोशिश करें।",
      quickSelectLand: "सक्रिय खेत चुनें",
      allLandsOverview: "सभी पंजीकृत खेत",
      notifications: "सूचनाएं",
      markAllRead: "सभी पढ़ा हुआ चिह्नित करें",
      systemStatus: "सिस्टम स्थिति: सामान्य",

      // Summary KPIs
      kpiTotalLands: "कुल खेत",
      kpiTotalZones: "निगरानी वाले ज़ोन",
      kpiNeedWater: "पानी की आवश्यकता वाले ज़ोन",
      kpiIrrigating: "वर्तमान में सिंचित ज़ोन",
      kpiWaterToday: "आज इस्तेमाल हुआ पानी",
      kpiActiveAlerts: "सक्रिय चेतावनियां",
      kpiStatus: "सिंचाई की स्थिति",
      statusOptimal: "सभी ढलान संतुलित हैं",
      statusActionNeeded: "कार्रवाई आवश्यक है",
      statusIrrigating: "सिंचाई चालू है",

      // Zone Names and Slope Positions
      zone1Name: "ज़ोन 1 – ऊपरी ढलान",
      zone2Name: "ज़ोन 2 – मध्य ढलान",
      zone3Name: "ज़ोन 3 – निचली ढलान",
      upperSlopeDesc: "ऊपरी सिरा – पानी तेजी से बह जाता है, जल्दी सूखने का जोखिम",
      middleSlopeDesc: "मध्यम ढलान – संतुलित नमी अवशोषण",
      lowerSlopeDesc: "निचला हिस्सा – पानी का जमाव और मिट्टी के कटाव का खतरा",

      // Status Badges
      moistureDry: "सूखा (पानी चाहिए)",
      moistureNormal: "उचित नमी",
      moistureWet: "अधिक नमी (संतृप्त)",
      valveOpen: "वाल्व खुला है",
      valveClosed: "वाल्व बंद है",
      valvePaused: "वाल्व रुका हुआ है",
      irrRunning: "सिंचाई चालू है",
      irrPaused: "सुरक्षा हेतु रुका",
      irrStopped: "सिंचाई बंद है",
      runoffNone: "कोई बहाव नहीं पाया गया",
      runoffDetected: "पानी का बहाव पाया गया!",
      runoffWarning: "कटाव का जोखिम",
      sensorOnline: "सेंसर ऑनलाइन",
      sensorOffline: "सेंसर डिस्कनेक्ट",
      controllerOnline: "ESP32 ऑनलाइन",
      controllerOffline: "ESP32 ऑफलाइन",

      // Land Details
      location: "स्थान",
      area: "क्षेत्रफल",
      crop: "फसल",
      cropArecanut: "सुपारी का बागान (Arecanut)",
      cropArecanutPepper: "सुपारी + काली मिर्च मिश्रित फसल",
      cropArecanutCocoa: "सुपारी + कोको मिश्रित फसल",
      controllerId: "कंट्रोलर आईडी",
      viewDashboard: "खेत डैशबोर्ड खोलें",
      editLand: "खेत संपादित करें",
      deleteLand: "खेत हटाएं",
      confirmDeleteLand: "क्या आप वाकई इस खेत को हटाना चाहते हैं? इसके 3 ज़ोन और सभी रिकॉर्ड मिट जाएंगे।",

      // Irrigation Controls
      modeAuto: "स्वचालित मोड (Auto)",
      modeManual: "मैनुअल मोड (Manual)",
      autoExplanation: "ऑटो मोड में नमी कम होने पर वाल्व अपने आप खुल जाता है और बारिश या बहाव का पता चलने पर तुरंत रुक जाता है।",
      btnStart: "सिंचाई शुरू करें",
      btnStop: "आपातकालीन रोक (Stop)",
      btnPause: "विराम दें",
      btnResume: "पुनः प्रारंभ करें",
      thresholdMin: "न्यूनतम नमी सीमा",
      thresholdTarget: "लक्षित नमी स्तर",
      maxDuration: "अधिकतम अनुमत समय",
      maxWaterLimit: "अधिकतम जल सीमा",
      cooldownTime: "सुरक्षा कूलडाउन समय",
      flowRate: "प्रवाह दर",
      lastUpdate: "अंतिम रीडिंग",
      irrDuration: "सिंचाई की अवधि",
      waterUsed: "खपत हुआ पानी",

      // Safety & Runoff
      safetyHeader: "ढलानदार भूमि सुरक्षा चक्र",
      safetyActive: "सुरक्षा तंत्र सक्रिय: अतिरिक्त जल बहाव पहचान, प्रवाह निगरानी, मिट्टी कटाव रोकथाम।",
      runoffAlertTitle: "निचली ढलान पर पानी के बहाव की चेतावनी",
      runoffAlertDesc: "निचले हिस्से में पानी जमा हो रहा है। कटाव रोकने के लिए ऊपरी ढलान की सिंचाई रोक दी गई है।",
      clearSafety: "चेतावनी की समीक्षा करें और हटाएं",

      // Weather
      weatherTitle: "मौसम और बारिश का अनुमान (Open-Meteo)",
      currentTemp: "वर्तमान तापमान",
      rainProbability: "बारिश की संभावना",
      expectedRain: "अनुमानित वर्षा",
      forecastSummary: "पूर्वानुमान विश्लेषण",
      rainExpectedAdvice: "आज भारी बारिश का अनुमान है! पानी बचाने के लिए सिंचाई को टाल दिया गया है।",
      noRainAdvice: "बारिश की संभावना कम है। सामान्य सिंचाई जारी रहेगी।",
      weatherUpdated: "मौसम अपडेट हुआ",

      // Recommendations
      recomTitle: "स्मार्ट कृषि अनुशंसाएं",
      priorityHigh: "उच्च प्राथमिकता",
      priorityMedium: "मध्यम प्राथमिकता",
      priorityLow: "सुझाव / सुधार",
      recomAction: "अनुशंसित कार्रवाई",

      // Analytics
      analyticsTitle: "जल उपयोग और मिट्टी नमी विश्लेषण",
      chartMoistureTitle: "ढलानों पर मिट्टी की नमी (% समय के साथ)",
      chartWaterUsageTitle: "दैनिक जल खपत (लीटर)",
      chartZoneComparison: "ढलान ज़ोन के अनुसार जल वितरण",
      chartLandComparison: "खेत के अनुसार जल खपत",
      exportCsvBtn: "रिकॉर्ड निर्यात करें (CSV)",
      waterSavingsTitle: "अनुमानित जल बचत",
      waterSavingsDesc: "पारंपरिक बाढ़ सिंचाई की तुलना में स्मार्टफार्म प्रणाली द्वारा बचाई गई जल मात्रा लगभग",
      filterToday: "आज",
      filterWeek: "इस सप्ताह",
      filterMonth: "इस माह",

      // Alerts Page
      alertsTitle: "चेतावनियां और सुरक्षा इतिहास",
      filterAllAlerts: "सभी चेतावनियां",
      filterUnresolved: "सक्रिय समस्याएं",
      filterResolved: "सुलझाई गई समस्याएं",
      resolveBtn: "हल हुआ",
      statusResolved: "हल किया गया",
      statusUnresolved: "सक्रिय",

      // Settings
      settingsTitle: "सिस्टम और हार्डवेयर सेटिंग्स",
      langSelectLabel: "वेबसाइट की भाषा",
      voiceSettings: "ध्वनि अलर्ट और स्पीच",
      voiceEnabled: "ध्वनि अलर्ट सक्षम करें",
      voiceTestBtn: "ध्वनि परीक्षण (Test Voice)",
      voiceLanguage: "ध्वनि भाषा टैग",
      hardwareApiEndpoint: "बैकएंड / ESP32 एंडपॉइंट",
      simulationSpeed: "सिमुलेशन गति",
      saveSettingsBtn: "प्राथमिकताएं सहेजें",

      // Units & Common
      acres: "एकड़",
      hectares: "हेक्टेयर",
      guntas: "गुंठा",
      litres: "लीटर",
      minutes: "मिनट",
      seconds: "सेकंड",
      percent: "%",
      celsius: "°C",
      mmPerHour: "मिमी",
      save: "सहेजें",
      cancel: "रद्द करें",
      close: "बंद करें",
      confirm: "पुष्टि करें",
      success: "सफलतापूर्वक सहेजा गया",
      error: "त्रुटि हुई",
      notAvailable: "अनुपलब्ध"
    }
  },

  // Helper method to retrieve translated text
  t(key, fallback = '') {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key] !== undefined) {
      return this.translations[lang][key];
    }
    if (this.translations.en && this.translations.en[key] !== undefined) {
      return this.translations.en[key];
    }
    return fallback || key;
  },

  setLanguage(lang) {
    if (['en', 'kn', 'hi'].includes(lang)) {
      this.currentLang = lang;
      try {
        localStorage.setItem('smartfarm_language', lang);
      } catch (e) {
        console.warn('LocalStorage unavailable for language persistence', e);
      }
      this.applyTranslations();
      return true;
    }
    return false;
  },

  initLanguage() {
    try {
      const saved = localStorage.getItem('smartfarm_language');
      if (saved && ['en', 'kn', 'hi'].includes(saved)) {
        this.currentLang = saved;
      }
    } catch (e) {}
  },

  // Walk the DOM and replace all elements with data-i18n attribute
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation) {
        if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
          el.value = translation;
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // Update document title
    document.title = `${this.t('appName')} – ${this.t('tagline')}`;

    // Dispatch event so active dynamic components can re-render
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
  }
};

// Auto initialize on script load
if (typeof window !== 'undefined') {
  I18N.initLanguage();
}
