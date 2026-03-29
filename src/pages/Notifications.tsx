import { ArrowLeft, AlertTriangle, CloudRain, Fish } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

const notifications = [
  { icon: AlertTriangle, text: "SOS alert from nearby boat", time: "2 min ago", type: "danger" as const },
  { icon: CloudRain, text: "Heavy rain expected in 3 hours", time: "15 min ago", type: "warning" as const },
  { icon: Fish, text: "New fish listings in Mangalore market", time: "1 hour ago", type: "info" as const },
];

const Notifications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const typeColors = {
    danger: "bg-danger/10 text-danger",
    warning: "bg-warning/10 text-warning",
    info: "bg-primary/10 text-primary",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("notifications")}</h1>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {notifications.map(({ icon: Icon, text, time, type }, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[type]}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{text}</p>
              <p className="text-xs text-muted-foreground">{time}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
