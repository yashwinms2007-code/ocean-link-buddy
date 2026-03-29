import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

const SOS = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("sosEmergency")}</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {!sent ? (
          <>
            <button
              onClick={() => setSent(true)}
              className="w-48 h-48 rounded-full bg-danger text-danger-foreground flex items-center justify-center shadow-2xl animate-pulse-sos"
            >
              <span className="text-2xl font-extrabold">{t("sendSos")}</span>
            </button>
            <p className="text-muted-foreground text-sm mt-6 text-center">
              {t("sosEmergency")}
            </p>
          </>
        ) : (
          <div className="text-center animate-fade-up">
            <div className="w-24 h-24 rounded-full bg-safe text-safe-foreground flex items-center justify-center mx-auto mb-4 text-4xl">
              ✓
            </div>
            <p className="text-lg font-bold text-foreground mb-2">{t("sosAlertSent")}</p>
            <p className="text-safe font-bold text-xl">{t("helpOnTheWay")}</p>
            <div className="mt-6 glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{t("latitude")}: 12.9716</p>
              <p className="text-xs text-muted-foreground">{t("longitude")}: 74.7869</p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default SOS;
