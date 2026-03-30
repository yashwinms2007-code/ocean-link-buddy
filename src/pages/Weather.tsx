import { useState, useEffect } from "react";
import { ArrowLeft, Volume2, RefreshCw, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type RiskLevel = "safe" | "moderate" | "danger";

interface WeatherAlert {
  label: string;
  severity: string;
}

interface WeatherData {
  temperature: string;
  windSpeed: string;
  waveHeight: string;
  condition: string;
  risk: RiskLevel;
  alerts: WeatherAlert[];
  updatedAt: string;
}

const conditionEmoji: Record<string, string> = {
  Clear: "☀️",
  "Partly Cloudy": "⛅",
  Cloudy: "☁️",
  Foggy: "🌫️",
  Drizzle: "🌦️",
  Rain: "🌧️",
  Snow: "❄️",
};

const riskEmoji: Record<RiskLevel, string> = {
  safe: "✅",
  moderate: "⚠️",
  danger: "🌊⛈️",
};

const Weather = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      let lat = 13.0, lon = 74.8;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } catch {}

      const { data, error: fnError } = await supabase.functions.invoke("get-weather", {
        body: { latitude: lat, longitude: lon },
      });

      if (fnError) throw fnError;
      setWeather(data);
      localStorage.setItem("lastWeather", JSON.stringify(data));
    } catch {
      const cached = localStorage.getItem("lastWeather");
      if (cached) {
        setWeather(JSON.parse(cached));
        setError("Showing cached data (offline)");
      } else {
        setError("Failed to load weather");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const risk = weather?.risk ?? "safe";

  const riskConfig: Record<RiskLevel, { label: string; bg: string; text: string }> = {
    safe: { label: "Safe to Go", bg: "bg-safe", text: "text-safe-foreground" },
    moderate: { label: "Be Careful", bg: "bg-warning", text: "text-warning-foreground" },
    danger: { label: "DANGER - Stay Ashore!", bg: "bg-danger", text: "text-danger-foreground" },
  };

  const speak = (text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    // Try to pick a clear English voice
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) 
      || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    speechSynthesis.speak(utterance);
  };

  const buildSpeechText = () => {
    if (!weather) return "";
    const parts = [
      `Weather condition: ${weather.condition}.`,
      `Temperature: ${weather.temperature}.`,
      `Wind speed: ${weather.windSpeed}.`,
      `Wave height: ${weather.waveHeight}.`,
      `Sea status: ${riskConfig[risk].label}.`,
    ];
    const hasFlood = weather.alerts.some(a => a.label.toLowerCase().includes("flood"));
    if (hasFlood) parts.push("Warning! Flood risk detected. Stay away from low-lying areas.");
    return parts.join(" ");
  };

  const rc = riskConfig[risk];
  const emoji = conditionEmoji[weather?.condition ?? "Clear"] ?? "🌤️";

  // Flood indicator
  const floodAlert = weather?.alerts.find(a => a.label.toLowerCase().includes("flood"));
  const precipValue = weather ? parseFloat(weather.windSpeed) : 0; // we'll compute from alerts

  const stats = weather
    ? [
        { emoji: "🌡️", label: "Temperature", value: weather.temperature },
        { emoji: "💨", label: "Wind", value: weather.windSpeed },
        { emoji: "🌊", label: "Waves", value: weather.waveHeight },
        { emoji, label: "Condition", value: weather.condition },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="ocean-gradient-soft px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card/20">
            <ArrowLeft size={20} className="text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">{t("weather")}</h1>
          <button onClick={fetchWeather} className="ml-auto p-2 rounded-full bg-card/20" disabled={loading}>
            <RefreshCw size={18} className={`text-primary-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="px-5 -mt-6 space-y-4">
        {error && (
          <div className="bg-warning/20 text-warning-foreground rounded-xl p-3 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Main condition card */}
        {loading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : (
          <div className={`${rc.bg} ${rc.text} rounded-2xl p-6 text-center shadow-lg`}>
            <p className="text-5xl mb-2">{riskEmoji[risk]}</p>
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">Sea Condition</p>
            <p className="text-3xl font-extrabold">{rc.label}</p>
            <p className="text-lg mt-1">{emoji} {weather?.condition}</p>
            <button
              onClick={() => speak(buildSpeechText())}
              className="mt-3 px-5 py-2.5 rounded-full bg-card/20 inline-flex items-center gap-2 text-sm font-semibold"
            >
              <Volume2 size={18} /> Listen 🔊
            </button>
          </div>
        )}

        {/* Stats grid with emojis */}
        <div className="grid grid-cols-2 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
            : stats.map(({ emoji: e, label, value }) => (
                <div key={label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-3xl">{e}</span>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-bold text-foreground">{value}</p>
                  </div>
                </div>
              ))}
        </div>

        {/* Flood Indicator */}
        {!loading && (
          <div className={`rounded-2xl p-4 flex items-center gap-4 ${floodAlert ? "bg-danger/20 border-2 border-danger" : "bg-safe/20 border-2 border-safe"}`}>
            <div className="text-3xl">{floodAlert ? "🌊" : "✅"}</div>
            <Droplets size={24} className={floodAlert ? "text-danger" : "text-safe"} />
            <div>
              <p className="font-bold text-foreground">{floodAlert ? "⚠️ Flood Risk Detected!" : "No Flood Risk"}</p>
              <p className="text-xs text-muted-foreground">
                {floodAlert ? "Heavy rainfall may cause flooding. Avoid low-lying areas." : "Water levels are normal. Safe conditions."}
              </p>
            </div>
          </div>
        )}

        {/* Alerts */}
        <div className="space-y-2">
          <h2 className="font-bold text-foreground">⚠️ Alerts</h2>
          {loading ? (
            <Skeleton className="h-12 rounded-xl" />
          ) : (
            weather?.alerts.map(({ label, severity }, i) => (
              <div key={i} className="glass-card rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl">
                  {severity === "danger" ? "🔴" : severity === "warning" ? "🟡" : "🟢"}
                </span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            ))
          )}
        </div>

        {weather?.updatedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Updated: {new Date(weather.updatedAt).toLocaleTimeString()}
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Weather;
