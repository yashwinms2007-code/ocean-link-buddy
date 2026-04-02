import { motion } from "framer-motion";
import { 
  ShoppingCart, Map, CloudRain, ShieldCheck, 
  LayoutDashboard, Settings, HelpCircle
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNav = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: t("home"), path: "/dashboard" },
    { icon: Map, label: t("pfzFinder"), path: "/fish-detection" },
    { icon: ShoppingCart, label: t("fishMarket"), path: "/fish-market" },
    { icon: null, label: "SOS", path: "/sos", isSpecial: true },
    { icon: CloudRain, label: t("weather"), path: "/weather" },
    { icon: ShieldCheck, label: t("safety"), path: "/safety" },
    { icon: Settings, label: t("settings"), path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[2000] px-2 pb-6 pointer-events-none">
       <motion.div 
         initial={{ y: 100, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ type: "spring", damping: 25, stiffness: 200 }}
         className="super-glass max-w-2xl mx-auto rounded-[3.5rem] p-2 flex items-center justify-between pointer-events-auto shadow-[0_25px_60px_rgba(0,0,0,0.4)] border-2 border-white/30"
       >
          {navItems.map((item, i) => {
            if (item.isSpecial) {
              return (
                <button 
                  key="sos"
                  onClick={() => navigate("/sos")}
                  className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-600/40 hover:scale-115 active:scale-90 transition-all group relative -mt-10 mb-2 border-4 border-white"
                >
                   <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-25" />
                   <span className="font-black text-[10px]">SOS</span>
                </button>
              );
            }
            
            const isActive = location.pathname === item.path;
            const isDanger = item.path === "/sos";
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all relative group ${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {item.icon && <item.icon size={22} strokeWidth={isActive ? 3 : 2.5} className={`${isActive ? 'scale-115 text-primary' : 'text-slate-600 group-hover:text-slate-950 group-hover:scale-105'} transition-all`} />}
                <p className={`text-[10px] font-black uppercase tracking-tighter mt-1 transition-all text-center leading-none ${isActive ? 'text-primary opacity-100' : 'text-slate-700 opacity-70 group-hover:opacity-100 group-hover:text-slate-950'}`}>
                   {item.label}
                </p>
                {isActive && (
                   <motion.div layoutId="navIndicator" className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                )}
              </Link>
            );
          })}
       </motion.div>
    </nav>
  );
};

export default BottomNav;
