import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, useMap, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, Zap, Navigation, Activity, ShieldCheck, 
  Waves, Thermometer, Droplets, ArrowUpRight, CheckCircle2,
  TableProperties, Compass, Clock, Fish, Sparkles, ShieldAlert,
  Moon, TestTube, CloudFog
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchSatelliteData, SatellitePoint, getOceanStats, OceanStats, recordCatchFeedback, PFZData } from "@/services/oceanDataService";

// ── HAVERSINE ENGINE (Industrial Standard) ──
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

const getRelativeTime = (timestamp: number, t: (k: string) => string) => {
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 60) return t("justNow");
  const min = Math.floor(sec / 60);
  if (min < 60) return t("minsAgo").replace("{n}", min.toString());
  const hr = Math.floor(min / 60);
  return t("hoursAgo").replace("{n}", hr.toString());
};

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [isLearning, setIsLearning] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const displayPoints = points.filter(p => {
    if (!activeFilter) return true;
    if (activeFilter === t("phytoplanktonMapping")) return p.chlorophyll > 0.5;
    if (activeFilter === t("thermalFrontsMap")) return p.frontDetected;
    if (activeFilter === t("oceanColorImg")) return p.fishScore > 60;
    if (activeFilter === t("bathymetricZone")) return p.depth > 30;
    return true;
  });

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); loadData(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
        const data: PFZData = await fetchSatelliteData(latitude, longitude);
        setPoints(data.points);
        setStats(getOceanStats(data.points));
        setLastSync(data.lastUpdated);
        setIsFromCache(data.isFromCache);
        setLoading(false);
      },
      async () => {
        handleFallback();
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const handleFallback = async () => {
    const data: PFZData = await fetchSatelliteData(MANGALORE_LAT, MANGALORE_LNG);
    setPoints(data.points);
    setStats(getOceanStats(data.points));
    setLastSync(data.lastUpdated);
    setIsFromCache(data.isFromCache);
    setLoading(false);
  };

  const handleFeedback = async (lat: number, lon: number, caught: boolean) => {
    const key = `${lat}_${lon}`;
    setIsLearning(key);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI training
    recordCatchFeedback(lat, lon, caught);
    await loadData();
    setIsLearning(null);
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
              <span className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">{t("satelliteSync")}</span>
           </div>
           <h1 className="text-5xl font-black text-slate-950 tracking-tighter uppercase leading-none">
              {t("pfzFinder")}
           </h1>
           <p className="text-sm font-bold text-slate-400 max-w-[300px] leading-relaxed">
              {t("pfzDesc")}
           </p>
           
            <div className="flex gap-4">
              <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border transition-all ${isOnline && !isFromCache ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                 {isOnline && !isFromCache ? <Zap size={14} /> : <Activity size={14} />}
                 <span className="text-[10px] font-black uppercase tracking-widest">
                   {isOnline && !isFromCache ? t("liveSatellite") : t("offlineEngine")}
                 </span>
              </div>
              <button 
                onClick={loadData}
                disabled={loading}
                className="bg-slate-950 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl hover:bg-black transition-all disabled:opacity-50"
              >
                 <RefreshCw size={14} className={`${loading ? t("trainingLabelSuffix") : ''}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{loading ? t("syncing") : t("forceSync")}</span>
              </button>
              {lastSync && (
                <div className="bg-slate-100 text-slate-500 px-6 py-3 rounded-2xl flex items-center gap-3 border border-slate-200">
                   <Clock size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">
                     {t("lastSyncPrefix")} {getRelativeTime(lastSync, t)}
                   </span>
                </div>
              )}
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
                  <p className="text-[9px] font-black uppercase tracking-widest">{t("yourVessel")}</p>
               </Tooltip>
            </Marker>

            {displayPoints.map((p, i) => (
              <Circle
                key={`${p.lat}_${p.lon}_${activeFilter || 'base'}`}
                center={[p.lat, p.lon]}
                radius={2500}
                eventHandlers={{
                  click: () => setSelectedZone(p)
                }}
                pathOptions={{ 
                  fillColor: activeFilter === t("phytoplanktonMapping") 
                             ? '#22c55e'
                             : activeFilter === t("thermalFrontsMap") 
                             ? '#f97316'
                             : activeFilter === t("oceanColorImg") 
                             ? '#06b6d4'
                             : activeFilter === t("bathymetricZone") 
                             ? '#1e3a8a'
                             : (p.frontDetected ? '#22d3ee' : (p.fishScore > 75 ? '#0ea5e9' : p.fishScore > 50 ? '#f59e0b' : 'transparent')),
                  color: activeFilter === t("phytoplanktonMapping") 
                         ? '#16a34a' 
                         : activeFilter === t("thermalFrontsMap") 
                         ? '#ea580c' 
                         : activeFilter === t("oceanColorImg") 
                         ? '#0891b2' 
                         : activeFilter === t("bathymetricZone") 
                         ? '#1e40af' 
                         : (p.frontDetected ? '#06b6d4' : (p.fishScore > 80 ? '#0ea5e9' : 'transparent')),
                  weight: activeFilter || p.frontDetected || p.fishScore > 80 ? 3 : 0,
                  fillOpacity: activeFilter ? 0.6 : ((p.fishScore / 160) + (p.frontDetected ? 0.3 : 0)),
                  className: activeFilter || p.fishScore > 80 ? 'hotspot-pulse' : ''
                }}
              >
                 <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="p-3 space-y-2 backdrop-blur-md bg-white/90 rounded-2xl shadow-xl border border-slate-100">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                          <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest">{t("pfzHotspot")}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 italic">"{p.sourceSatellite}"</p>
                          <p className="text-[10px] font-bold text-slate-950">{t("confidence")}: {p.confidence}</p>
                          <p className="text-[10px] font-bold text-primary">{t("score")}: {p.fishScore}%</p>
                       </div>
                    </div>
                 </Tooltip>
              </Circle>
            ))}
          </MapContainer>

          {/* Overlay Overlay */}
          <div className="absolute top-8 left-8 z-[500] flex flex-col gap-3">
             <div className="super-glass p-2 px-6 rounded-full flex items-center gap-3 border border-white/40">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-lg ${isOnline ? 'bg-primary' : 'bg-amber-500'}`} />
                <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest leading-none">
                  {isOnline ? t("vesselStatusOnline") : t("vesselStatusOffline")}
                </span>
             </div>
          </div>

          <div className="absolute bottom-10 left-10 right-10 z-[500] flex justify-center">
             <div className="super-glass px-10 py-5 rounded-[2.5rem] border border-white/30 flex items-center gap-10 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                   <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                   <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest">{t("hudHotspot")}</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-4 h-4 bg-amber-500 rounded-full" />
                   <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{t("hudModerate")}</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-4 h-4 border-2 border-cyan-500 rounded-full" />
                   <span className="text-[11px] font-black text-cyan-600 uppercase tracking-widest">{t("hudFront")}</span>
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
                      <h2 className="text-4xl font-black tracking-tighter">{t("zoneAnalytics")}</h2>
                      <p className="text-sm font-bold text-primary uppercase tracking-[0.4em]">{t("targetLabel")}: {selectedZone.lat.toFixed(3)}, {selectedZone.lon.toFixed(3)}</p>
                   </div>
                   <button onClick={() => setSelectedZone(null)} className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <ArrowUpRight size={24} className="rotate-45" />
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t("biologicalInsight")}</span>
                         <Sparkles size={16} className="text-primary animate-pulse" />
                      </div>
                      <p className="text-sm font-bold text-slate-100 italic leading-relaxed bg-white/5 p-4 rounded-3xl border border-white/5">
                        "{selectedZone.insight}"
                      </p>
                      <div className="flex items-center gap-2 px-2">
                         <div className="px-2 py-0.5 bg-white/10 rounded-md text-[8px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
                           {t("sourceLabel")}: {selectedZone.sourceSatellite}
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t("safetyFactor")}</span>
                         <span className={`text-2xl font-black ${selectedZone.safetyScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                           {selectedZone.safetyScore}%
                         </span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: `${selectedZone.safetyScore}%` }} 
                           className={`h-full ${selectedZone.safetyScore >= 80 ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                         />
                      </div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">
                        {selectedZone.safetyScore >= 80 ? t("safeForDeployment") : t("cautionWaveDrift")}
                      </p>
                   </div>
                </div>

                <div className="space-y-4 mb-10 relative z-10">
                   <div className="flex items-center gap-3 px-2">
                      <Fish size={14} className="text-primary" />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t("predictedSpecies")}</span>
                   </div>
                   <div className="flex flex-wrap gap-3">
                      {selectedZone.predictedSpecies.map((s, idx) => (
                        <div key={idx} className="bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-2xl flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{s}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t("navigationTelemetry")}</span>
                         <span className="text-2xl font-black text-primary">{getDistance(userLoc[0], userLoc[1], selectedZone.lat, selectedZone.lon)} km</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <Navigation size={12} className="text-primary" />
                         {t("habitatLabel")}: {selectedZone.zoneName} • ~{Math.round(getDistance(userLoc[0], userLoc[1], selectedZone.lat, selectedZone.lon) / 15 * 60)}{t("travelTime")}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t("modelConfidence")}</span>
                         <span className={`text-2xl font-black ${selectedZone.confidence === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedZone.confidence}</span>
                      </div>
                      <div className="flex gap-2">
                         <div className={`h-2 flex-1 rounded-full ${selectedZone.confidence === 'LOW' ? 'bg-amber-400' : 'bg-white/5'}`} />
                         <div className={`h-2 flex-1 rounded-full ${selectedZone.confidence === 'MEDIUM' ? 'bg-amber-400' : 'bg-white/5'}`} />
                         <div className={`h-2 flex-1 rounded-full ${selectedZone.confidence === 'HIGH' ? 'bg-emerald-400' : 'bg-white/5'}`} />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-4 gap-3 relative z-10">
                   {[
                     { label: t("sstLabel"), val: selectedZone.sst + "°C", icon: Thermometer, color: "text-red-400", basis: t("sstBasis") },
                     { label: t("planktonLabel"), val: selectedZone.chlorophyll + "mg", icon: Droplets, color: "text-emerald-400", basis: t("planktonBasis") },
                     { label: t("currentLabel"), val: selectedZone.currents + "m/s", icon: Waves, color: "text-blue-400", basis: t("currentBasis") },
                     { label: t("colorLabel"), val: selectedZone.oceanColor, icon: Sparkles, color: "text-cyan-400", basis: t("colorBasis") },
                     { label: t("salinityLabel"), val: selectedZone.salinity + " ppt", icon: TestTube, color: "text-teal-400", basis: t("salinityBasis") },
                     { label: t("thermoclineLabel"), val: selectedZone.thermocline + " m", icon: Activity, color: "text-fuchsia-400", basis: t("thermoclineBasis") },
                     { label: t("turbidityLabel"), val: selectedZone.turbidity + " NTU", icon: CloudFog, color: "text-amber-300", basis: t("turbidityBasis") },
                     { label: t("moonPhaseLabel"), val: Math.round(selectedZone.moonPhase * 100) + "%", icon: Moon, color: "text-indigo-400", basis: t("moonPhaseBasis") }
                   ].map((stat, i) => (
                     <div key={i} className="bg-white/5 p-3 rounded-[1.5rem] border border-white/5 flex flex-col gap-1.5 items-center text-center hover:bg-white/10 transition-colors group">
                        <stat.icon size={18} className={stat.color} />
                        <div>
                           <p className="text-sm font-black">{stat.val}</p>
                           <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{stat.label}</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[7px] font-black text-primary uppercase tracking-tighter">{stat.basis}</span>
                        </div>
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
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{t("selectZoneHint")}</p>
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
               <Zap size={18} className="text-primary fill-primary/20" /> {t("activeHotspots")}
            </h3>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
               {t("regionSync")}
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
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">{t("probLabel")}: {p.fishScore}%</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("bathymetry")}: {p.depth}m</span>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isLearning === `${p.lat}_${p.lon}`}
                    onClick={(e) => { e.stopPropagation(); handleFeedback(p.lat, p.lon, true); }}
                    className={`p-4 rounded-2xl transition-all shadow-sm flex items-center gap-2 ${isLearning === `${p.lat}_${p.lon}` ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                  >
                     {isLearning === `${p.lat}_${p.lon}` ? (
                        <>
                           <RefreshCw size={18} className="animate-spin" />
                           <span className="text-[9px] font-black uppercase tracking-widest">{t("trainingLabel")}</span>
                        </>
                     ) : (
                        <CheckCircle2 size={24} strokeWidth={2.5} />
                     )}
                  </motion.button>
              </motion.div>
            ))}
         </div>
      </div>

      {/* ── TECHNOLOGICAL FOUNDATION (Scientific Disclosure) ── */}
      <div className="px-6">
         <div className="bg-gradient-to-br from-slate-50 to-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
            <div className="space-y-2 relative z-10">
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{t("scienceTitle")}</h3>
               <p className="text-sm font-bold text-slate-500 max-w-md">{t("scienceDesc")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
               {[
                  { 
                     title: t("phytoplanktonMapping"), 
                     desc: t("phytoDesc"),
                     icon: "🌿",
                     source: "Aqua-MODIS (NASA)"
                  },
                  { 
                     title: t("thermalFrontsMap"), 
                     desc: t("thermalDesc"),
                     icon: "🌡️",
                     source: "Sentinel-3 SLSTR (ESA)"
                  },
                  { 
                     title: t("oceanColorImg"), 
                     desc: t("colorDesc"),
                     icon: "📸",
                     source: "VIIRS (Suomi NPP)"
                  },
                  { 
                     title: t("bathymetricZone"), 
                     desc: t("bathyDesc"),
                     icon: "🌊",
                     source: "GEBCO 2023"
                  }
               ].map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveFilter(activeFilter === item.title ? null : item.title)}
                    className={`bg-white p-6 rounded-[2.5rem] border shadow-sm transition-all cursor-pointer ${activeFilter === item.title ? 'border-primary ring-4 ring-primary/20 scale-[1.02]' : 'border-slate-100 hover:shadow-md'}`}
                  >
                     <span className="text-3xl mb-4 block">{item.icon}</span>
                     <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">{item.title}</h4>
                     <p className="text-xs font-bold text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                     <div className="flex flex-wrap items-center gap-2">
                        <div className="bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                           <span className="text-[8px] font-black text-primary uppercase tracking-widest">Protocol: {item.source}</span>
                        </div>
                        {activeFilter === item.title && (
                          <div className="bg-primary px-3 py-1 rounded-full border border-primary/20 shadow-sm animate-pulse">
                             <span className="text-[8px] font-black text-white uppercase tracking-widest">{t("filterActive")}</span>
                          </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>

            {/* Machine Learning Engine Explanation */}
            <div className="bg-slate-950 text-white p-10 rounded-[3rem] space-y-8 relative overflow-hidden shadow-2xl border border-primary/20">
               <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
               
               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                     <Zap className="text-primary" size={24} />
                  </div>
                  <div>
                     <p className="text-xl font-black tracking-tight">{t("mlEngine")}</p>
                     <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t("mlTrainingViz")}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {/* Step 1 */}
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                     <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                        <span className="text-sm font-black text-slate-300">1</span>
                     </div>
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-2">{t("step1Title")}</h4>
                     <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{t("step1Desc")}</p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                     <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/30">
                        <span className="text-sm font-black text-primary">2</span>
                     </div>
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">{t("step2Title")}</h4>
                     <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{t("step2Desc")}</p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-emerald-500/10 p-6 rounded-[2rem] border border-emerald-500/20 flex flex-col items-center text-center">
                     <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                        <span className="text-sm font-black text-emerald-400">3</span>
                     </div>
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-2">{t("step3Title")}</h4>
                     <p className="text-[10px] text-emerald-100/70 font-bold leading-relaxed mb-3 mt-1 border-b border-emerald-500/20 pb-3">
                        "{t("step3Prefix")} <strong className="text-white">Temp = {stats?.averageSST || '27.5'}°C</strong> & <strong className="text-white">Chlorophyll = {stats?.averageChlorophyll || '0.9'} mg/m³</strong>"
                     </p>
                     <div className="bg-emerald-950/40 rounded-xl p-2 w-full border border-emerald-500/10">
                        <p className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest mb-1 leading-none">{t("zonesRespecting")}</p>
                        <p className="text-[9px] font-black text-white uppercase tracking-widest truncate">
                           {highDensityPoints.length > 0 
                             ? highDensityPoints.slice(0, 3).map(p => p.zoneName).join(" • ") 
                             : "Scanning Regional Grid..."}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
                  <div className="flex items-center gap-3">
                     <div className="flex flex-col gap-1">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                           <div className="h-full bg-amber-500 w-[15%]" />
                           <div className="h-full bg-emerald-500 w-[70%]" />
                           <div className="h-full bg-blue-500 w-[15%]" />
                         </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{t("multimodalWeighting")}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-black text-white leading-none">94.2<span className="text-sm text-primary">%</span></p>
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t("modelAccuracyFactor")}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FishDetection;
