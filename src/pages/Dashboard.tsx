import { useState, useEffect } from "react";
import { 
  Thermometer, Wind, Waves, Sun, AlertTriangle, 
  ArrowRight, Anchor, Timer, MessageSquare, MapPin,
  Clock, Zap, Cloud, CloudRain, CloudLightning, Droplets,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { 
  fetchMarineWeather, MarineData, MarineForecast, 
  getWeatherCondition, calculateMarineSafety 
} from "@/services/marineWeatherService";
import { saveNotification } from "@/services/notificationStorage";

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [weather, setWeather] = useState<MarineData | null>(null);
  const [forecast, setForecast] = useState<MarineForecast[]>([]);
  const [locationName, setLocationName] = useState<string>("");
  const [safety, setSafety] = useState<any>(null);
  const [captainName, setCaptainName] = useState<string>("Captain");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mitra_vessel_data");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.ownerName) setCaptainName(data.ownerName);
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      if (!navigator.geolocation) {
        handleFallback();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const { current, forecast, safety: safetyData } = await fetchMarineWeather(latitude, longitude);
          setWeather(current);
          setForecast(forecast);
          setSafety(safetyData);
          await reverseGeocode(latitude, longitude);
        },
        async () => {
          handleFallback();
        },
        { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
      );
    };

    const handleFallback = async () => {
      const { current, forecast, safety: safetyData } = await fetchMarineWeather(12.91, 74.85);
      setWeather(current);
      setForecast(forecast);
      setSafety(safetyData);
      setLocationName("Mangalore Port");
    };
    
    loadWeather();

    // ── Hourly weather auto-refresh ──
    const hourlyRefresh = setInterval(loadWeather, 60 * 60 * 1000); // Every 60 minutes
    return () => clearInterval(hourlyRefresh);
  }, []);

  // Weather Watcher: Auto-trigger alerts based on safety status
  useEffect(() => {
    if (!safety || safety.status === "SAFE") return;

    const lastAlertTime = localStorage.getItem("mitra_last_weather_alert_time");
    const lastAlertStatus = localStorage.getItem("mitra_last_weather_alert_status");
    
    // Only alert if status changed OR 4 hours passed since last alert
    const fourHours = 4 * 60 * 60 * 1000;
    const shouldAlert = !lastAlertTime || 
                        lastAlertStatus !== safety.status || 
                        (Date.now() - parseInt(lastAlertTime) > fourHours);

    if (shouldAlert) {
      saveNotification({
        title: safety.alert,
        body: safety.advice,
        type: safety.status === "DANGER" ? "danger" : "warning",
      });
      localStorage.setItem("mitra_last_weather_alert_time", Date.now().toString());
      localStorage.setItem("mitra_last_weather_alert_status", safety.status);
    }
  }, [safety]);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
      const data = await response.json();
      const addr = data.address;
      const name = addr.suburb || addr.city || addr.town || addr.village || addr.county || "Coastal Region";
      setLocationName(name);
    } catch (e) {
      setLocationName("Mangalore Port");
    }
  };

  const currentCondition = getWeatherCondition(weather?.weatherCode);

  const telemetry = [
    { label: t("temperature"), value: weather?.temperature ?? "--", unit: "°C", icon: Thermometer, color: "text-red-500" },
    { label: t("windSpeed"), value: weather?.windSpeed ?? "--", unit: "km/h", icon: Wind, color: "text-primary" },
    { label: t("seaState"), value: (weather?.waveHeight ?? 0) < 1.2 ? t("calm") : t("moderate"), unit: "", icon: Waves, color: "text-blue-500" },
    { label: t("humidity"), value: weather?.humidity ?? "--", unit: "%", icon: Droplets, color: "text-amber-500" },
    { label: t("rainfall"), value: weather?.precipitation ?? "--", unit: "mm", icon: CloudRain, color: "text-blue-400" },
  ];

  return (
    <div className="flex flex-col gap-10 pb-40 selection:bg-primary/20">
      {/* ── WELCOME BANNER ── */}
      <div className="px-6 pt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3.5rem] text-slate-950 shadow-xl relative overflow-hidden border-2 border-slate-100"
        >
           <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
           <div className="absolute bottom-0 right-0 p-8 opacity-10 scale-150">
              <currentCondition.icon size={80} strokeWidth={3} />
           </div>

           <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-[13px] font-black text-primary tracking-[0.3em] uppercase"
                    >
                       {t("coastalIntelligence")}
                    </motion.p>
                    <div className="h-1 w-8 bg-slate-100 rounded-full" />
                    <span className={`text-[12px] font-black uppercase tracking-widest ${currentCondition.color}`}>{currentCondition.label}</span>
                 </div>
                 
                 <motion.h1 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.3 }}
                   className="text-4xl font-black tracking-tighter leading-tight"
                 >
                    {t("welcomeBack")}<br />
                    {captainName} 👋
                 </motion.h1>
                 
                 <div className="flex items-center gap-2.5 py-2.5 px-5 bg-slate-950 text-white rounded-xl w-max shadow-lg">
                    <MapPin size={16} fill="currentColor" className={locationName && locationName !== "Locating..." ? "text-emerald-400" : "text-primary"} />
                    <span className="text-[12px] font-black uppercase tracking-widest leading-none">
                      {locationName === "Locating..." ? t("syncing") : `${t("locked")}: ${locationName}`}
                    </span>
                 </div>
              </div>
              
              <div className="flex gap-4">
                 <button 
                   onClick={() => navigate("/vessel")}
                   className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3"
                 >
                    <Anchor size={18} strokeWidth={2.5} /> {t("myVessel")}
                 </button>
                 <button 
                   onClick={() => navigate("/chatbot")}
                   className="bg-slate-50 text-slate-950 px-8 py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest border border-slate-200 active:scale-95 transition-all flex items-center gap-3"
                 >
                    <MessageSquare size={18} strokeWidth={2.5} /> AI BOT
                 </button>
              </div>
           </div>
        </motion.div>
      </div>

      {/* ── WEATHER OUTLOOK ── */}
      <div className="px-6 space-y-5">
         <div className="flex items-center justify-between px-6">
            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.4em]">{t("weatherOutlook")}</h3>
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-300 uppercase tracking-widest">
               <Clock size={12} /> {t("next8Hours")}
            </div>
         </div>
         
         <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
            {(forecast.length > 0 ? forecast.slice(0, 8) : Array(6).fill(null)).map((item, i) => {
              const condition = item ? getWeatherCondition(item.weatherCode) : { label: "--", icon: Zap, color: 'text-slate-200' };
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="min-w-[120px] bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-4 group hover:shadow-md transition-all"
                >
                   <span className="text-[11px] font-black text-slate-400 uppercase leading-none tracking-widest">{item?.time || "--:--"}</span>
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                      <condition.icon size={22} strokeWidth={2.5} className={condition.color} />
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none truncate w-full">{condition.label}</p>
                   </div>
                </motion.div>
              );
            })}
         </div>
      </div>

      {/* ── TELEMETRY GRID ── */}
      <div className="px-6 grid grid-cols-2 gap-5">
         <div className="col-span-2 px-6 flex items-center justify-between mb-1">
            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.4em]">{t("liveTelemetry")}</h3>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
         </div>
         {telemetry.map((item, i) => (
           <motion.div 
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 + (i * 0.1) }}
             key={item.label} 
             className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-lg transition-all group"
           >
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                    <item.icon size={22} strokeWidth={2.5} className={`${item.color} group-hover:scale-110 transition-transform`} />
                 </div>
                 <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                 <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{item.value}</p>
                 <span className="text-sm font-black text-slate-300 uppercase leading-none">{item.unit}</span>
              </div>
           </motion.div>
         ))}
      </div>

      {/* ── DYNAMIC ALERTS SECTION ── */}
      <div className="px-10 space-y-6">
         <div className="flex items-center justify-between px-4">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-3">
               <AlertTriangle size={18} className="text-red-500 animate-pulse" /> {t("emergencyAlerts")}
            </h3>
            <button onClick={() => navigate("/notifications")} className="text-[12px] font-black text-primary uppercase tracking-widest hover:underline">{t("history")}</button>
         </div>
         
         {safety && safety.status !== "SAFE" ? (
           <motion.div 
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             onClick={() => navigate("/notifications")}
             className={`p-8 rounded-[3rem] border flex items-center gap-6 cursor-pointer shadow-xl active:scale-95 transition-all ${safety.status === "DANGER" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}
           >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${safety.status === "DANGER" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                 <ShieldAlert size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="text-lg font-black text-slate-900 leading-none">{safety.alert}</h4>
                 <p className={`text-[12px] font-black uppercase tracking-widest mt-2 leading-none ${safety.status === "DANGER" ? "text-red-500" : "text-amber-600"}`}>
                   {safety.status === "DANGER" ? t("activeAlertCritical") : t("cautionMonitoring")}
                 </p>
                 <p className="text-[10px] text-slate-400 mt-2 font-bold truncate">{safety.advice}</p>
              </div>
              <ArrowRight size={20} className={safety.status === "DANGER" ? "text-red-300" : "text-amber-300"} />
           </motion.div>
         ) : (
           <div className="bg-slate-50 p-8 rounded-[3rem] border border-dashed border-slate-200 flex items-center justify-between">
              <div className="space-y-2">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("noListings")}</p>
                 <p className="text-[9px] text-slate-300 font-bold">{t("scanningTelemetry")}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{t("syncStatus")}</p>
                 <p className="text-[12px] font-black text-emerald-400 mt-1 uppercase tracking-tighter">{t("locked")}</p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default Dashboard;
