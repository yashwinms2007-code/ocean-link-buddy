import { ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

const SeaMap = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("seaMap")}</h1>
        </div>
      </div>

      {/* Simulated Map */}
      <div className="mx-5 rounded-2xl overflow-hidden border border-border h-72 bg-ocean-surface relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={40} className="text-primary mx-auto mb-2" />
            <p className="font-bold text-foreground text-sm">{t("yourBoat")}</p>
          </div>
        </div>
        {/* Zone indicators */}
        <div className="absolute top-4 right-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <div className="w-3 h-3 rounded-full bg-safe" /> {t("safeZone")}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <div className="w-3 h-3 rounded-full bg-danger" /> {t("dangerZone")}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <div className="w-3 h-3 rounded-full bg-primary" /> {t("fishZone")}
          </div>
        </div>
        {/* Simulated zones */}
        <div className="absolute bottom-12 left-8 w-16 h-16 rounded-full bg-safe/30 border-2 border-safe" />
        <div className="absolute top-16 left-24 w-12 h-12 rounded-full bg-danger/30 border-2 border-danger" />
        <div className="absolute bottom-20 right-16 w-14 h-14 rounded-full bg-primary/30 border-2 border-primary" />
      </div>

      {/* Coordinates */}
      <div className="px-5 mt-4">
        <div className="glass-card rounded-2xl p-4 flex justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{t("latitude")}</p>
            <p className="font-bold text-foreground">12.9716° N</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("longitude")}</p>
            <p className="font-bold text-foreground">74.7869° E</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default SeaMap;
