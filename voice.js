/**
 * SmartFarm Voice Alert Engine
 * Uses the Web SpeechSynthesis API with support for Kannada (kn-IN), Hindi (hi-IN), and English (en-IN / en-US).
 * Includes deduplication, safety decoupling, and graceful text-only fallback.
 */

const VoiceAlerts = {
  enabled: true,
  volume: 1.0,
  rate: 0.95, // Slightly slower for clear agricultural announcement
  pitch: 1.0,
  recentSpokenAlerts: new Map(), // key -> timestamp to prevent repeating spam
  cooldownMs: 45000, // 45 seconds cooldown for identical alerts
  voicesLoaded: false,
  availableVoices: [],
  language: 'en',

  updateLanguageStatus(messageKey) {
    const status = document.getElementById('voiceLanguageStatus');
    if (status) status.textContent = I18N.t(messageKey);
  },

  init() {
    let savedLanguage = null;
    try {
      const savedPref = localStorage.getItem('smartfarm_voice_enabled');
      if (savedPref !== null) {
        this.enabled = savedPref === 'true';
      }
      savedLanguage = localStorage.getItem('smartfarm_voice_language');
    } catch (e) {}

    this.language = ['en', 'kn', 'hi'].includes(savedLanguage) ? savedLanguage : (I18N.currentLang || 'en');

    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        this.availableVoices = window.speechSynthesis.getVoices();
        this.voicesLoaded = this.availableVoices.length > 0;
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      console.warn('SpeechSynthesis API not supported by browser.');
    }
  },

  setEnabled(val) {
    this.enabled = !!val;
    try {
      localStorage.setItem('smartfarm_voice_enabled', this.enabled.toString());
    } catch (e) {}
    if (!this.enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  setLanguage(lang, persist = true) {
    if (!['en', 'kn', 'hi'].includes(lang)) return false;
    this.language = lang;
    if (persist) {
      try {
        localStorage.setItem('smartfarm_voice_language', lang);
      } catch (e) {}
    }
    return true;
  },

  getLanguageTag(lang = this.language) {
    return { kn: 'kn-IN', hi: 'hi-IN', en: 'en-IN' }[lang] || 'en-US';
  },

  /**
   * Find the best voice matching target language
   */
  getBestVoice(langCode) {
    if (!this.availableVoices || this.availableVoices.length === 0) {
      if ('speechSynthesis' in window) {
        this.availableVoices = window.speechSynthesis.getVoices();
      }
    }

    const langMap = {
      'kn': ['kn-IN', 'kn'],
      'hi': ['hi-IN', 'hi'],
      'en': ['en-IN', 'en-US', 'en-GB', 'en']
    };

    const targetTags = langMap[langCode] || ['en-US'];

    // Search exact match
    for (const tag of targetTags) {
      const match = this.availableVoices.find(v => v.lang.toLowerCase() === tag.toLowerCase());
      if (match) return match;
    }

    // Search prefix match
    for (const tag of targetTags) {
      const prefix = tag.split('-')[0].toLowerCase();
      const match = this.availableVoices.find(v => v.lang.toLowerCase().startsWith(prefix));
      if (match) return match;
    }

    return null;
  },

  /**
   * Speak an alert message in current language
   * @param {Object} alertOptions - { textKn, textHi, textEn, alertKey, priority }
   */
  announce(alertOptions) {
    if (!this.enabled) return false;
    if (!('speechSynthesis' in window)) return false;

    const currentLang = this.language || I18N.currentLang || 'en';
    let textToSpeak = '';

    if (currentLang === 'kn' && alertOptions.textKn) {
      textToSpeak = alertOptions.textKn;
    } else if (currentLang === 'hi' && alertOptions.textHi) {
      textToSpeak = alertOptions.textHi;
    } else {
      textToSpeak = alertOptions.textEn || alertOptions.text || '';
    }

    if (!textToSpeak) return false;

    // Deduplication check
    const alertKey = `${currentLang}:${alertOptions.alertKey || textToSpeak}`;
    const now = Date.now();
    const lastSpoken = this.recentSpokenAlerts.get(alertKey);

    if (lastSpoken && (now - lastSpoken) < this.cooldownMs) {
      // Skipped due to repetition cooldown
      return false;
    }

    this.recentSpokenAlerts.set(alertKey, now);

    try {
      // Cancel previous speech if higher priority
      if (alertOptions.priority === 'high' || alertOptions.priority === 'critical') {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.volume = this.volume;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      utterance.lang = this.getLanguageTag(currentLang);

      const voice = this.getBestVoice(currentLang);
      if (currentLang !== 'en' && !voice) {
        this.updateLanguageStatus('voiceUnavailable');
        return false;
      }
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
      };

      window.speechSynthesis.speak(utterance);
      this.updateLanguageStatus('voiceReady');
      return true;
    } catch (err) {
      console.error('Error invoking speech synthesis:', err);
      return false;
    }
  },

  /**
   * Test Voice button in Settings or top bar
   */
  testVoice() {
    const currentLang = this.language || I18N.currentLang || 'en';
    const samples = {
      kn: {
        textKn: "ಸ್ಮಾರ್ಟ್‌ಫಾರ್ಮ್ ಧ್ವನಿ ಎಚ್ಚರಿಕೆ ವ್ಯವಸ್ಥೆ ಯಶಸ್ವಿಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.",
        alertKey: "test_voice_kn",
        priority: "high"
      },
      hi: {
        textHi: "स्मार्टफार्म ध्वनि चेतावनी प्रणाली सफलतापूर्वक काम कर रही है।",
        alertKey: "test_voice_hi",
        priority: "high"
      },
      en: {
        textEn: "SmartFarm voice alert system is operating normally.",
        alertKey: "test_voice_en",
        priority: "high"
      }
    };

    return this.announce(samples[currentLang] || samples.en);
  }
};

// Auto initialize
if (typeof window !== 'undefined') {
  VoiceAlerts.init();
}
