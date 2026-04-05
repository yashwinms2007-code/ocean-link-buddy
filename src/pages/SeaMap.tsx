import { useState, useEffect } from "react";
import { ArrowLeft, Navigation, Globe, WifiOff, Compass, Layers, Thermometer, Droplets, Target, Anchor, Waves, TrendingUp, ShieldCheck, Wind, Gauge, Map as MapIcon, Maximize2, Layers as LayersIcon, AlertTriangle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import MarineMap from "@/components/MarineMap";
import { toast } from "sonner";
import { fetchSatelliteData, getOceanStats, SatellitePoint, OceanStats, PFZData } from "@/services/oceanDataService";
import { calculateDeadReckoning, getDistance, calculateBearing } from "@/services/sosService";
import { fetchMarineWeather, MarineData, degToCompass } from "@/services/marineWeatherService";
import { motion } from "framer-motion";

const MANGALORE_LAT = 12.9141;
const MANGALORE_LNG = 74.8560;

const SeaMap = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract deep-link coordinates if opening from an Alert
  const sosLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : MANGALORE_LAT;
  const sosLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : MANGALORE_LNG;
  const isSOSLink = searchParams.get("sos") === "true";
  const isOffline = searchParams.get("mode") === "offline";

  const [coords, setCoords] = useState({ lat: MANGALORE_LAT, lng: MANGALORE_LNG });
  const [vesselStatus, setVesselStatus] = useState({ heading: 0, speed: 0, accuracy: 0 });
  const [activeLayer, setActiveLayer] = useState<'none' | 'prediction' | 'sst' | 'chlorophyll'>('none');
  const [satData, setSatData] = useState<SatellitePoint[]>([]);
  const [weather, setWeather] = useState<MarineData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [returnToShore, setReturnToShore] = useState(false);

  const rescueTarget = isSOSLink ? { lat: sosLat, lng: sosLng } : null;
  const distToSOS = rescueTarget ? getDistance(coords.lat, coords.lng, rescueTarget.lat, rescueTarget.lng) : 0;
  const bearingToSOS = rescueTarget ? calculateBearing(coords.lat, coords.lng, rescueTarget.lat, rescueTarget.lng) : 0;
  const etaMins = (distToSOS > 0 && vesselStatus.speed > 0) ? Math.round((distToSOS / (vesselStatus.speed * 1.852)) * 60) : 0; // Speed in knots to km/h

  useEffect(() => {
    const loadData = async () => {
      const { current } = await fetchMarineWeather(coords.lat, coords.lng);
      setWeather(current);
      const data: PFZData = await fetchSatelliteData(coords.lat, coords.lng);
      setSatData(data.points);

      if (isSOSLink) {
        toast.error("DIRE EMERGENCY SIGNAL: Analyzing rescue coordinates...", { duration: 6000 });
      }
      if (isOffline || data.isFromCache) {
        toast.warning(data.isFromCache ? "CACHED DATA: Using offline coastal telemetry." : "OFFLINE MODE: Displaying cached coastal telemetry.");
      }
    };
    loadData();
  }, [coords.lat, coords.lng, isOffline, isSOSLink]);

  // Real-time High-Accuracy GPS Tracking
  useEffect(() => {
    if ("geolocation" in navigator) {
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

  const handleSeedMap = async () => {
    if (!navigator.onLine) {
      toast.error("Internet Required: Please connect to Wi-Fi to download charts.");
      return;
    }
    
    setIsDownloading(true);
    toast.info("Capturing Nautical Charts: Preparing 50km radius for offline use...", { duration: 4000 });
    
    try {
      const zoom = 12;
      // Convert lat/lon to tile x/y
      const lon2tile = (lon: number, zoom: number) => Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
      const lat2tile = (lat: number, zoom: number) => Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      
      const centerX = lon2tile(coords.lng, zoom);
      const centerY = lat2tile(coords.lat, zoom);
      const radius = 2; // Small radius for demo to avoid heavy bandwidth
      
      const tilesToFetch: string[] = [];
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
          tilesToFetch.push(`https://b.basemaps.cartocdn.com/dark_all/${zoom}/${x}/${y}.png`);
          tilesToFetch.push(`https://tiles.openseamap.org/seamark/${zoom}/${x}/${y}.png`);
        }
      }

      const cache = await caches.open("mitra-map-tiles-v1");
      let count = 0;
      for (const url of tilesToFetch) {
        try {
          await cache.add(url);
          count++;
        } catch (e) { console.warn("Tile skip:", url); }
      }
      
      toast.success(`CHART READY: ${count} Nautical tiles saved to device for offline safety.`);
    } catch (error) {
      toast.error("Download Failed: Check storage space or signal.");
    } finally {
      setIsDownloading(false);
    }
  };

  const markers = [
    { 
      position: [coords.lat, coords.lng] as [number, number], 
      label: isSOSLink ? "DISTRESS SIGNAL SOURCE" : "Your Vessel", 
      isSOS: isSOSLink,
      heading: vesselStatus.heading,
      speed: vesselStatus.speed
    },
    { position: [coords.lat + 0.03, coords.lng - 0.02] as [number, number], label: "Mesh MkV: Kingfisher-2 (Tuna: High)", heading: 45, speed: 12 },
    { position: [coords.lat - 0.04, coords.lng - 0.05] as [number, number], label: "Mesh MkV: SeaBreeze (Sardine: High)", heading: 120, speed: 8 }
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
            <h1 className="text-5xl font-black tracking-tighter text-slate-950 uppercase leading-none">{t("seaExplorer")}</h1>
            <p className="text-sm font-bold text-slate-400 max-w-[320px] leading-relaxed">
              {isSOSLink ? t("rescueModeActive") : t("realTimeNav")}
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
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{isSOSLink ? t("rescueTarget") : t("vesselPosition")}</span>
                    <span className={`text-sm font-black leading-none tracking-tight ${isSOSLink ? 'text-red-600' : 'text-slate-950'}`}>{coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E</span>
                 </div>
                 <div className="w-px h-10 bg-slate-100" />
                 <div className="flex flex-col gap-2 text-slate-950">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t("safeCorridor")}</span>
                    <span className="text-sm font-black leading-none tracking-tight uppercase">{weather ? t("vesselStatusOnline") : t("vesselStatusOffline")}</span>
                 </div>
              </div>

              {isOffline && (
                <div className="bg-amber-500 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl pointer-events-auto border border-white/20">
                   <WifiOff size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">{t("offlineView")}</span>
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
                  <div className="w-full h-px bg-slate-100 my-1" />
                  <button 
                    onClick={() => {
                      setReturnToShore(!returnToShore);
                      toast.info(returnToShore ? "Free navigation active." : "Route mapped to nearest emergency coastal base.");
                      if (!returnToShore) setActiveLayer('none');
                    }}
                    className={`p-4 rounded-[1.8rem] transition-all mb-1 ${returnToShore ? 'bg-green-500 text-white shadow-xl shadow-green-500/30 scale-110' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                     <Anchor size={24} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={handleSeedMap}
                    disabled={isDownloading}
                    className={`p-4 rounded-[1.8rem] transition-all ${isDownloading ? 'bg-emerald-500 text-white animate-pulse' : 'text-emerald-600 hover:bg-emerald-50'}`}
                  >
                     <ShieldCheck size={24} strokeWidth={2.5} className={isDownloading ? 'animate-spin' : ''} />
                  </button>
               </div>
            </div>

            {/* Rescue Dashboard (Active Intercept) */}
            {isSOSLink && (
              <div className="absolute bottom-32 left-10 right-10 z-[1000] animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="bg-red-600/90 backdrop-blur-2xl p-8 rounded-[3.5rem] shadow-[0_0_60px_rgba(220,38,38,0.5)] border border-white/20 flex items-center gap-10">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <Navigation 
                      size={48} 
                      className="text-white" 
                      style={{ transform: `rotate(${bearingToSOS}deg)` }} 
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{t("steerTo")}</span>
                      <span className="text-3xl font-black text-white tracking-tighter">
                        {bearingToSOS.toFixed(0)}° {degToCompass(bearingToSOS)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{t("distance")}</span>
                      <span className="text-3xl font-black text-white tracking-tighter">
                        {distToSOS.toFixed(2)} KM
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{t("estArrival")}</span>
                      <span className="text-3xl font-black text-white tracking-tighter">
                        {vesselStatus.speed > 0 ? `${etaMins} MIN` : 'STOPPED'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="px-6 py-3 bg-black/20 rounded-full border border-white/10 mb-2">
                       <span className="text-[10px] font-black text-white uppercase animate-pulse">RESCUE INTERCEPT ACTIVE</span>
                    </div>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${sosLat},${sosLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl"
                    >
                       <MapIcon size={14} /> {t("openGoogleMaps")}
                    </a>
                  </div>
                </div>
              </div>
            )}

           <div className="flex-1 rounded-[3.5rem] overflow-hidden relative">
              <MarineMap
                center={[coords.lat, coords.lng]}
                zoom={isSOSLink ? 15 : (returnToShore ? 11 : 12)}
                height="100%"
                activeLayer={activeLayer}
                satellitePoints={satData}
                markers={markers}
                route={returnToShore ? [[coords.lat, coords.lng], [MANGALORE_LAT, MANGALORE_LNG]] : []}
                rescuePath={isSOSLink ? [[coords.lat, coords.lng], [sosLat, sosLng]] : []}
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
                    <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest leading-none">{t("stableSea")}</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest leading-none">{t("dangerZone")}</span>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SeaMap;
