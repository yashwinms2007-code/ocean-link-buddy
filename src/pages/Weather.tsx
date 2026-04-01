import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Wind, Waves, Thermometer, Volume2,
  Droplets, CloudRain, Activity, Navigation, Radio,
  ShieldCheck, TrendingUp, ChevronRight, Zap,
  ArrowUpRight, ArrowDownRight, Minus, Gauge, RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { fetchMarineWeather, MarineData, SafetyStatus, MarineForecast, degToCompass } from "@/services/marineWeatherService";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MANGALORE_LAT = 12.9141;
const MANGALORE_LNG = 74.8560;

const Weather = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marineData, setMarineData] = useState<MarineData | null>(null);
  const [safety, setSafety]         = useState<SafetyStatus | null>(null);
  const [forecast, setForecast]     = useState<MarineForecast[]>([]);
  const [placeName, setPlaceName]   = useState<string>("Locating…");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secsAgo, setSecsAgo]       = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // ── Live "X sec ago" counter ───────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      setSecsAgo(Math.round((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  const fetchPlaceName = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      if (res.ok) {
        const data = await res.json();
        setPlaceName(data.address?.city || data.address?.town || data.address?.village || "Marine Zone");
      }
    } catch { setPlaceName("Marine Zone"); }
  };

  const setData = (current: MarineData, safetyData: SafetyStatus, forecastData: MarineForecast[], name?: string) => {
    setMarineData(current);
    setSafety(safetyData);
    setForecast(forecastData);
    if (name) setPlaceName(name);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  };

  const loadMarineWeather = async (showToast = false) => {
    if (!loading) setRefreshing(true);
    if (!navigator.geolocation) {
      const { current, safety, forecast } = await fetchMarineWeather(MANGALORE_LAT, MANGALORE_LNG);
      setData(current, safety, forecast, "Mangalore Port");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { current, safety, forecast } = await fetchMarineWeather(latitude, longitude);
        setData(current, safety, forecast);
        fetchPlaceName(latitude, longitude);
        if (showToast) toast.success("🔄 Weather Telemetry Updated");
      },
      async () => {
        const { current, safety, forecast } = await fetchMarineWeather(MANGALORE_LAT, MANGALORE_LNG);
        setData(current, safety, forecast, "Mangalore Port");
        if (showToast) toast.info("GPS unavailable — using Mangalore Port data");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    loadMarineWeather();
    // 5-min auto polling (more responsive than 10 min)
    intervalRef.current = setInterval(() => loadMarineWeather(true), 300000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const playVoiceAlert = () => {
    if (!safety || !marineData || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const trendText = safety.trend === 'WORSENING'
      ? (language === 'hi' ? "मौसम खराब हो रहा है" : language === 'kn' ? "ಹವಾಮಾನ ಕೆಡುತ್ತಿದೆ" : "Weather trend is worsening")
      : (language === 'hi' ? "मौसम सामान्य है" : language === 'kn' ? "ಹವಾಮಾನ ಸ್ಥಿರವಾಗಿದೆ" : "Weather is stable");
    const msg = `${safety.alert}. ${safety.advice}. ${trendText}. Wave height ${marineData.waveHeight} meters. Wind ${marineData.windSpeed} knots from ${degToCompass(marineData.windDirection)}.`;
    const utterance = new SpeechSynthesisUtterance(msg);
    const langMap: Record<Language, string> = { en: "en-US", hi: "hi-IN", kn: "kn-IN" };
    utterance.lang = langMap[language];
    window.speechSynthesis.speak(utterance);
    toast.info("🔊 Marine Safety Briefing Started");
  };

  if (loading || !marineData || !safety) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-primary/10 rounded-full" />
            <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0" />
            <Waves size={36} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">
            Fetching Live Data…
          </p>
        </div>
      </div>
    );
  }

  const hudStyles = {
    red:    "bg-red-600/90 text-white shadow-[0_20px_50px_rgba(220,38,38,0.4)]",
    yellow: "bg-yellow-500/90 text-slate-900 shadow-[0_20px_50px_rgba(234,179,8,0.4)]",
    green:  "bg-emerald-600/90 text-white shadow-[0_20px_50px_rgba(16,185,129,0.4)]",
  };
  const getTrendIcon = () => {
    if (safety.trend === 'WORSENING') return <ArrowUpRight className="text-red-400" size={20} />;
    if (safety.trend === 'IMPROVING') return <ArrowDownRight className="text-emerald-400" size={20} />;
    return <Minus className="text-slate-500" size={20} />;
  };

  // Wind direction arrow (rotated to point where wind is going)
  const windArrow = (deg: number) => (
    <span style={{ display: 'inline-block', transform: `rotate(${deg}deg)`, fontSize: 18, lineHeight: 1 }}>↑</span>
  );

  return (
    <div className="flex flex-col gap-5 selection:bg-primary/20 pb-20">

      {/* ── Header ── */}
      <div className="bg-slate-950/90 border-b border-white/5 p-5 rounded-b-[3rem] shadow-2xl flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
        <button onClick={() => navigate(-1)} className="p-3 glass-dark rounded-2xl hover:bg-white/10 transition-all border border-white/10 z-10 text-white">
          <ArrowLeft size={18} />
        </button>
        <div className="z-10 flex-1">
          <h1 className="text-xl font-black tracking-tight uppercase text-white">
            SMART <span className="text-primary italic">WEATHER</span>
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">
              {placeName} • Live Data
            </p>
            <span className="text-[8px] text-slate-700 font-mono ml-1">
              · Updated {secsAgo < 60 ? `${secsAgo}s` : `${Math.round(secsAgo/60)}m`} ago
            </span>
          </div>
        </div>
        <div className="z-10 flex items-center gap-2">
          <button
            onClick={() => loadMarineWeather(true)}
            className={`p-2.5 bg-white/5 rounded-xl border border-white/10 hover:text-white transition-all ${refreshing ? 'text-primary animate-spin' : 'text-slate-400'}`}
            disabled={refreshing}
            title="Refresh now"
          >
            <RotateCcw size={16} />
          </button>
          <Radio size={18} className="text-primary animate-pulse" />
        </div>
      </div>

      <div className="px-4 space-y-5">

        {/* ── Safety HUD ── */}
        <div
          onClick={playVoiceAlert}
          className={`p-8 rounded-[3rem] flex flex-col items-center text-center gap-5 cursor-pointer transition-all active:scale-[0.98] group relative overflow-hidden backdrop-blur-3xl ${hudStyles[safety.color as keyof typeof hudStyles]}`}
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-white/20" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-75">MARINE SAFETY VERDICT</span>
          <div className="relative group-hover:scale-110 transition-transform duration-500">
            <ShieldCheck size={80} className="text-white" />
            <div className="absolute inset-0 bg-white blur-[80px] opacity-15 rounded-full" />
          </div>
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-3 leading-none">
              {safety.status === 'SAFE' ? 'SAFE' : safety.status === 'MODERATE' ? 'CAUTION' : 'DANGER'}
            </h2>
            <p className="text-sm font-black uppercase tracking-widest bg-black/10 py-1.5 px-5 rounded-full inline-block mb-4">
              {safety.status === 'SAFE' ? '✅ SAFE TO FISH' : safety.status === 'MODERATE' ? '⚠️ ADVISORY ACTIVE' : '❌ DO NOT DEPLOY'}
            </p>
            <div className="bg-white/10 p-5 rounded-[2rem] border border-white/10 text-sm font-bold leading-relaxed">
              {safety.advice}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-8 py-4 rounded-full border border-white/20 group-hover:bg-white/30 transition-all">
            <Volume2 size={22} />
            <span className="text-[10px] font-black uppercase tracking-widest">LISTEN TO SAFETY HUD</span>
          </div>
        </div>

        {/* ── Trend ── */}
        <div className="glass-dark p-5 rounded-[2.5rem] border border-white/10 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/5 rounded-2xl"><Activity size={20} className="text-slate-400" /></div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">3-HOUR TREND</p>
              <h4 className="text-base font-black text-white uppercase">{safety.trend}</h4>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-full border border-white/10">{getTrendIcon()}</div>
        </div>

        {/* ── 8-Parameter Marine Grid ── */}
        <div className="grid grid-cols-2 gap-3">
          <MarineCard icon={Waves}      label="Wave Height"   value={marineData.waveHeight}     unit="m"    color={marineData.waveHeight > 2.5 ? "text-red-400" : "text-primary"} />
          <MarineCard icon={Wind}       label="Wind Speed"    value={marineData.windSpeed}       unit="kn"   color={marineData.windSpeed > 20 ? "text-red-400" : "text-emerald-400"} />
          <MarineCard icon={CloudRain}  label="Precipitation" value={marineData.precipitation}  unit="mm"   color="text-cyan-400" />
          <MarineCard icon={TrendingUp} label="Sea Current"   value={marineData.currentVelocity} unit="m/s" color="text-orange-400" />
          <MarineCard icon={Thermometer} label="Sea Temp"     value={marineData.sst}             unit="°C"  color="text-rose-400" />
          <MarineCard icon={Navigation} label="Wave Period"   value={marineData.wavePeriod}      unit="sec" color="text-indigo-400" />
          {/* NEW: Pressure + Wind Direction */}
          <MarineCard icon={Gauge}      label="Pressure"      value={marineData.pressure}        unit="hPa" color="text-purple-400" />
          <div className="glass-dark p-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center text-center gap-2 group hover:border-primary/20 transition-all relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-20 h-20 bg-white/5 blur-3xl rounded-full" />
            <div className="p-4 rounded-3xl bg-white/5 group-hover:scale-110 transition-transform text-sky-400 shadow-lg border border-white/5">
              <span style={{ display: 'inline-block', transform: `rotate(${marineData.windDirection}deg)`, fontSize: 28, lineHeight: 1 }}>↑</span>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Wind Dir</p>
              <p className="text-2xl font-black text-white tracking-tighter leading-none">
                {degToCompass(marineData.windDirection)}
                <span className="text-[10px] text-slate-600 ml-1 font-black uppercase">{marineData.windDirection}°</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── 24H Wave Chart ── */}
        <div className="glass-dark p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 rounded-2xl">
                <Waves size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-[0.15em] text-[10px]">24H WAVE HEIGHT</h3>
                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Open-Meteo Marine API · Live</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 7, fill: '#475569' }} interval={4} />
                <YAxis hide domain={['dataMin - 0.3', 'dataMax + 0.3']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1628', borderRadius: '20px', border: '1px solid rgba(14,165,233,0.25)', fontSize: '11px' }}
                  itemStyle={{ color: '#fff', fontWeight: 900 }}
                  labelStyle={{ color: '#64748b', fontSize: '9px' }}
                />
                <Area type="monotone" dataKey="waveHeight" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#waveGrad)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[7px] font-black text-slate-700 text-center uppercase tracking-widest mt-4">
            Forecast · {new Date().toLocaleDateString()} · Auto-refresh every 5 min
          </p>
        </div>

        {/* ── Vessel Advisory ── */}
        <div className="glass-dark p-6 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
            <div className="flex items-center gap-2.5 mb-5">
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Technical Readiness</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-3xl border ${marineData.waveHeight > 1.8 ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1.5">Small Craft</p>
                <p className={`text-xs font-black ${marineData.waveHeight > 1.8 ? "text-red-400" : "text-emerald-400"}`}>
                  {marineData.waveHeight > 1.8 ? "🔴 HAZARDOUS" : "🟢 DEPLOYABLE"}
                </p>
              </div>
              <div className={`p-4 rounded-3xl border ${marineData.waveHeight > 3.0 ? "bg-red-500/10 border-red-500/20" : "bg-blue-500/10 border-blue-500/20"}`}>
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1.5">Ocean Vessel</p>
                <p className={`text-xs font-black ${marineData.waveHeight > 3.0 ? "text-red-400" : "text-blue-400"}`}>
                  {marineData.waveHeight > 3.0 ? "🔴 HAZARDOUS" : "🟢 STABLE"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Polling Pulse ── */}
        <div className="flex justify-center items-center gap-2 py-3 opacity-40">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
          <span className="text-[7px] font-black uppercase tracking-[0.35em] text-slate-500">
            Live • Auto-refresh 5 min • {secsAgo < 60 ? `${secsAgo}s` : `${Math.round(secsAgo/60)}m`} since last sync
          </span>
        </div>
      </div>
    </div>
  );
};

const MarineCard = ({ icon: Icon, label, value, unit, color = "text-primary" }: any) => (
  <div className="glass-dark p-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center text-center gap-2.5 group hover:border-primary/20 transition-all cursor-default relative overflow-hidden">
    <div className="absolute top-[-20%] right-[-10%] w-20 h-20 bg-white/5 blur-3xl rounded-full" />
    <div className={`p-4 rounded-3xl bg-white/5 group-hover:scale-110 transition-transform ${color} shadow-lg relative z-10 border border-white/5`}>
      <Icon size={28} />
    </div>
    <div className="relative z-10">
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5 group-hover:text-slate-300 transition-colors">{label}</p>
      <p className="text-2xl font-black text-white tracking-tighter leading-none">
        {value}
        {unit && <span className="text-[10px] text-slate-600 ml-1 font-black uppercase">{unit}</span>}
      </p>
    </div>
  </div>
);

export default Weather;
