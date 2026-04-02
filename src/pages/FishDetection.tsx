import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, useMap, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, Zap, Navigation, Activity, ShieldCheck, 
  Waves, Thermometer, Droplets, ArrowUpRight, CheckCircle2,
  TableProperties, Compass, Clock
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchSatelliteData, SatellitePoint, getOceanStats, OceanStats, recordCatchFeedback } from "@/services/oceanDataService";

// Custom pulsing icon for the user's vessel
const userIcon = L.divIcon({
  className: 'user-marker-container',
  html: `<div class="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-2xl relative">
           <div class="absolute inset-0 bg-primary rounded-full animate-ping opacity-30"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const MANGALORE_LAT = 12.9141;
const MANGALORE_LNG = 74.8560;

// Map component for auto-centering
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 10, { duration: 1.5 });
  }, [center, map]);
  return null;
};

const FishDetection = () => {
  const { t } = useLanguage();
  const [points, setPoints] = useState<SatellitePoint[]>([]);
  const [stats, setStats] = useState<OceanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<SatellitePoint | null>(null);
  const [userLoc, setUserLoc] = useState<[number, number]>([MANGALORE_LAT, MANGALORE_LNG]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    if (!navigator.geolocation) {
      handleFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLoc([latitude, longitude]);
        const data = await fetchSatelliteData(latitude, longitude);
        setPoints(data);
        setStats(getOceanStats(data));
        setLoading(false);
      },
      async () => {
        handleFallback();
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const handleFallback = async () => {
    const data = await fetchSatelliteData(MANGALORE_LAT, MANGALORE_LNG);
    setPoints(data);
    setStats(getOceanStats(data));
    setLoading(false);
  };

  const handleFeedback = (lat: number, lon: number, caught: boolean) => {
    recordCatchFeedback(lat, lon, caught);
    loadData();
  };

  const highDensityPoints = points.filter(p => p.fishScore > 75);

  return (
    <div className="flex flex-col gap-10 pb-40 selection:bg-primary/20">
      {/* ── SCIENTIFIC HEADER ── */}
      <div className="px-10 space-y-4 pt-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
           <div className="flex items-center gap-3">
              <div className="h-0.5 w-10 bg-primary rounded-full" />
              <span className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Satellite Sync</span>
           </div>
           <h1 className="text-5xl font-black text-slate-950 tracking-tighter uppercase leading-none">
              {t("pfzFinder")}
           </h1>
           <p className="text-sm font-bold text-slate-400 max-w-[300px] leading-relaxed">
              Industrial Potential Fishing Zones predicted via multi-parameter cloud modeling.
           </p>
           
           <div className="flex gap-4">
              <div className="bg-slate-100 text-slate-500 px-6 py-3 rounded-2xl flex items-center gap-3 border border-slate-200">
                 <Clock size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">
                   {stats?.bestTimeToFish === "Dawn" ? "🌅 DAWN FEEDING" : "🌇 DUSK ACTIVITY"}
                 </span>
              </div>
              <button 
                onClick={loadData}
                className="bg-slate-950 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl hover:bg-black transition-all"
              >
                 <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{loading ? 'Syncing...' : 'Live Refresh'}</span>
              </button>
              <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-3 border border-emerald-100">
                 <ShieldCheck size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">AI Trained</span>
              </div>
           </div>
        </motion.div>
      </div>

      {/* ── PFZ HEATMAP WITH GPS FOLLOW ── */}
      <div className="px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-[550px] rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white group"
        >
          <MapContainer
            center={userLoc}
            zoom={10}
            className="h-full w-full z-10"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={userLoc} />
            
            {/* User Location Vessel Marker */}
            <Marker position={userLoc} icon={userIcon}>
               <Tooltip permanent direction="top" offset={[0, -10]}>
                  <p className="text-[9px] font-black uppercase tracking-widest">Your Vessel</p>
               </Tooltip>
            </Marker>

            {points.map((p, i) => (
              <Circle
                key={i}
                center={[p.lat, p.lon]}
                radius={2500}
                eventHandlers={{
                  click: () => setSelectedZone(p)
                }}
                pathOptions={{ 
                  fillColor: p.frontDetected ? '#06b6d4' : (p.fishScore > 75 ? '#0ea5e9' : p.fishScore > 50 ? '#f59e0b' : 'transparent'), 
                  color: p.frontDetected ? '#06b6d4' : 'transparent',
                  weight: p.frontDetected ? 3 : 0,
                  fillOpacity: (p.fishScore / 180) + (p.frontDetected ? 0.2 : 0)
                }}
              >
                 <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="p-2 space-y-1">
                       <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Confidence: {p.confidence}</p>
                       <p className="text-[10px] font-bold text-slate-400">Score: {p.fishScore}%</p>
                    </div>
                 </Tooltip>
              </Circle>
            ))}
          </MapContainer>

          {/* Overlay Overlay */}
          <div className="absolute top-8 left-8 z-[500] flex flex-col gap-3">
             <div className="super-glass p-2 px-6 rounded-full flex items-center gap-3 border border-white/40">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(14,165,233,0.5)]" />
                <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest leading-none">Vessel Status: Active Sync</span>
             </div>
          </div>

          <div className="absolute bottom-10 left-10 right-10 z-[500] flex justify-center">
             <div className="super-glass px-10 py-5 rounded-[2.5rem] border border-white/30 flex items-center gap-10 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                   <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                   <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest">Hotspot</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-4 h-4 bg-amber-500 rounded-full" />
                   <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Moderate</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-4 h-4 border-2 border-cyan-500 rounded-full" />
                   <span className="text-[11px] font-black text-cyan-600 uppercase tracking-widest">Front</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* ── UPDATED: STATIC ZONE SPECIFIC ANALYSIS (Below Map) ── */}
      <AnimatePresence mode="wait">
        {selectedZone ? (
          <motion.div 
            key="analysis-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="px-6"
          >
             <div className="bg-slate-950 text-white p-10 rounded-[4rem] shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="space-y-2">
                      <h2 className="text-4xl font-black tracking-tighter">Zone Analytics</h2>
                      <p className="text-sm font-bold text-primary uppercase tracking-[0.4em]">Target: {selectedZone.lat.toFixed(3)}, {selectedZone.lon.toFixed(3)}</p>
                   </div>
                   <button onClick={() => setSelectedZone(null)} className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <ArrowUpRight size={24} className="rotate-45" />
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Catch Prop.</span>
                         <span className="text-2xl font-black text-primary">{selectedZone.fishScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${selectedZone.fishScore}%` }} className="h-full bg-primary" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Confidence</span>
                         <span className={`text-2xl font-black ${selectedZone.confidence === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedZone.confidence}</span>
                      </div>
                      <div className="flex gap-2">
                         <div className={`h-2 flex-1 rounded-full ${selectedZone.confidence === 'LOW' ? 'bg-amber-400' : 'bg-white/5'}`} />
                         <div className={`h-2 flex-1 rounded-full ${selectedZone.confidence === 'MEDIUM' ? 'bg-amber-400' : 'bg-white/5'}`} />
                         <div className={`h-2 flex-1 rounded-full ${selectedZone.confidence === 'HIGH' ? 'bg-emerald-400' : 'bg-white/5'}`} />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-5 relative z-10">
                   {[
                     { label: "SST", val: selectedZone.sst + "°C", icon: Thermometer, color: "text-red-400" },
                     { label: "Current", val: selectedZone.currents + "m/s", icon: Waves, color: "text-blue-400" },
                     { label: "Depth", val: selectedZone.depth + "m", icon: TableProperties, color: "text-emerald-400" }
                   ].map((stat, i) => (
                     <div key={i} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex flex-col gap-3 items-center text-center hover:bg-white/10 transition-colors">
                        <stat.icon size={22} className={stat.color} />
                        <p className="text-lg font-black">{stat.val}</p>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{stat.label}</span>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="empty-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-10"
          >
             <div className="bg-white/40 border-2 border-dashed border-slate-200 p-12 rounded-[4rem] text-center space-y-4">
                <Compass size={40} className="mx-auto text-slate-300 animate-pulse" />
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Select a zone hotspot on the map to begin analysis</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── OCEANOGRAPHIC STATS ── */}
      {stats && (
        <div className="px-6 grid grid-cols-2 gap-5">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3">
                 <Thermometer className="text-red-500" size={18} />
                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("sst")}</span>
              </div>
              <p className="text-3xl font-black text-slate-950 leading-none">{stats.averageSST}°C</p>
           </div>
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3">
                 <Droplets className="text-blue-500" size={18} />
                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("chlorophyll")}</span>
              </div>
              <p className="text-3xl font-black text-slate-950 leading-none">{stats.averageChlorophyll} <span className="text-sm font-bold text-slate-300 uppercase">mg/m³</span></p>
           </div>
        </div>
      )}

      {/* ── HOTSPOT ALERTS ── */}
      <div className="px-10 space-y-6">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[13px] font-black text-slate-950 uppercase tracking-[0.4em] flex items-center gap-3">
               <Zap size={18} className="text-primary fill-primary/20" /> Active Hotspots
            </h3>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Region Sync
            </div>
         </div>
         
         <div className="space-y-4">
            {highDensityPoints.slice(0, 3).map((p, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i}
                onClick={() => {
                  setSelectedZone(p);
                  window.scrollTo({ top: 500, behavior: 'smooth' }); // Smooth scroll to analysis
                }}
                className={`bg-white p-8 rounded-[3.5rem] border flex items-center gap-6 cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden ${selectedZone?.lat === p.lat ? 'border-primary ring-4 ring-primary/5' : 'border-slate-100'}`}
              >
                  <div className="absolute top-0 right-0 p-4 opacity-5 bg-primary/10 rounded-bl-3xl">
                     <Activity size={40} />
                  </div>
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:scale-105 transition-transform border border-slate-100 shadow-inner">
                    <Navigation size={28} strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-950 leading-none">PFZ: {p.lat.toFixed(2)}, {p.lon.toFixed(2)}</h4>
                    <div className="flex items-center gap-3 mt-3">
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">Prob: {p.fishScore}%</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("bathymetry")}: {p.depth}m</span>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); handleFeedback(p.lat, p.lon, true); }}
                    className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  >
                     <CheckCircle2 size={24} strokeWidth={2.5} />
                  </motion.button>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default FishDetection;
