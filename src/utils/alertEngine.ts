import { toast } from "sonner";

export interface AlertThresholds {
  waveHeight: number;
  windSpeed: number;
  rain: number;
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  waveHeight: 3.0, // Dangerous if > 3m
  windSpeed: 25.0, // Dangerous if > 25kn
  rain: 5.0,       // Dangerous if > 5mm/h
};

/**
 * Triggers a multi-modal alert (UI + Audio + Vibration)
 */
export const triggerAlert = (
  title: string,
  message: string,
  type: "DANGER" | "WARNING" | "SOS",
  language: string = "en"
) => {
  // 1. UI Toast
  toast.error(title, {
    description: message,
    duration: 10000,
  });

  // 2. Audible Alert (Multilingual Voice)
  if ("speechSynthesis" in window) {
    const speech = new SpeechSynthesisUtterance(`${title}. ${message}`);
    if (language === "kn") speech.lang = "kn-IN";
    else if (language === "hi") speech.lang = "hi-IN";
    else speech.lang = "en-IN";
    
    speech.rate = 1.2;
    window.speechSynthesis.speak(speech);
  }

  // 3. Physical Feedback (Vibration)
  if (navigator.vibrate) {
    if (type === "DANGER" || type === "SOS") {
      navigator.vibrate([500, 200, 500, 200, 500]);
    } else {
      navigator.vibrate(500);
    }
  }
};

/**
 * Main Evaluation Logic
 */
export const evaluateTelemetry = (
  data: { waveHeight: number; windSpeed: number; rain: number },
  lang: string,
  t: (k: string) => string
) => {
  if (data.waveHeight > DEFAULT_THRESHOLDS.waveHeight) {
    triggerAlert(
      t("dangerAlert"),
      "High waves detected. Avoid going to sea.",
      "DANGER",
      lang
    );
    return true;
  }

  if (data.windSpeed > DEFAULT_THRESHOLDS.windSpeed) {
    triggerAlert(
      t("highWindAlert"),
      "Dangerous winds detected. Stay near coast.",
      "DANGER",
      lang
    );
    return true;
  }

  return false;
};
