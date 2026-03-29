import { useState } from "react";
import { ArrowLeft, Thermometer, Wind, Waves, CloudRain, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

type RiskLevel = "safe" | "moderate" | "danger";

const Weather = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [risk] = useState<RiskLevel>("safe");

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="ocean-gradient-soft px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card/20">
            <ArrowLeft size={20} className="text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">{t("weather")}</h1>
        </div>
      </div>

      <div className="px-5 -mt-6 space-y-4">
        {/* Risk indicator */}
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Thermometer, label: t("temperature"), value: "28°C" },
            { icon: Wind, label: t("windSpeed"), value: "15 km/h" },
            { icon: Waves, label: t("waveHeight"), value: "1.2 m" },
            { icon: CloudRain, label: t("seaCondition"), value: "Calm" },
          ].map(({ icon: Icon, label, value }) => (
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
          {[
            { label: t("highTide"), severity: "warning" as const },
            { label: t("heavyRain"), severity: "moderate" as const },
            { label: t("floodRisk"), severity: "safe" as const },
          ].map(({ label, severity }) => (
            <div key={label} className="glass-card rounded-xl p-3 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${severity === "warning" ? "bg-warning" : severity === "moderate" ? "bg-warning" : "bg-safe"}`} />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Weather;
