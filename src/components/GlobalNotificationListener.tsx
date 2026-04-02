import React, { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchMarineWeather } from "@/services/marineWeatherService";
import { evaluateTelemetry, triggerAlert } from "@/utils/alertEngine";
import { setupMeshListener, SOSSignal, getDistance } from "@/services/sosService";

/**
 * 🌊 Background Notification Listener
 * Polling Interval: 10 minutes (Fuses Marine API data)
 * Real-time Mesh: Nearby SOS signals
 * Respects: mitra_notifications, mitra_voiceGuide settings
 */
const GlobalNotificationListener: React.FC = () => {
  const { language, t } = useLanguage();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request Notification Permission on Mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Maritime System Alerts Enabled.");
        }
      });
    }
  }, []);

  useEffect(() => {
    const checkSeaConditions = async () => {
      // Respect notification setting
      const notifEnabled = localStorage.getItem("mitra_notifications") !== "false";
      if (!notifEnabled) return;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { current } = await fetchMarineWeather(
            pos.coords.latitude,
            pos.coords.longitude
          );

          if (current) {
            evaluateTelemetry(
              {
                waveHeight: current.waveHeight,
                windSpeed: current.windSpeed ?? 12.0,
                rain: 0.0,
              },
              language,
              t
            );
          }
        });
      }
    };

    // 1. Initial check on mount
    checkSeaConditions();

    // 2. Setup 10-minute interval polling
    pollingIntervalRef.current = setInterval(checkSeaConditions, 600000);

    // 3. Setup Mesh SOS Listener (Immediate alert for nearby users)
    setupMeshListener((signal: SOSSignal) => {
      const notifEnabled = localStorage.getItem("mitra_notifications") !== "false";
      if (!notifEnabled) return;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const dist = getDistance(
            pos.coords.latitude,
            pos.coords.longitude,
            signal.lat,
            signal.lon
          );

          if (dist < 50) {
            triggerAlert(
              "🚨 NEARBY SOS",
              `Vessel in distress ${dist.toFixed(1)}km away. Please respond!`,
              "SOS",
              language
            );
          }
        });
      }
    });

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [language, t]);

  return null;
};

export default GlobalNotificationListener;
