<<<<<<< HEAD
import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, CloudRain, Fish, Bell, CheckCircle2, BellOff, Info, ShieldAlert, Waves, Zap, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { getAllNotifications, markAllAsReadSync, markAsRead, DBNotification } from "@/services/notificationStorage";
=======
import { ArrowLeft, AlertTriangle, CloudRain, Fish } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

const notifications = [
  { icon: AlertTriangle, text: "SOS alert from nearby boat", time: "2 min ago", type: "danger" as const },
  { icon: CloudRain, text: "Heavy rain expected in 3 hours", time: "15 min ago", type: "warning" as const },
  { icon: Fish, text: "New fish listings in Mangalore market", time: "1 hour ago", type: "info" as const },
];
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5

const Notifications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
<<<<<<< HEAD
  
  const notificationsEnabled = localStorage.getItem("mitra_notifs") !== "false";
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const notifs = await getAllNotifications();
    setNotifications(notifs);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadSync();
    await loadNotifications();
  };

  const handleNotificationClick = async (notif: DBNotification) => {
    if (!notif.read) {
      await markAsRead(notif.id);
      await loadNotifications();
    }
  };

  const typeStyles: Record<string, string> = {
    danger: "bg-red-500/20 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
    warning: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
    info: "bg-primary/20 text-primary border-primary/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]",
    success: "bg-green-500/20 text-green-500 border-green-500/20"
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "danger": return ShieldAlert;
      case "warning": return Waves;
      case "success": return CheckCircle2;
      default: return Info;
    }
  };

  const filteredNotifs = filter === "ALL" 
    ? notifications 
    : notifications.filter(n => n.type === filter.toLowerCase());

  return (
    <div className="flex flex-col gap-6 pb-24 selection:bg-primary/20">
      {/* Header Overhaul */}
      <div className="bg-slate-900 border-b border-white/10 p-6 rounded-b-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
        
        <button onClick={() => navigate(-1)} className="p-3.5 glass-dark rounded-2xl border border-white/10 hover:bg-white/10 transition-all shadow-xl relative z-10">
          <ArrowLeft size={20} />
        </button>
        <div className="relative z-10">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-white">
             ALERT <span className="text-primary italic">HUB</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{t("stayInformed")}</p>
        </div>
        <div className="ml-auto flex items-center gap-3 relative z-10">
           {notificationsEnabled ? (
              <div className="relative p-3 bg-primary/10 rounded-2xl border border-primary/20">
                 <Bell size={24} className="text-primary animate-pulse" />
                 {notifications.some(n => !n.read) && (
                   <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-ping" />
                 )}
              </div>
           ) : (
             <div className="p-3 bg-white/5 rounded-2xl border border-white/10 opacity-50">
                <BellOff size={24} className="text-slate-500" />
             </div>
           )}
        </div>
      </div>

      <div className="px-5 space-y-6">
        {!notificationsEnabled ? (
           <div className="mt-12 p-10 glass-dark rounded-[4rem] border border-red-500/10 flex flex-col items-center text-center gap-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 bg-slate-800/50 rounded-full border border-slate-700/50 shadow-inner group-hover:rotate-12 transition-transform">
                 <BellOff size={64} className="text-slate-600" />
              </div>
              <div className="relative z-10">
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Broadcasting Offline</h2>
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto">
                    Push alerts are silenced. Emergency broadcast is still active via SOS link.
                 </p>
              </div>
              <button 
                onClick={() => navigate("/settings")}
                className="mt-4 px-12 py-5 bg-primary text-slate-950 rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/30 active:scale-95 transition-all relative z-10"
              >
                 Initialize Alerts
              </button>
           </div>
        ) : (
           <>
              {/* Category Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                 {["ALL", "DANGER", "WARNING", "INFO"].map(cat => (
                   <button
                     key={cat}
                     onClick={() => setFilter(cat)}
                     className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex-shrink-0 ${filter === cat ? 'bg-primary text-slate-950 border-primary shadow-xl' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'}`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>

              <div className="flex items-center justify-between px-2 mt-4">
                 <div className="flex items-center gap-2">
                    <Zap size={10} className="text-primary animate-pulse" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{notifications.length} TRANSMISSIONS</h3>
                 </div>
                 <button 
                   onClick={handleMarkAllAsRead}
                   className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-colors bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20"
                 >
                   {t("markAllAsRead")}
                 </button>
              </div>
              
              <div className="space-y-4">
                 {filteredNotifs.length === 0 ? (
                   <div className="py-20 text-center glass-dark rounded-[3.5rem] border border-white/5 opacity-40">
                      <CheckCircle2 size={40} className="mx-auto mb-4 text-slate-700" />
                      <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">No Active Alerts in Buffer</p>
                   </div>
                 ) : (
                   filteredNotifs.map((notif, i) => {
                     const Icon = getIconForType(notif.type);
                     return (
                       <div 
                         key={notif.id} 
                         className={`glass-dark rounded-[2.5rem] p-7 flex items-center gap-6 border shadow-2xl group transition-all cursor-pointer relative overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-500 ${notif.read ? 'border-white/5 opacity-60' : 'border-white/10 hover:border-primary/50'}`}
                         style={{ animationDelay: `${i * 0.05}s` }}
                         onClick={() => handleNotificationClick(notif)}
                       >
                         {!notif.read && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
                         
                         <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 border transition-all group-hover:scale-110 ${typeStyles[notif.type]}`}>
                           <Icon size={28} />
                         </div>
                         
                         <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-1">
                              <p className={`text-lg font-black leading-none tracking-tight group-hover:text-primary transition-colors ${notif.read ? 'text-slate-400' : 'text-white'}`}>{notif.title}</p>
                              <span className="text-[9px] font-bold text-slate-600 whitespace-nowrap">{formatDistanceToNow(notif.timestamp, { addSuffix: true })}</span>
                           </div>
                           {notif.body && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium line-clamp-2">{notif.body}</p>}
                           
                           {!notif.read && (
                             <div className="flex items-center gap-2 mt-3 p-2 bg-primary/10 rounded-xl border border-primary/20 w-fit">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                <span className="text-[8px] font-black text-primary uppercase tracking-widest">New Transmission</span>
                             </div>
                           )}
                         </div>

                         <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                            <Navigation size={18} className="text-slate-950" />
                         </div>
                       </div>
                     );
                   })
                 )}
              </div>

              {filteredNotifs.length > 0 && (
                <div className="p-8 glass-dark rounded-[3rem] border border-white/5 text-center mt-10">
                   <div className="flex flex-col items-center gap-3 opacity-40">
                      <ShieldAlert size={28} className="text-slate-600" />
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">End of Alert Stream</p>
                   </div>
                </div>
              )}
           </>
        )}
      </div>
=======

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
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
    </div>
  );
};

export default Notifications;
