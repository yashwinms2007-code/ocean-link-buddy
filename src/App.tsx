import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sea-map" element={<SeaMap />} />
            <Route path="/fish-detection" element={<FishDetection />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/fish-market" element={<FishMarket />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
