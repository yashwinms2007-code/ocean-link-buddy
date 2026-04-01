import { useNavigate, useLocation } from "react-router-dom";
<<<<<<< HEAD
import { Map, Bell, User, LayoutGrid, Compass } from "lucide-react";
=======
import { Home, Map, Bell, User } from "lucide-react";
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const tabs = [
<<<<<<< HEAD
    { path: "/dashboard", icon: LayoutGrid, label: t("home") },
    { path: "/sea-map", icon: Compass, label: t("map") },
=======
    { path: "/dashboard", icon: Home, label: t("home") },
    { path: "/sea-map", icon: Map, label: t("map") },
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
    { path: "/notifications", icon: Bell, label: t("alerts") },
    { path: "/profile", icon: User, label: t("profile") },
  ];

  return (
<<<<<<< HEAD
    <nav className="fixed bottom-6 left-6 right-6 z-[1000] selection:bg-none">
      <div className="glass-dark border border-white/10 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.6)] px-8 py-3.5 max-w-lg mx-auto flex justify-between items-center relative overflow-hidden backdrop-blur-2xl">
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-30 pointer-events-none" />
        
=======
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
<<<<<<< HEAD
              className="relative flex flex-col items-center gap-1.5 group py-1 transition-all active:scale-90"
            >
              <div className={`p-3 rounded-[1.4rem] transition-all duration-500 relative ${active ? 'bg-primary text-slate-900 shadow-[0_0_20px_rgba(14,165,233,0.6)] scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
                <Icon size={24} strokeWidth={active ? 3 : 2} className="relative z-10" />
                {active && (
                  <div className="absolute inset-0 bg-white/20 rounded-[1.4rem] animate-pulse pointer-events-none" />
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${active ? 'text-primary opacity-100 translate-y-0' : 'text-slate-600 opacity-60 translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                {label}
              </span>
              
              {/* Active Indicator Dot */}
              {active && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(14,165,233,1)] animate-bounce" />
              )}
=======
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
