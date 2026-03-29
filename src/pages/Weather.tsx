import { useState, useEffect } from "react";
import { ArrowLeft, Thermometer, Wind, Waves, CloudRain, Volume2, RefreshCw } from "lucide-react";
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
      // Try to get user location
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
      // Cache for offline
      localStorage.setItem("lastWeather", JSON.stringify(data));
    } catch (err: any) {
      // Try offline cache
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
    safe: { label: t("safe"), bg: "bg-safe", text: "text-safe-foreground" },
    moderate: { label: t("moderate"), bg: "bg-warning", text: "text-warning-foreground" },
    danger: { label: t("dangerous"), bg: "bg-danger", text: "text-danger-foreground" },
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const rc = riskConfig[risk];

  const stats = weather
    ? [
        { icon: Thermometer, label: t("temperature"), value: weather.temperature },
        { icon: Wind, label: t("windSpeed"), value: weather.windSpeed },
        { icon: Waves, label: t("waveHeight"), value: weather.waveHeight },
        { icon: CloudRain, label: t("seaCondition"), value: weather.condition },
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
        {/* Error banner */}
        {error && (
          <div className="bg-warning/20 text-warning-foreground rounded-xl p-3 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Risk indicator */}
        {loading ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : (
          <div className={`${rc.bg} ${rc.text} rounded-2xl p-6 text-center shadow-lg`}>
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">{t("seaCondition")}</p>
            <p className="text-3xl font-extrabold">{rc.label}</p>
            <button
              onClick={() => speak(risk === "safe" ? t("safeToGo") : t("dangerousConditions"))}
              className="mt-3 px-4 py-2 rounded-full bg-card/20 inline-flex items-center gap-2 text-sm font-semibold"
            >
              <Volume2 size={16} /> 🎙️
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
            : stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon size={20} className="text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-bold text-foreground">{value}</p>
                  </div>
                </div>
              ))}
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          <h2 className="font-bold text-foreground">⚠️ {t("alerts")}</h2>
          {loading ? (
            <Skeleton className="h-12 rounded-xl" />
          ) : (
            weather?.alerts.map(({ label, severity }, i) => (
              <div key={i} className="glass-card rounded-xl p-3 flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    severity === "danger" ? "bg-danger" : severity === "warning" ? "bg-warning" : "bg-safe"
                  }`}
                />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            ))
          )}
        </div>

        {/* Last updated */}
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
