import { ArrowLeft, Fish } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

const FishDetection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const density = "high";
  const densityConfig = {
    high: { label: t("high"), color: "bg-safe text-safe-foreground", emoji: "🐟🐟🐟" },
    medium: { label: t("medium"), color: "bg-warning text-warning-foreground", emoji: "🐟🐟" },
    low: { label: t("low"), color: "bg-danger text-danger-foreground", emoji: "🐟" },
  };

  const d = densityConfig[density];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("fishDetection")}</h1>
        </div>
      </div>

      <div className="px-5 space-y-4">
        <div className={`${d.color} rounded-2xl p-8 text-center shadow-lg`}>
          <p className="text-4xl mb-3">{d.emoji}</p>
          <p className="text-sm font-medium opacity-80 uppercase tracking-wider">{t("fishDensity")}</p>
          <p className="text-3xl font-extrabold mt-1">{d.label}</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Fish size={18} className="text-primary" />
            {t("prediction")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("bestArea")}</p>
          <div className="mt-3 h-32 bg-ocean-surface rounded-xl flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary animate-pulse flex items-center justify-center">
              <Fish size={28} className="text-primary" />
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FishDetection;
