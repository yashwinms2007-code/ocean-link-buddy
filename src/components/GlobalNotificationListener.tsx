import React, { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchMarineWeather } from "@/services/marineWeatherService";
import { evaluateTelemetry, triggerAlert } from "@/utils/alertEngine";
import { setupGlobalSOSListener, SOSSignal, getDistance } from "@/services/sosService";

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

    // 3. Setup Global SOS Listener (Immediate alert for satellite & mesh signals)
    const cleanupSOS = setupGlobalSOSListener((signal: SOSSignal) => {
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

          // Alert if within 100km (Maritime rescue range)
          if (dist < 100) {
            triggerAlert(
              t("dangerAlert"),
              `${t("sosEmergency")}: ${dist.toFixed(1)}km ${t("distance")}. ${t("steerTo")}!`,
              "SOS",
              language
            );
            
            // Store active SOS for the Rescue Navigation UI
            localStorage.setItem("active_rescue_target", JSON.stringify({
              ...signal,
              distance: dist,
              receivedAt: Date.now()
            }));
          }
        });
      }
    });

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (cleanupSOS) cleanupSOS();
    };
  }, [language, t]);

  return null;
};

export default GlobalNotificationListener;
