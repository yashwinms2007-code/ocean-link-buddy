import { useState, useEffect } from "react";
import { ArrowLeft, Target, Navigation, Thermometer, Droplets, Microscope, ShieldCheck, AreaChart as AreaIcon, Waves, Anchor, TrendingUp, ThumbsUp, ThumbsDown, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import MarineMap from "@/components/MarineMap";
import { fetchSatelliteData, getOceanStats, recordCatchFeedback, predictFishMovement, SatellitePoint, OceanStats } from "@/services/oceanDataService";
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MoveRight } from "lucide-react";

const FishDetection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [activeTab, setActiveTab] = useState<"sonar" | "satellite">("sonar");
  const [satData, setSatData] = useState<SatellitePoint[]>([]);
  const [stats, setStats] = useState<OceanStats | null>(null);
  const [coords, setCoords] = useState({ lat: 12.87, lng: 74.83 });
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let watchId: number;

    const loadData = async (latitude: number, longitude: number) => {
      setIsScanning(true);
      try {
        const data = await fetchSatelliteData(latitude, longitude);
        setSatData(data);
        setStats(getOceanStats(data));
      } catch (e) {
        console.error("Fish Detection failed:", e);
      } finally {
        setTimeout(() => setIsScanning(false), 2500);
      }
    };

    if ("geolocation" in navigator) {
      setIsTracking(true);
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          loadData(c.lat, c.lng);
        },
        () => loadData(coords.lat, coords.lng),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      loadData(coords.lat, coords.lng);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const chartData = satData.slice(0, 12).map((p, i) => ({
    name: `P${i + 1}`,
    score: p.fishScore,
    temp: p.sst,
    chl: parseFloat((p.chlorophyll * 60).toFixed(1)),
  }));

  const fishZones = satData
    .filter((p) => p.fishScore > 65)
    .sort((a, b) => b.fishScore - a.fishScore)
    .slice(0, 3)
    .map((p, i) => ({
      id: i,
      lat: p.lat,
      lng: p.lon,
      radius: 900 + p.fishScore * 6,
      density: p.confidence === "HIGH" ? "High Density" : p.confidence === "MEDIUM" ? "Moderate" : "Low",
      probability: `${p.fishScore}%`,
      color: p.confidence === "HIGH" ? "#10b981" : p.confidence === "MEDIUM" ? "#f59e0b" : "#6b7280",
      label: `Scientific Zone ${String.fromCharCode(65 + i)}`,
      species:
        p.fishScore > 88
          ? "Tuna / Pelagic"
          : p.fishScore > 78
          ? "Mackerel / Seer"
          : "Sardines / Anchovy",
      confidence: p.confidence,
      frontDetected: p.frontDetected,
      depth: p.depth,
      nextPos: predictFishMovement(p)
    }));

  const confidenceBadge = (conf: string) => {
    if (conf === "HIGH") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (conf === "MEDIUM") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  const handleFeedback = (zone: (typeof fishZones)[0], caught: boolean) => {
    recordCatchFeedback(zone.lat, zone.lng, caught);
    fetchSatelliteData(coords.lat, coords.lng).then((data) => {
      setSatData(data);
      setStats(getOceanStats(data));
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 p-6 rounded-b-[2.5rem] shadow-xl flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight">{t("fishDetection")}</h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">INCOIS-Style Multi-Parameter PFZ</p>
        </div>
        {stats && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Season</span>
            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {stats.season}
            </span>
          </div>
        )}
      </div>

      <div className="px-4 space-y-6">
        {/* Tabs */}
        <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/10">
          <button
            onClick={() => setActiveTab("sonar")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === "sonar" ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-white"
            }`}
          >
            <Target size={14} /> Sonar Active
          </button>
          <button
            onClick={() => setActiveTab("satellite")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === "satellite" ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-white"
            }`}
          >
            <Microscope size={14} /> Satellite Engine
          </button>
        </div>

        {/* Best Time to Fish Banner */}
        {stats && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Flame size={18} className="text-primary flex-shrink-0" />
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Best Time to Fish Now</p>
              <p className="text-sm font-black text-white">{stats.bestTimeToFish}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-dark p-5 rounded-3xl border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Thermometer size={14} className="text-red-400" />
                <span className="text-[9px] font-black uppercase tracking-widest">Sea Temp (SST)</span>
              </div>
              <p className="text-2xl font-black text-white">{stats.averageSST}°C</p>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="bg-red-400 h-1 rounded-full transition-all"
                  style={{ width: `${Math.min(((stats.averageSST - 20) / 15) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="glass-dark p-5 rounded-3xl border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Droplets size={14} className="text-green-400" />
                <span className="text-[9px] font-black uppercase tracking-widest">Chlorophyll-a</span>
              </div>
              <p className="text-2xl font-black text-white">
                {stats.averageChlorophyll} <span className="text-xs text-slate-400">mg/m³</span>
              </p>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="bg-green-400 h-1 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.averageChlorophyll / 1.5) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="glass-dark p-5 rounded-3xl border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck size={14} className="text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest">High-Conf Zones</span>
              </div>
              <p className="text-2xl font-black text-white">
                {stats.highConfidenceZones} <span className="text-xs text-primary">zones</span>
              </p>
            </div>

            <div className="glass-dark p-5 rounded-3xl border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Waves size={14} className="text-yellow-400" />
                <span className="text-[9px] font-black uppercase tracking-widest">Ocean Fronts</span>
              </div>
              <p className="text-2xl font-black text-white">
                {stats.activeFronts} <span className="text-xs text-yellow-400">active</span>
              </p>
            </div>
          </div>
        )}

        {/* Multi-Parameter Chart */}
        {activeTab === "satellite" && !isScanning && chartData.length > 0 && (
          <div className="glass-dark p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Multi-Parameter Analysis</h3>
              <AreaIcon size={16} className="text-primary" />
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="chlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "10px",
                      color: "#fff",
                    }}
                  />
                  <Area type="monotone" dataKey="score" name="Fish Score" stroke="#0ea5e9" fillOpacity={1} fill="url(#scoreGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="chl" name="Chlorophyll×60" stroke="#10b981" fillOpacity={1} fill="url(#chlGrad)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[8px] font-black text-slate-600 text-center uppercase tracking-widest mt-2">
              SST × Chlorophyll × Currents × Depth × Fronts fusion
            </p>
          </div>
        )}

        {/* Live PFZ Map */}
        <div className="glass-dark p-4 rounded-[2.5rem] border border-white/10 shadow-2xl relative min-h-[350px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,1)]" />
              <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Live PFZ Analysis Grid</h3>
            </div>
            {!isScanning && (
              <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                <Navigation size={12} className="text-green-400" />
                <span className="text-[9px] font-black text-green-400 uppercase tracking-wider">
                  {isTracking ? "GPS Lock" : "Target"}
                </span>
              </div>
            )}
          </div>

          <div className={isScanning ? "opacity-30 blur-md pointer-events-none h-[300px]" : "h-[300px] transition-all duration-1000"}>
            <MarineMap
              center={[coords.lat, coords.lng]}
              zoom={11}
              height="100%"
              activeLayer={activeTab === "satellite" ? "prediction" : "none"}
              satellitePoints={satData}
              markers={[{ position: [coords.lat, coords.lng], label: "Your Vessel (GPS)" }]}
              zones={fishZones.map((z) => ({
                position: [z.lat, z.lng] as [number, number],
                radius: z.radius,
                color: z.color,
                label: z.label,
              }))}
            />
          </div>

          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center p-8 glass-dark rounded-[3rem] border border-white/10">
                <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-[0_0_20px_rgba(14,165,233,0.4)]" />
                <p className="text-primary font-black uppercase tracking-[0.3em] text-xs">Running Fusion Algorithm...</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">
                  SST · Chlorophyll · Currents · Depth · Fronts
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Zone Cards with Confidence + AI Feedback */}
        <div className="grid grid-cols-1 gap-4 pb-12">
          <div className="flex items-center gap-3 px-2 mb-1">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              {activeTab === "satellite" ? "Predicted Fishing Hotspots" : "Sonar Detection Results"}
            </h3>
          </div>

          {fishZones.length === 0 && !isScanning && (
            <div className="text-center py-8 text-slate-500 font-black text-xs uppercase tracking-widest">
              No high-probability zones found. Conditions are moderate.
            </div>
          )}

          {fishZones.map((zone) => (
            <div key={zone.id} className="glass-dark rounded-[2.5rem] border border-white/10 shadow-xl overflow-hidden">
              <div
                onClick={() => navigate("/sea-map")}
                className="p-6 flex items-center gap-5 hover:border-primary/30 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-2xl flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${zone.color}, ${zone.color}99)` }}
                >
                  {zone.probability}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="text-base font-black text-white tracking-tight">{zone.label}</h4>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${confidenceBadge(zone.confidence)}`}>
                      {zone.confidence}
                    </span>
                    {zone.frontDetected && (
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        🌊 Front
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2 p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest truncate">
                      <span className="text-slate-400 mr-1">SPECIES:</span>
                      {zone.species}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase">
                    <span className="flex items-center gap-1">
                      <Anchor size={10} /> Depth ~{Math.round(zone.depth)}m
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <MoveRight size={10} /> Shift: {Math.round(zone.nextPos.direction)}° E
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={10} /> {zone.density}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary transition-all group-hover:shadow-[0_0_15px_rgba(14,165,233,0.5)]">
                  <Navigation size={20} className="group-hover:text-white text-slate-500" />
                </div>
              </div>

              {/* AI Feedback Learning Strip */}
              <div className="border-t border-white/5 px-6 py-3 flex items-center justify-between bg-white/[0.02]">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Did you catch fish here?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedback(zone, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/30 transition-all text-[9px] font-black uppercase border border-green-500/20"
                  >
                    <ThumbsUp size={12} /> Yes
                  </button>
                  <button
                    onClick={() => handleFeedback(zone, false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/30 transition-all text-[9px] font-black uppercase border border-red-500/20"
                  >
                    <ThumbsDown size={12} /> No
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Science Methodology Footer */}
          <div className="mt-4 p-5 glass-dark rounded-[2rem] border border-white/5 text-center">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">
              Powered by INCOIS-PFZ Methodology · SST(30%) + Chlorophyll(30%) + Currents(20%) + Depth(10%) + Sea Height(10%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishDetection;
