import { ArrowLeft, Globe, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BottomNav from "@/components/BottomNav";

const Settings = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("settings")}</h1>
        </div>
      </div>

      <div className="px-5 space-y-3">
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={20} className="text-primary" />
            <span className="font-medium text-foreground">{t("language")}</span>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-primary" />
            <span className="font-medium text-foreground">{t("notifications")}</span>
          </div>
          <div className="w-12 h-6 bg-safe rounded-full relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-card rounded-full shadow" />
          </div>
        </div>

        <button onClick={() => navigate("/profile")} className="glass-card rounded-2xl p-5 flex items-center gap-3 w-full">
          <User size={20} className="text-primary" />
          <span className="font-medium text-foreground">{t("profile")}</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
