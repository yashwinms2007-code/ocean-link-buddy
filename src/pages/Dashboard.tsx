import { useNavigate } from "react-router-dom";
import { Fish, CloudSun, Map, AlertTriangle, LifeBuoy, ShoppingCart, Settings, Bot, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BottomNav from "@/components/BottomNav";

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Fish, label: t("fishDetection"), path: "/fish-detection", color: "bg-ocean-light/20 text-ocean-mid" },
    { icon: CloudSun, label: t("weather"), path: "/weather", color: "bg-ocean-surface text-ocean-deep" },
    { icon: Map, label: t("seaMap"), path: "/sea-map", color: "bg-accent/10 text-accent" },
    { icon: AlertTriangle, label: t("sosEmergency"), path: "/sos", color: "bg-danger/10 text-danger" },
    { icon: LifeBuoy, label: t("safety"), path: "/safety", color: "bg-safe/10 text-safe" },
    { icon: ShoppingCart, label: t("fishMarket"), path: "/fish-market", color: "bg-warning/10 text-warning" },
    { icon: Settings, label: t("settings"), path: "/settings", color: "bg-muted text-muted-foreground" },
    { icon: Bot, label: t("chatbot"), path: "/chatbot", color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="ocean-gradient px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">{t("appName")}</h1>
            <p className="text-primary-foreground/70 text-xs">{t("tagline")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button onClick={() => navigate("/notifications")} className="p-2 rounded-full bg-card/20">
              <Bell size={18} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-5 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map(({ icon: Icon, label, path, color }, i) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`glass-card rounded-2xl p-5 flex flex-col items-center gap-3 hover:scale-[1.02] transition-all animate-fade-up`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon size={26} />
              </div>
              <span className="text-sm font-semibold text-foreground text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
