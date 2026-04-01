import { saveNotification } from "./notificationStorage";
import { sendNotification, speakAlert } from "@/utils/notifications";
import { Language } from "@/contexts/LanguageContext";

/**
 * Thresholds for different marine and weather conditions
 */
export const THRESHOLDS = {
  WAVE_HEIGHT: 3.0, // meters
  WIND_SPEED: 25.0, // knots
  STORM_PROBABILITY: 70, // percentage
};

/**
 * Alert translations (Internal for now, to avoid bloating Context during logic phase)
 */
const alertMsgs = {
  dangerousWaves: {
    en: "Dangerous Wave Height Detected",
    kn: "ಅಪಾಯಕಾರಿ ಅಲೆಯ ಎತ್ತರ ಪತ್ತೆಯಾಗಿದೆ",
    hi: "खतरनाक लहर की ऊँचाई का पता चला"
  },
  highWinds: {
    en: "Strong Winds Warning",
    kn: "ಬಲವಾದ ಗಾಳಿಯ ಎಚ್ಚರಿಕೆ",
    hi: "तेज हवाओं की चेतावनी"
  },
  stormApproaching: {
    en: "Storm Approaching Sector",
    kn: "ಬಿರುಗಾಳಿ ಬರುತ್ತಿದೆ",
    hi: "तूफ़ान आ रहा है"
  },
  emergencyNearby: {
    en: "CRITICAL: SOS Alert from Nearby Vessel",
    kn: "ತುರ್ತು: ಹತ್ತಿರದ ದೋಣಿಯಿಂದ SOS ಎಚ್ಚರಿಕೆ",
    hi: "महत्वपूर्ण: पास की नाव से एसओएस अलर्ट"
  },
  actionSeekShelter: {
    en: "Seek shelter and return to coast immediately.",
    kn: "ತಕ್ಷಣ ದಡಕ್ಕೆ ಹಿಂತಿರುಗಿ.",
    hi: "तुरंत तट पर लौटें और शरण लें।"
  }
};

/**
 * Trigger an alert based on condition data
 */
export const evaluateAlerts = async (
  data: { waveHeight?: number; windSpeed?: number; stormProb?: number },
  lang: Language = "en"
) => {
  const { waveHeight, windSpeed, stormProb } = data;

  // 1. WAVE HEIGHT ALERT
  if (waveHeight && waveHeight >= THRESHOLDS.WAVE_HEIGHT) {
    const title = alertMsgs.dangerousWaves[lang];
    const body = `${alertMsgs.actionSeekShelter[lang]} (${waveHeight}m)`;
    
    await triggerSystemAlert(title, body, "danger", lang);
  }

  // 2. WIND SPEED ALERT
  if (windSpeed && windSpeed >= THRESHOLDS.WIND_SPEED) {
    const title = alertMsgs.highWinds[lang];
    const body = `${alertMsgs.actionSeekShelter[lang]} (${windSpeed} knots)`;
    
    await triggerSystemAlert(title, body, "warning", lang);
  }

  // 3. STORM ALERT
  if (stormProb && stormProb >= THRESHOLDS.STORM_PROBABILITY) {
    const title = alertMsgs.stormApproaching[lang];
    const body = alertMsgs.actionSeekShelter[lang];
    
    await triggerSystemAlert(title, body, "danger", lang);
  }
};

/**
 * Handle a nearby SOS signal specifically
 */
export const triggerSOSAlert = async (
  details: { lat: number; lon: number; distance: number },
  lang: Language = "en"
) => {
  const title = alertMsgs.emergencyNearby[lang];
  const body = `Vessel located ${details.distance.toFixed(1)} KM away. Coords: ${details.lat}, ${details.lon}`;
  
  // SOS alerts get special treatment: Sound + Vibration + Voice
  speakAlert(title + ". " + alertMsgs.actionSeekShelter[lang], lang);
  
  await triggerSystemAlert(title, body, "danger", lang, { vibrate: [500, 200, 500, 200, 500] });
};

/**
 * Helper to consolidate all alert distribution (DB + UI + Browser)
 */
async function triggerSystemAlert(
  title: string, 
  body: string, 
  type: "danger" | "warning" | "info", 
  lang: Language,
  options?: any
) {
  // Save to IndexedDB (Offline capability)
  await saveNotification({
    title,
    body,
    type,
    data: options
  });

  // Browser Notification (Online/Background Sync later)
  sendNotification(title, {
    body,
    ...options
  });

  // Multilingual Voice Alert for danger/warning
  if (type === "danger" || type === "warning") {
    speakAlert(title, lang);
  }
}
