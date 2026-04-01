import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import mitraLogo from "@/assets/mitra-logo.png";
import { ArrowRight, Waves } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-700" />
      
      <div className="relative z-10 mb-10">
        <div className="p-8 glass-dark rounded-[3.5rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
           <img src={mitraLogo} alt="Mitra" width={120} height={120} className="drop-shadow-[0_0_20px_rgba(14,165,233,0.5)]" />
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {t("appName")}
        </h1>
        <p className="text-primary text-xs font-black tracking-[0.4em] uppercase mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
          {t("tagline")}
        </p>
        
        <button
          onClick={() => navigate("/login")}
          className="group relative bg-primary text-white font-black text-xs uppercase tracking-[0.2em] px-12 py-5 rounded-2xl shadow-[0_20px_50px_rgba(14,165,233,0.3)] hover:scale-105 active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative flex items-center gap-3">
             {t("letsStart")} <ArrowRight size={18} />
          </span>
        </button>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30">
         <Waves className="text-white animate-bounce" size={24} />
         <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Mangalore Marine Tech</span>
      </div>
    </div>
  );
};

export default Splash;
