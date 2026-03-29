import { ArrowLeft, Shield, CloudLightning, Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

const Safety = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const tips = [
    { icon: CloudLightning, title: t("stormSafety"), color: "bg-warning/10 text-warning" },
    { icon: Anchor, title: t("boatSafety"), color: "bg-primary/10 text-primary" },
    { icon: Shield, title: t("emergencySteps"), color: "bg-danger/10 text-danger" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("safety")}</h1>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {tips.map(({ icon: Icon, title, color }, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
              <Icon size={26} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">Tap to learn more</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Safety;
