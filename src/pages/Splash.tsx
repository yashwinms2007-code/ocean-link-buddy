import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import mitraLogo from "@/assets/mitra-logo.png";

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen ocean-gradient flex flex-col items-center justify-center px-6 text-center">
      <div className="animate-wave mb-6">
        <img src={mitraLogo} alt="Mitra" width={120} height={120} className="drop-shadow-2xl" />
      </div>
      <h1 className="text-4xl font-extrabold text-primary-foreground tracking-tight mb-2" style={{ animationDelay: "0.2s" }}>
        {t("appName")}
      </h1>
      <p className="text-primary-foreground/80 text-lg font-medium mb-10 animate-fade-up" style={{ animationDelay: "0.4s" }}>
        {t("tagline")}
      </p>
      <button
        onClick={() => navigate("/login")}
        className="bg-card text-primary font-bold text-lg px-10 py-3 rounded-full shadow-xl hover:scale-105 transition-transform animate-fade-up"
        style={{ animationDelay: "0.6s" }}
      >
        {t("letsStart")}
      </button>
    </div>
  );
};

export default Splash;
