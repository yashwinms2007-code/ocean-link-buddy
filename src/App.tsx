import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { setupGlobalSOSListener, SOSSignal } from "@/services/sosService";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LowPowerProvider } from "@/contexts/LowPowerContext";
import Layout from "./components/Layout";
import GlobalNotificationListener from "@/components/GlobalNotificationListener";
import GlobalSafetyBarrier from "@/components/GlobalSafetyBarrier";
import TopHeader from "./components/TopHeader";
import Splash from "./pages/Splash";
import Dashboard from "./pages/Dashboard";
import Weather from "./pages/Weather";
import SOS from "./pages/SOS";
import Profile from "./pages/Profile";
import SeaMap from "./pages/SeaMap";
import FishDetection from "./pages/FishDetection";
import Safety from "./pages/Safety";
import FishMarket from "./pages/FishMarket";
import Chatbot from "./pages/Chatbot";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import MyVessel from "./pages/MyVessel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/weather" element={<Layout><Weather /></Layout>} />
      <Route path="/sos" element={<Layout><SOS /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/sea-map" element={<Layout><SeaMap /></Layout>} />
      <Route path="/fish-detection" element={<Layout><FishDetection /></Layout>} />
      <Route path="/safety" element={<Layout><Safety /></Layout>} />
      <Route path="/fish-market" element={<Layout><FishMarket /></Layout>} />
      <Route path="/chatbot" element={<Layout><Chatbot /></Layout>} />
      <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="/vessel" element={<Layout><MyVessel /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// ─── Global SOS Alert Banner & Native Push Notification ────────────────────────
const GlobalSOSListener = () => {
  const navigate = useNavigate();

  // Ask for notification permission early
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleIncomingSOS = useCallback((signal: SOSSignal) => {
    // 1. In-App Visual Alert
    import("sonner").then(({ toast }) => {
      toast.error(
        `🆘 MAYDAY — Vessel in distress nearby! Danger: ${signal.danger}`,
        {
          duration: 15000,
          action: {
            label: "View Map",
            onClick: () => navigate("/sos"),
          },
        }
      );
    });

    // 2. Hardware / Lock Screen Native Push Notification
    if ("Notification" in window && Notification.permission === "granted") {
      const notifTitle = "🆘 MAYDAY: VESSEL IN DISTRESS";
      const notifOptions = {
        body: `Emergency Alert! Danger level: ${signal.danger}. Tap to open the SOS map immediately.`,
        icon: "/favicon.png",
        badge: "/favicon.png",
        vibrate: [500, 250, 500, 250, 500, 250, 1000], // SOS morse code vibration
        requireInteraction: true // Keeps notification open until clicked
      };

      // If app is installed as PWA, service worker can show rich notification
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(notifTitle, notifOptions);
        });
      } else {
        // Fallback for standard desktop browsers
        const n = new Notification(notifTitle, notifOptions);
        n.onclick = () => {
          window.focus();
          navigate("/sos");
        };
      }
    }
  }, [navigate]);

  useEffect(() => {
    const cleanup = setupGlobalSOSListener(handleIncomingSOS);
    return cleanup;
  }, [handleIncomingSOS]);

  return null;
};

const App = () => {
  useEffect(() => {
    // FORCE FAVICON UPDATE (Bypasses Sticky Caching)
    const updateFavicon = () => {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = `/favicon.png?v=${Date.now()}`;
      if (!link.parentNode) {
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    };
    updateFavicon();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <LowPowerProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <GlobalNotificationListener />
            <GlobalSafetyBarrier />
            <GlobalSOSListener />
            <AppRoutes />
            </TooltipProvider>
          </LowPowerProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
