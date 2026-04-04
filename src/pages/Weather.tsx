import { useState, useEffect } from "react";
import { 
  Wind, Droplets, Thermometer, Waves, Navigation, 
  MapPin, Clock, AlertTriangle, ArrowUpRight, Compass,
  Activity, CloudRain, Sun, Zap, Info, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchMarineWeather, MarineData, SafetyStatus } from "@/services/marineWeatherService";
import { toast } from "sonner";

const Weather = () => {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<MarineData | null>(null);
  const [safety, setSafety] = useState<SafetyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>("");

  useEffect(() => {
    loadWeatherData();
  }, []);

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

  const loadWeatherData = async () => {
    setLoading(true);
    if (!navigator.geolocation) {
      handleFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const data = await fetchMarineWeather(latitude, longitude);
        setWeather(data.current);
        setSafety(data.safety);
        await reverseGeocode(latitude, longitude);
        setLoading(false);
      },
      async () => {
        handleFallback();
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const handleFallback = async () => {
    const data = await fetchMarineWeather(12.91, 74.85); // Mangalore Fallback
    setWeather(data.current);
    setSafety(data.safety);
    setLocationName("Mangalore Port");
    setLoading(false);
  };

  const stats = [
    { label: t("temperature"), value: weather?.temperature ?? "--", unit: "°C", icon: Thermometer, color: "text-rose-400" },
    { label: t("waveHeight"), value: weather?.waveHeight ?? "--", unit: "m", icon: Waves, color: "text-blue-400" },
    { label: t("windSpeed"), value: weather?.windSpeed ?? "--", unit: "km/h", icon: Wind, color: "text-teal-400" },
    { label: t("rainfall"), value: weather?.precipitation ?? "--", unit: "mm", icon: CloudRain, color: "text-blue-500" },
    { label: t("humidity"), value: weather?.humidity ?? "--", unit: "%", icon: Droplets, color: "text-emerald-400" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-40 selection:bg-primary/20">
      {/* ── REFINED WEATHER HERO ── */}
      <div className="bg-slate-900 border-b border-white/10 p-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight uppercase leading-none">{t("weather")}</h1>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
               <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest leading-none">{t("syncing")}</p>
            </div>
          </div>
          <button 
            onClick={loadWeatherData} 
            className={`p-4 glass-dark rounded-2xl border border-white/10 text-white transition-all active:scale-95 z-20 ${loading ? 'animate-spin' : ''}`}
          >
             <Zap size={20} />
          </button>
        </div>

        {/* Current Location HUD */}
        <div className="glass-dark p-6 rounded-[2.5rem] border border-white/5 relative z-10 flex items-center gap-5 shadow-lg">
           <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <MapPin size={28} />
           </div>
           <div className="flex-1">
              <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">{t("monitoringStation")}</p>
              <h2 className="text-2xl font-black text-white tracking-tighter truncate leading-tight">
                 {loading ? t("syncing") : locationName}
              </h2>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{t("syncStatus")}</p>
              <p className="text-[12px] font-black text-emerald-400 mt-1 uppercase tracking-tighter">{t("locked")}: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
           </div>
        </div>
      </div>

      {/* ── REFINED SAFETY CARD ── */}
      <div className="px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-8 rounded-[3rem] border-2 shadow-lg flex items-center justify-between transition-colors overflow-hidden relative ${safety?.status === 'SAFE' ? 'bg-emerald-50/40 border-emerald-100/50' : 'bg-red-50/40 border-red-100/50'}`}
        >
           <div className="relative z-10 flex items-center gap-5">
              <div className={`w-16 h-16 ${safety?.status === 'SAFE' ? 'bg-emerald-100' : 'bg-red-100'} rounded-2xl flex items-center justify-center ${safety?.status === 'SAFE' ? 'text-emerald-500' : 'text-red-500'} shadow-sm`}>
                 {safety?.status === 'SAFE' ? <ShieldCheck size={28} strokeWidth={2.5} /> : <AlertTriangle size={28} strokeWidth={2.5} />}
              </div>
              <div>
                 <p className={`text-[12px] font-black uppercase tracking-widest ${safety?.status === 'SAFE' ? 'text-emerald-600/60' : 'text-red-600/60'}`}>{t("missionVerdict")}</p>
                 <h3 className={`text-2xl font-black tracking-tight leading-none mt-1 ${safety?.status === 'SAFE' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {safety?.alert || t("analyzingRisk")}
                 </h3>
              </div>
           </div>
           <div className="relative z-10">
              <div className={`p-3 rounded-xl ${safety?.status === 'SAFE' ? 'bg-emerald-100/50 text-emerald-600' : 'bg-red-100/50 text-red-600'}`}>
                 <Activity size={20} />
              </div>
           </div>
        </motion.div>
      </div>

      {/* ── METRICS GRID ── */}
      <div className="px-6 grid grid-cols-2 gap-4">
         {stats.map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className={`bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-lg transition-all group ${i === 4 ? 'col-span-2 flex-row items-center justify-between' : ''}`}
           >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                    <stat.icon size={20} className={`${stat.color} group-hover:scale-110 transition-transform`} />
                 </div>
                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                 <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
                 <span className="text-[11px] font-black text-slate-300 uppercase leading-none">{stat.unit}</span>
              </div>
           </motion.div>
         ))}
      </div>

      {/* ── EXTENDED DATA ── */}
      <div className="px-10 space-y-6 pb-10">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">{t("liveTelemetry")}</h3>
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{t("globalSync")}</span>
         </div>
         
         <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white space-y-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-teal-500 to-primary animate-shimmer" />
            
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-teal-400 group-hover:rotate-12 transition-transform shadow-inner"><Compass size={20} /></div>
                  <div>
                     <p className="text-lg font-black leading-none">14.5kts</p>
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1.5 leading-none">{t("oceanCurrents")}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-rose-400 group-hover:rotate-[-12deg] transition-transform shadow-inner"><ArrowUpRight size={20} /></div>
                  <div>
                     <p className="text-lg font-black leading-none">NNW 15°</p>
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1.5 leading-none">{t("windVector")}</p>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-inner">
               <div className="flex items-center gap-3">
                  <Clock size={16} className="text-slate-500" />
                  <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-none">{t("nextTide")}</span>
               </div>
               <span className="text-[12px] font-black text-teal-400 leading-none">{t("inMins").replace('{mins}', '45')}</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Weather;
