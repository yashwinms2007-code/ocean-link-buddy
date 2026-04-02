import { useState, useEffect } from "react";
import { ArrowLeft, Navigation, Globe, WifiOff, Compass, Layers, Thermometer, Droplets, Target, Anchor, Waves, TrendingUp, ShieldCheck, Wind, Gauge, Map as MapIcon, Maximize2, Layers as LayersIcon, AlertTriangle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import MarineMap from "@/components/MarineMap";
import { toast } from "sonner";
import { fetchSatelliteData, getOceanStats, SatellitePoint, OceanStats } from "@/services/oceanDataService";
import { calculateDeadReckoning } from "@/services/sosService";
import { fetchMarineWeather, MarineData, degToCompass } from "@/services/marineWeatherService";
import { motion } from "framer-motion";

const MANGALORE_LAT = 12.9141;
const MANGALORE_LNG = 74.8560;

const SeaMap = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract deep-link coordinates if opening from an Alert
  const initialLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : MANGALORE_LAT;
  const initialLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : MANGALORE_LNG;
  const isSOSLink = searchParams.get("sos") === "true";
  const isOffline = searchParams.get("mode") === "offline";

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [vesselStatus, setVesselStatus] = useState({ heading: 0, speed: 0, accuracy: 0 });
  const [activeLayer, setActiveLayer] = useState<'none' | 'prediction' | 'sst' | 'chlorophyll'>('none');
  const [satData, setSatData] = useState<SatellitePoint[]>([]);
  const [weather, setWeather] = useState<MarineData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { current } = await fetchMarineWeather(coords.lat, coords.lng);
      setWeather(current);
      const data = await fetchSatelliteData(coords.lat, coords.lng);
      setSatData(data);

      if (isSOSLink) {
        toast.error("DIRE EMERGENCY SIGNAL: Analyzing rescue coordinates...", { duration: 6000 });
      }
      if (isOffline) {
        toast.warning("OFFLINE MODE: Displaying cached coastal telemetry.");
      }
    };
    loadData();
  }, [coords.lat, coords.lng, isOffline, isSOSLink]);

  // Real-time High-Accuracy GPS Tracking
  useEffect(() => {
    if (!searchParams.get("lat") && !searchParams.get("lng") && "geolocation" in navigator) {
       const watchId = navigator.geolocation.watchPosition(
          (pos) => {
             const { latitude, longitude, heading, speed, accuracy } = pos.coords;
             setCoords({ lat: latitude, lng: longitude });
             setVesselStatus({ 
                heading: heading ?? 0, 
                speed: speed ? parseFloat((speed * 1.94384).toFixed(1)) : 0, // Convert m/s to knots
                accuracy: Math.round(accuracy)
             });
             
             // Only toast once for successful lock
             if (vesselStatus.accuracy === 0) {
                toast.success("GPS LOCKED: Real-time high-accuracy tracking active.");
             }
          },
          (err) => {
            console.error("GPS Error:", err);
            if (err.code === err.TIMEOUT) {
              toast.info("GPS Timeout: Scanning for satellite fix...");
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
       );
       return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [searchParams]);

  const markers = [
    { 
      position: [coords.lat, coords.lng] as [number, number], 
      label: isSOSLink ? "DISTRESS SIGNAL SOURCE" : "Your Vessel", 
      isSOS: isSOSLink,
      heading: vesselStatus.heading,
      speed: vesselStatus.speed
    }
  ];

  return (
    <div className="flex flex-col gap-12 pb-32 h-screen overflow-hidden bg-slate-50">
      {/* ── HEADER ── */}
      <div className="px-10 pt-10 space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-slate-950 uppercase leading-none">Sea Explorer</h1>
            <p className="text-sm font-bold text-slate-400 max-w-[320px] leading-relaxed">
              {isSOSLink ? "Rescue Intelligence Mode Active." : "Real-time maritime navigation & PFZ intelligence."}
            </p>
          </div>
          <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-3xl shadow-xl text-slate-900 hover:bg-slate-50 border border-slate-100">
             <ArrowLeft size={24} />
          </button>
        </motion.div>
      </div>

      {/* ── MAP CONTAINER ── */}
      <div className="flex-1 min-h-0 px-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-4 border-white h-full rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col pt-2"
        >
           {/* Telemetry Overlay */}
           <div className="absolute top-10 left-10 right-10 z-[1000] flex justify-between items-start pointer-events-none">
              <div className={`super-glass p-6 rounded-[2.5rem] shadow-2xl pointer-events-auto flex items-center gap-10 border ${isSOSLink ? 'border-red-500/30' : 'border-white/20'}`}>
                 <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{isSOSLink ? 'Rescue Target' : 'Vessel Position'}</span>
                    <span className={`text-sm font-black leading-none tracking-tight ${isSOSLink ? 'text-red-600' : 'text-slate-950'}`}>{coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E</span>
                 </div>
                 <div className="w-px h-10 bg-slate-100" />
                 <div className="flex flex-col gap-2 text-slate-950">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Safe Corridor</span>
                    <span className="text-sm font-black leading-none tracking-tight uppercase">{weather ? 'TRACKING' : 'SCANNING'}</span>
                 </div>
              </div>

              {isOffline && (
                <div className="bg-amber-500 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl pointer-events-auto border border-white/20">
                   <WifiOff size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Offline View</span>
                </div>
              )}

              <div className="super-glass p-3 rounded-[2.2rem] shadow-2xl pointer-events-auto flex flex-col gap-3 border border-white/20 ml-auto">
                 {['prediction', 'sst', 'chlorophyll', 'none'].map((l) => (
                    <button 
                      key={l}
                      onClick={() => setActiveLayer(l as any)}
                      className={`p-4 rounded-[1.8rem] transition-all ${activeLayer === l ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                       {l === 'prediction' && <Target size={24} strokeWidth={2.5} />}
                       {l === 'sst' && <Thermometer size={24} strokeWidth={2.5} />}
                       {l === 'chlorophyll' && <Droplets size={24} strokeWidth={2.5} />}
                       {l === 'none' && <MapIcon size={24} strokeWidth={2.5} />}
                    </button>
                 ))}
              </div>
           </div>

           <div className="flex-1 rounded-[3.5rem] overflow-hidden relative">
              <MarineMap
                center={[coords.lat, coords.lng]}
                zoom={isSOSLink ? 15 : 12}
                height="100%"
                activeLayer={activeLayer}
                satellitePoints={satData}
                markers={markers}
              />
              
              {/* Floating Compass Overlay */}
              <div className="absolute bottom-8 right-8 z-[1000] super-glass p-8 rounded-full shadow-2xl transition-transform hover:scale-110 active:rotate-180 duration-700 bg-white/80 border border-white/20">
                 <Compass size={48} strokeWidth={2.5} className="text-primary" />
              </div>

              {isSOSLink && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1000]">
                    <div className="relative">
                       <div className="w-64 h-64 border-4 border-dashed border-red-500/40 rounded-full animate-[spin_10s_linear_infinite]" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <AlertTriangle size={40} className="text-red-500 animate-pulse" />
                       </div>
                    </div>
                 </div>
              )}
           </div>

           {/* Legend Strip */}
           <div className="absolute bottom-10 left-10 right-10 flex justify-center z-[1000] pointer-events-none">
              <div className="super-glass px-12 py-5 rounded-full shadow-2xl pointer-events-auto flex gap-12 border border-white/20">
                 <div className="flex items-center gap-4">
                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest leading-none">Stable Sea</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest leading-none">Danger Zone</span>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SeaMap;
