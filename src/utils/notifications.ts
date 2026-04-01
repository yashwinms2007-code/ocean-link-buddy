/**
 * Enhanced Notification Utility for Mitra Platform
 * Handles browser notification permissions, sending alerts, and voice guidance.
 */

export const isNotificationSupported = () => {
  return "Notification" in window;
};

export const getNotificationPermissionStatus = () => {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return "unsupported";
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
};

/**
 * Send a browser notification with sound and vibration
 */
export const sendNotification = (
  title: string, 
  options?: NotificationOptions & { sound?: string; vibrate?: number[] | number }
) => {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    console.warn("Notifications not supported or permission not granted.");
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: "/mitra-logo.png",
      badge: "/mitra-logo.png",
      ...options,
    } as any); // Type cast to allow extended properties if browser supports them
    
    // Fallback vibration via navigator
    if (options?.vibrate && "vibrate" in navigator) {
      navigator.vibrate(options.vibrate as any);
    }

    // Play sound if provided
    if (options?.sound) {
      const audio = new Audio(options.sound);
      audio.play().catch(e => console.error("Sound play failed:", e));
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
};

/**
 * Text-to-Speech (TTS) Voice Alert Utility
 * Supports English, Kannada, and Hindi
 */
export const speakAlert = (text: string, langCode: "en" | "kn" | "hi" = "en") => {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech Synthesis not supported in this browser.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Map our language codes to browser-compatible BCP 47 tags
  const langMap = {
    en: "en-IN",
    kn: "kn-IN",
    hi: "hi-IN"
  };

  utterance.lang = langMap[langCode] || "en-IN";
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;

  // Try to find a high-quality local voice if available
  const voices = window.speechSynthesis.getVoices();
  const bestVoice = voices.find(v => v.lang.startsWith(utterance.lang) && v.localService);
  if (bestVoice) utterance.voice = bestVoice;

  window.speechSynthesis.speak(utterance);
};
