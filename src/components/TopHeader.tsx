import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { Bell, Search, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAllNotifications } from "@/services/notificationStorage";

const TopHeader = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = async () => {
      const notifs = await getAllNotifications();
      setUnreadCount(notifs.filter(n => !n.read).length);
    };

    updateUnreadCount();
    window.addEventListener("mitra-notification-change", updateUnreadCount);

    return () => {
      window.removeEventListener("mitra-notification-change", updateUnreadCount);
    };
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[5000] flex items-center justify-between p-4 px-8 pointer-events-none"
    >
      {/* System Status Bubble */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="super-glass p-2.5 px-8 rounded-full flex items-center gap-3 border border-emerald-500/10">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
           <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">{t("systemActive")}</span>
        </div>
      </div>

      {/* Global Actions Bubble - Moved Map icon near notifications */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="super-glass p-2 px-6 rounded-full flex items-center gap-5 border border-white/20">
           <LanguageSwitcher />
           <div className="w-px h-6 bg-slate-200" />
           <div className="flex items-center gap-5 text-slate-500">
              <button 
                onClick={() => navigate("/chatbot")}
                className="hover:text-primary transition-all active:scale-125 transform"
                title="Search / AI Bot"
              >
                 <Search size={18} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => navigate("/sea-map")}
                className="hover:text-primary transition-all active:scale-125 transform"
                title="Maritime Map"
              >
                 <MapIcon size={18} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => navigate("/notifications")}
                className="hover:text-primary transition-all active:scale-125 transform relative"
                title="Alert Hub"
              >
                 <Bell size={18} strokeWidth={2.5} />
                 {unreadCount > 0 && (
                   <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center bg-red-500 rounded-full border-2 border-white text-[8px] font-black text-white">
                     {unreadCount > 9 ? '9+' : unreadCount}
                   </span>
                 )}
              </button>
           </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
