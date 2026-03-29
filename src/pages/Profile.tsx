import { ArrowLeft, User, Phone, Globe, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BottomNav from "@/components/BottomNav";
import mitraLogo from "@/assets/mitra-logo.png";

const Profile = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="ocean-gradient px-5 pt-6 pb-10 rounded-b-3xl flex flex-col items-center">
        <div className="w-full flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card/20">
            <ArrowLeft size={20} className="text-primary-foreground" />
          </button>
        </div>
        <img src={mitraLogo} alt="Mitra" width={64} height={64} className="mb-2" />
        <h1 className="text-xl font-bold text-primary-foreground">{t("appName")}</h1>
      </div>

      <div className="px-5 -mt-4 space-y-3">
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
            <User size={24} className="text-secondary-foreground" />
          </div>
          <div>
            <p className="font-bold text-foreground">Ramesh Kumar</p>
            <p className="text-sm text-muted-foreground">+91 9876543210</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-primary" />
              <span className="font-medium text-foreground">{t("language")}</span>
            </div>
            <LanguageSwitcher />
          </div>

          <button className="w-full flex items-center gap-3 py-2 text-foreground">
            <Phone size={20} className="text-primary" />
            <span className="font-medium">{t("editProfile")}</span>
          </button>

          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 py-2 text-danger">
            <LogOut size={20} />
            <span className="font-medium">{t("logout")}</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
