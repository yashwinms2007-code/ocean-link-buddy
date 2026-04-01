<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Fish, 
  CloudSun, 
  Map as MapIcon, 
  AlertTriangle, 
  LifeBuoy, 
  ShoppingCart, 
  Settings, 
  Bot, 
  Bell,
  Waves,
  Zap,
  Navigation,
  Globe,
  Radio,
  Activity,
  ShieldCheck,
  TrendingUp,
  Wind
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { fetchMarineWeather, MarineData, SafetyStatus } from "@/services/marineWeatherService";
import { toast } from "sonner";
=======
import { useNavigate } from "react-router-dom";
import { Fish, CloudSun, Map, AlertTriangle, LifeBuoy, ShoppingCart, Settings, Bot, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BottomNav from "@/components/BottomNav";
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
<<<<<<< HEAD
  const [marineData, setMarineData] = useState<MarineData | null>(null);
  const [safety, setSafety] = useState<SafetyStatus | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const loadData = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { current, safety: safetyStatus } = await fetchMarineWeather(pos.coords.latitude, pos.coords.longitude);
            setMarineData(current);
            setSafety(safetyStatus);
          },
          async () => {
            const { current, safety: safetyStatus } = await fetchMarineWeather(12.9141, 74.8560);
            setMarineData(current);
            setSafety(safetyStatus);
          }
        );
      }
    };
    loadData();
    const interval = setInterval(loadData, 600000); // 10 min refresh
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(interval);
    };
  }, []);

  const menuItems = [
    { icon: Bot, label: t("chatbot"), path: "/chatbot", color: "bg-primary/20 text-primary", desc: "Voice AI Helper" },
    { icon: AlertTriangle, label: t("sosEmergency"), path: "/sos", color: "bg-red-500/20 text-red-500", desc: "Multi-Channel SOS" },
    { icon: Fish, label: t("fishDetection"), path: "/fish-detection", color: "bg-blue-500/20 text-blue-400", desc: "INCOIS Fusion AI" },
    { icon: CloudSun, label: t("weather"), path: "/weather", color: "bg-sky-500/20 text-sky-400", desc: "Scientific Forecast" },
    { icon: ShoppingCart, label: t("fishMarket"), path: "/fish-market", color: "bg-teal-500/20 text-teal-400", desc: "Direct Trade" },
    { icon: LifeBuoy, label: t("safety"), path: "/safety", color: "bg-green-500/20 text-green-400", desc: "Risk Training" },
    { icon: MapIcon, label: t("seaMap"), path: "/sea-map", color: "bg-cyan-500/20 text-cyan-400", desc: "Dark-Mode Tracking" },
    { icon: Settings, label: t("settings"), path: "/settings", color: "bg-slate-500/20 text-slate-400", desc: "System Config" },
  ];

  const safetyColor = safety?.status === 'SAFE' ? 'text-green-400' : safety?.status === 'MODERATE' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex flex-col gap-6 selection:bg-primary/30">
      {/* ── HEADER & COMMAND CENTER HUD ── */}
      <div className="bg-slate-900 border-b border-white/10 p-6 rounded-b-[4rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">{t("appName")}</h1>
            <p className="text-primary text-[10px] font-black tracking-[0.4em] mt-2 opacity-80">{t("tagline").toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-3">
             {/* Vessel Status Matrix */}
             <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                <div className="flex flex-col items-center">
                  <Globe size={12} className={isOnline ? "text-green-400" : "text-slate-500"} />
                  <span className="text-[6px] font-black uppercase mt-1">Net</span>
                </div>
                <div className="flex flex-col items-center">
                  <Navigation size={12} className="text-primary" />
                  <span className="text-[6px] font-black uppercase mt-1">GPS</span>
                </div>
                <div className="flex flex-col items-center">
                  <Radio size={12} className="text-blue-400" />
                  <span className="text-[6px] font-black uppercase mt-1">Mesh</span>
                </div>
             </div>
             
             <button 
               onClick={() => navigate("/notifications")}
               className="p-3.5 glass-dark rounded-2xl relative group border border-white/10"
             >
               <Bell size={24} className="text-white group-hover:scale-110 transition-transform" />
               <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
             </button>
          </div>
        </div>

        {/* Live Telemetry Matrix */}
        <div className="grid grid-cols-4 gap-3 mb-8">
           {[
             { icon: Waves, label: 'Wave', value: marineData?.waveHeight || '1.2', unit: 'm', color: 'text-primary' },
             { icon: Wind, label: 'Wind', value: '12', unit: 'kn', color: 'text-teal-400' },
             { icon: TrendingUp, label: 'Current', value: marineData?.currentVelocity || '0.3', unit: 'm/s', color: 'text-orange-400' },
             { icon: Activity, label: 'SST', value: marineData?.sst || '28.5', unit: '°C', color: 'text-red-400' },
           ].map((stat, i) => (
             <div key={i} className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <stat.icon size={16} className={`${stat.color} mb-1`} />
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                <span className="text-xs font-black text-white">{stat.value}<span className="text-[8px] ml-0.5 opacity-50">{stat.unit}</span></span>
             </div>
           ))}
        </div>

        {/* Dynamic Safety Ticker */}
        <button 
          onClick={() => navigate("/weather")}
          className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] flex items-center gap-4 group hover:bg-white/[0.08] transition-all"
        >
           <div className={`p-3 rounded-xl bg-white/5 ${safetyColor}`}>
              <ShieldCheck size={20} className={safety?.status === 'DANGER' ? 'animate-bounce' : ''} />
           </div>
           <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                 <span className={`text-[8px] font-black uppercase tracking-widest ${safetyColor}`}>Sea State: {safety?.status || 'SCANNING...'}</span>
              </div>
              <p className="text-[10px] font-bold text-white tracking-tight leading-tight mt-0.5 group-hover:text-primary transition-colors">
                {safety?.alert || 'Synchronizing with MAR-ECMWF oceanographic data...'}
              </p>
           </div>
           <Zap size={14} className="text-slate-600 group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Main Grid */}
      <div className="px-5 pb-12 mt-[-20px] relative z-20">
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="glass-dark p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 active:scale-95 transition-all border border-white/5 shadow-2xl group hover:border-primary/30 relative overflow-hidden"
              >
                {/* Micro-interaction background glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-current ${item.color.split(' ')[1]}`} />
                
                <div className={`p-5 rounded-[2rem] ${item.color} group-hover:scale-110 transition-transform shadow-xl`}>
                  <Icon size={32} />
                </div>
                <div className="text-center relative z-10">
                   <span className="text-sm font-black text-white block tracking-tight uppercase">
                     {item.label}
                   </span>
                   <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 block opacity-60">
                     {item.desc}
                   </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Language Mini-Bar */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
         <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full shadow-2xl flex items-center gap-4">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Interface:</span>
            <LanguageSwitcher />
         </div>
      </div>
=======

  const menuItems = [
    { icon: Fish, label: t("fishDetection"), path: "/fish-detection", color: "bg-ocean-light/20 text-ocean-mid" },
    { icon: CloudSun, label: t("weather"), path: "/weather", color: "bg-ocean-surface text-ocean-deep" },
    { icon: Map, label: t("seaMap"), path: "/sea-map", color: "bg-accent/10 text-accent" },
    { icon: AlertTriangle, label: t("sosEmergency"), path: "/sos", color: "bg-danger/10 text-danger" },
    { icon: LifeBuoy, label: t("safety"), path: "/safety", color: "bg-safe/10 text-safe" },
    { icon: ShoppingCart, label: t("fishMarket"), path: "/fish-market", color: "bg-warning/10 text-warning" },
    { icon: Settings, label: t("settings"), path: "/settings", color: "bg-muted text-muted-foreground" },
    { icon: Bot, label: t("chatbot"), path: "/chatbot", color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="ocean-gradient px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">{t("appName")}</h1>
            <p className="text-primary-foreground/70 text-xs">{t("tagline")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button onClick={() => navigate("/notifications")} className="p-2 rounded-full bg-card/20">
              <Bell size={18} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-5 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map(({ icon: Icon, label, path, color }, i) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`glass-card rounded-2xl p-5 flex flex-col items-center gap-3 hover:scale-[1.02] transition-all animate-fade-up`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon size={26} />
              </div>
              <span className="text-sm font-semibold text-foreground text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
    </div>
  );
};

export default Dashboard;
