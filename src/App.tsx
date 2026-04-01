import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
<<<<<<< HEAD
import GlobalNotificationListener from "@/components/GlobalNotificationListener";
import GlobalSafetyBarrier from "@/components/GlobalSafetyBarrier";
=======
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
<<<<<<< HEAD
import Layout from "@/components/Layout";

=======
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
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

<<<<<<< HEAD
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <GlobalNotificationListener />
          <GlobalSafetyBarrier />
          <AppRoutes />
        </TooltipProvider>
      </LanguageProvider>
    </BrowserRouter>
=======
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
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
  </QueryClientProvider>
);

export default App;
