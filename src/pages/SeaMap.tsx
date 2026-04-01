import { useState, useEffect } from "react";
import { ArrowLeft, Navigation, Globe, WifiOff, Compass, Layers, Thermometer, Droplets, Target, Anchor, Waves, TrendingUp, ShieldCheck, Wind, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import MarineMap from "@/components/MarineMap";
import { toast } from "sonner";
import { fetchSatelliteData, getOceanStats, SatellitePoint, OceanStats } from "@/services/oceanDataService";
import { calculateDeadReckoning } from "@/services/sosService";
import { fetchMarineWeather, MarineData, degToCompass } from "@/services/marineWeatherService";

const MANGALORE_LAT = 12.9141;
const MANGALORE_LNG = 74.8560;

const isInland = (lat: number, lng: number) => lng > 75.5 || lng < 72.5 || lat > 15.5 || lat < 8;

const SeaMap = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [coords, setCoords] = useState({ lat: MANGALORE_LAT, lng: MANGALORE_LNG });
  const [offlineMode, setOfflineMode] = useState(false);
  const [isDeadReckoning, setIsDeadReckoning] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'none' | 'prediction' | 'sst' | 'chlorophyll'>('prediction');
  const [showNautical, setShowNautical] = useState(true);
  const [satData, setSatData] = useState<SatellitePoint[]>([]);
  const [stats, setStats] = useState<OceanStats | null>(null);
  const [loadingSat, setLoadingSat] = useState(false);
  const [speed, setSpeed] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [gpsTrail, setGpsTrail] = useState<[number, number][]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [weather, setWeather] = useState<MarineData | null>(null);
  const MAX_TRAIL = 30;

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed: spd, heading: hdg } = pos.coords;
        if (isInland(latitude, longitude)) {
          toast.info("📍 GPS detected inland — using Mangalore coast");
          setOfflineMode(false);
          return;
        }
        setCoords({ lat: latitude, lng: longitude });
        setIsDeadReckoning(false);
        setOfflineMode(false);
        setLastSync(new Date());
        if (spd !== null) setSpeed(Math.round(spd * 1.944));
        if (hdg !== null) setHeading(Math.round(hdg));
        setGpsTrail((prev) => [...prev, [latitude, longitude]].slice(-MAX_TRAIL) as [number, number][]);
      },
      () => {
        setOfflineMode(true);
        setIsDeadReckoning(true);
        setGpsTrail((prev) => {
          if (prev.length === 0) return prev;
          const [lastLat, lastLon] = prev[prev.length - 1];
          const est = calculateDeadReckoning(lastLat, lastLon, 50, heading ?? 0);
          setCoords({ lat: est.lat, lng: est.lon });
          return [...prev, [est.lat, est.lon]].slice(-MAX_TRAIL) as [number, number][];
        });
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [t, heading]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoadingSat(true);
      try {
        const data = await fetchSatelliteData(coords.lat, coords.lng);
        setSatData(data);
        setStats(getOceanStats(data));
        setLastSync(new Date());
      } finally {
        setLoadingSat(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [coords.lat.toFixed(2), coords.lng.toFixed(2)]);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const { current } = await fetchMarineWeather(coords.lat, coords.lng);
        setWeather(current);
      } catch { /* silent */ }
    };
    loadWeather();
    const interval = setInterval(loadWeather, 300000);
    return () => clearInterval(interval);
  }, [coords.lat.toFixed(1), coords.lng.toFixed(1)]);

  const mapZones = [
    { position: [12.99, 74.81] as [number, number], radius: 1000, color: "#10b981", label: t("safeZoneLegend") },
    { position: [12.95, 74.76] as [number, number], radius: 1500, color: "#ef4444", label: t("dangerZoneLegend") },
    { position: [13.02, 74.79] as [number, number], radius: 800, color: "#3b82f6", label: t("fishZoneLegend") },
  ];

  const layerButtons = [
    { id: 'prediction', icon: Target, label: 'PFZ', color: 'text-green-400' },
    { id: 'sst', icon: Thermometer, label: 'SST', color: 'text-red-400' },
    { id: 'chlorophyll', icon: Droplets, label: 'Chl', color: 'text-primary' },
    { id: 'none', icon: Layers, label: 'Base', color: 'text-slate-400' },
  ];

  const compassDir = heading !== null
    ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(heading / 45) % 8]
    : '--';

  const syncAgo = Math.round((Date.now() - lastSync.getTime()) / 1000);

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-120px)]">
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4 rounded-b-[2rem] shadow-2xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/10">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">{t("seaMap")}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${offlineMode ? 'bg-yellow-400' : 'bg-green-400'}`} />
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">
              {isDeadReckoning ? '⚠️ Dead Reckoning' : offlineMode ? t("offlineModeActive") : t("realTimeGps")}
            </p>
            <span className="text-[8px] text-slate-600 font-mono ml-1">• {syncAgo}s ago</span>
          </div>
        </div>
        <button
          onClick={() => setShowNautical((s) => !s)}
          className={`p-2 rounded-xl border transition-all ${showNautical ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-slate-600'}`}
        >
          <Anchor size={16} />
        </button>
        {offlineMode ? <WifiOff size={18} className="text-yellow-400" /> : <Globe size={18} className="text-green-400 animate-pulse" />}
      </div>

      <div className="px-3 flex-1 flex flex-col space-y-2.5 pb-2 overflow-hidden">
        <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="p-1.5 bg-primary/10 rounded-lg mb-0.5">
                <Compass size={16} className="text-primary" style={{ transform: `rotate(${heading ?? 0}deg)`, transition: 'transform 0.5s' }} />
              </div>
              <span className="text-[8px] font-black text-slate-500 uppercase">{compassDir}</span>
            </div>
            <div className="flex gap-3">
              <div>
                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Lat</p>
                <p className="text-sm font-mono font-black text-white">{coords.lat.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Lon</p>
                <p className="text-sm font-mono font-black text-white">{coords.lng.toFixed(4)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                <TrendingUp size={10} className="text-primary" />
                <span className="text-[8px] font-black text-white">{speed !== null ? `${speed} kn` : 'GPS…'}</span>
              </div>
              {weather && (
                <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                  <Wind size={10} className="text-blue-400" />
                  <span className="text-[8px] font-black text-blue-300">
                    {weather.windSpeed} kn {degToCompass(weather.windDirection)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              {layerButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveLayer(btn.id as any)}
                  className={`p-1.5 rounded-lg border transition-all ${activeLayer === btn.id ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/5 opacity-40 hover:opacity-80'}`}
                >
                  <btn.icon size={13} className={activeLayer === btn.id ? btn.color : 'text-slate-500'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { label: 'SST', value: `${stats.averageSST}°C`, icon: Thermometer, color: 'text-red-400' },
              { label: 'Chlor', value: `${stats.averageChlorophyll}`, icon: Droplets, color: 'text-green-400' },
              { label: 'Hi-Conf', value: `${stats.highConfidenceZones}`, icon: ShieldCheck, color: 'text-primary' },
              { label: 'Fronts', value: `${stats.activeFronts}`, icon: Waves, color: 'text-yellow-400' },
              { label: 'Press', value: weather ? `${weather.pressure}hPa` : '—', icon: Gauge, color: 'text-purple-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-slate-950/60 border border-white/5 p-2 rounded-xl flex flex-col items-center shadow-sm">
                <Icon size={11} className={color} />
                <span className="text-[6px] font-black uppercase text-slate-600 tracking-widest mt-0.5">{label}</span>
                <span className="text-[9px] font-black text-white mt-0.5">{value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden" style={{ minHeight: '260px', background: '#050d1a' }}>
          {loadingSat && (
            <div className="absolute top-3 right-3 z-[1001] bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/30 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
              <span className="text-[8px] font-black uppercase text-primary tracking-[0.2em]">Satellite Sync…</span>
            </div>
          )}
          {isDeadReckoning && (
            <div className="absolute top-3 left-3 z-[1001] bg-yellow-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-[8px] font-black uppercase text-yellow-400 tracking-widest">Dead Reckoning</span>
            </div>
          )}
          {gpsTrail.length > 1 && (
            <div className="absolute bottom-20 right-3 z-[1001] bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <span className="text-[7px] font-black text-primary uppercase tracking-widest">{gpsTrail.length} pts trail</span>
            </div>
          )}
          <MarineMap
            center={[coords.lat, coords.lng]}
            zoom={11}
            height="100%"
            markers={[{ position: [coords.lat, coords.lng], label: t("yourVessel"), heading: heading ?? 0, windDir: weather?.windDirection ?? 0 }]}
            satellitePoints={satData}
            activeLayer={activeLayer}
            zones={mapZones}
            route={gpsTrail}
            showNautical={showNautical}
          />
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/75 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 flex justify-around shadow-2xl z-[1000]">
            {[
              { color: '#10b981', label: 'Safe/High PFZ' },
              { color: '#fbbf24', label: 'Medium' },
              { color: '#ef4444', label: 'Low/Danger' },
              { color: '#f97316', label: '🌊 Front' },
            ].map(({ color, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}88` }} />
                <span className="text-[6px] font-black uppercase text-white tracking-wider leading-none">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeaMap;
