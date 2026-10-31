/**
 * SmartFarm Weather Integration Engine
 * Interacts with Open-Meteo API for real-time hyper-local agricultural rainfall forecasts.
 * Provides fallback handling so network disruption never blocks local sensor-based irrigation.
 */

const WeatherService = {
  cache: new Map(), // landId -> cached weather object
  cacheTtlMs: 15 * 60 * 1000, // 15 mins cache

  // Weather code interpretation (WMO codes from Open-Meteo)
  wmoDescriptions: {
    0: { en: "Clear sky", kn: "ಸ್ವಚ್ಛ ಆಕಾಶ", hi: "साफ आसमान", icon: "☀️" },
    1: { en: "Mainly clear", kn: "ಮುಖ್ಯವಾಗಿ ಸ್ಪಷ್ಟ ಆಕಾಶ", hi: "मुख्य रूप से साफ", icon: "🌤️" },
    2: { en: "Partly cloudy", kn: "ಭಾಗಶಃ ಮೋಡ", hi: "आंशिक रूप से बादल", icon: "⛅" },
    3: { en: "Overcast", kn: "ಮೋಡ ಕವಿದ ಆಕಾಶ", hi: "घने बादल", icon: "☁️" },
    45: { en: "Foggy", kn: "ದಟ್ಟ ಮಂಜು", hi: "कोहरा", icon: "🌫️" },
    51: { en: "Light drizzle", kn: "ಸಣ್ಣ ಹನಿಮಳೆ", hi: "हल्की बूंदाबांदी", icon: "🌦️" },
    53: { en: "Moderate drizzle", kn: "ಸಾಧಾರಣ ತುಂತುರು ಮಳೆ", hi: "मध्यम बूंदाबांदी", icon: "🌦️" },
    61: { en: "Slight rain", kn: "ಸಾಧಾರಣ ಮಳೆ", hi: "हल्की बारिश", icon: "🌧️" },
    63: { en: "Moderate rain", kn: "ಮಧ್ಯಮ ಮಳೆ", hi: "मध्यम बारिश", icon: "🌧️" },
    65: { en: "Heavy rain", kn: "ಭಾರೀ ಮಳೆ", hi: "भारी बारिश", icon: "⛈️" },
    80: { en: "Rain showers", kn: "ಧಾರಾಕಾರ ಮಳೆ", hi: "तेज़ बौछारें", icon: "🌧️" },
    95: { en: "Thunderstorm", kn: "ಗುಡುಗು ಸಹಿತ ಮಳೆ", hi: "तूफान और बारिश", icon: "🌩️" }
  },

  getWeatherDescription(code, lang = 'en') {
    const item = this.wmoDescriptions[code] || { en: "Cloudy", kn: "ಮೋಡಯುಕ್ತ", hi: "बादल", icon: "⛅" };
    return {
      text: item[lang] || item.en,
      icon: item.icon
    };
  },

  /**
   * Fetch weather forecast for a land based on coordinates
   */
  async getForecastForLand(land) {
    const lat = land.latitude || 13.693; // Thirthahalli / Malnad default arecanut belt
    const lon = land.longitude || 75.244;
    const cacheKey = `${land.id}_${lat.toFixed(2)}_${lon.toFixed(2)}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    if (cached && (now - cached.timestamp < this.cacheTtlMs)) {
      return cached.data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;

      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP status: ${response.status}`);
      }

      const json = await response.json();

      const processed = {
        status: "online",
        source: "Open-Meteo Live API",
        latitude: lat,
        longitude: lon,
        current: {
          temp: Math.round(json.current.temperature_2m),
          humidity: Math.round(json.current.relative_humidity_2m),
          precipitation: json.current.precipitation,
          weatherCode: json.current.weather_code,
          windSpeed: json.current.wind_speed_10m,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        daily: json.daily.time.slice(0, 5).map((dateStr, idx) => ({
          date: dateStr,
          dayName: new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' }),
          maxTemp: Math.round(json.daily.temperature_2m_max[idx]),
          minTemp: Math.round(json.daily.temperature_2m_min[idx]),
          precipSum: json.daily.precipitation_sum[idx],
          precipProb: json.daily.precipitation_probability_max[idx],
          weatherCode: json.daily.weather_code[idx]
        })),
        next24hRainProbMax: Math.max(...(json.hourly.precipitation_probability.slice(0, 24) || [0])),
        next24hRainSum: (json.hourly.precipitation.slice(0, 24).reduce((a, b) => a + b, 0)).toFixed(1),
        lastFetched: new Date().toLocaleTimeString()
      };

      this.cache.set(cacheKey, { timestamp: now, data: processed });
      return processed;
    } catch (err) {
      console.warn(`Weather API offline or blocked for land ${land.id}:`, err.message);

      // Graceful fallback weather simulation for agricultural slope demo
      const fallback = {
        status: "offline_fallback",
        source: "Offline Meteorological Estimate",
        latitude: lat,
        longitude: lon,
        current: {
          temp: 28,
          humidity: 78,
          precipitation: 0.0,
          weatherCode: 2,
          windSpeed: 8.5,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        daily: [
          { date: "Today", dayName: "Today", maxTemp: 30, minTemp: 22, precipSum: 2.5, precipProb: 35, weatherCode: 2 },
          { date: "Tomorrow", dayName: "Tomorrow", maxTemp: 29, minTemp: 21, precipSum: 14.0, precipProb: 75, weatherCode: 61 },
          { date: "+2d", dayName: "Day 3", maxTemp: 28, minTemp: 21, precipSum: 18.2, precipProb: 80, weatherCode: 63 }
        ],
        next24hRainProbMax: 40,
        next24hRainSum: 3.5,
        lastFetched: "Cached / Fallback",
        errorNote: "Live weather service unreachable. Local slope moisture sensors governing irrigation safety."
      };

      return fallback;
    }
  },

  /**
   * Determine whether rain forecast suggests delaying irrigation on sloping land
   */
  shouldDelayIrrigationForRain(weatherData) {
    if (!weatherData) return { delay: false };
    const rainProb = weatherData.next24hRainProbMax || 0;
    const rainSum = parseFloat(weatherData.next24hRainSum || 0);

    // If rain probability > 65% and expected rainfall >= 8mm in next 24 hours, recommend delay
    if (rainProb >= 65 && rainSum >= 8) {
      return {
        delay: true,
        reasonEn: `High rainfall expected (${rainSum} mm, ${rainProb}% probability). Delaying irrigation avoids downhill runoff and saves water.`,
        reasonKn: `ಹೆಚ್ಚಿನ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ (${rainSum} ಮಿಮೀ, ${rainProb}% ಸಂಭವನೀಯತೆ). ನೀರಾವರಿ ಮುಂದೂಡುವುದರಿಂದ ನೀರು ಪೋಲಾಗುವುದು ಮತ್ತು ಮಣ್ಣಿನ ಸವೆತ ತಡೆಯಬಹುದು.`,
        reasonHi: `भारी बारिश का अनुमान है (${rainSum} मिमी, ${rainProb}% संभावना)। सिंचाई टालने से ढलान पर बहाव रुकेगा और पानी बचेगा।`
      };
    }
    return { delay: false };
  }
};
