import { useState, useEffect } from "react";
import { ArrowLeft, Globe, Bell, User, Settings as SettingsIcon, ShieldCheck, Moon, Info, LayoutTemplate, Volume2, ShieldAlert, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { toast } from "sonner";

const Settings = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Load functional settings from LocalStorage (Offline State)
  const [prefs, setPrefs] = useState({
    notifications: localStorage.getItem("mitra_notifs") !== "false", 
    darkMode: localStorage.getItem("mitra_darkMode") !== "false",    
    compactMode: localStorage.getItem("mitra_compactMode") === "true",
    voiceGuide: localStorage.getItem("mitra_voiceGuide") !== "false",
    safetyAlerts: localStorage.getItem("mitra_safetyAlerts") !== "false",
  });

  const toggleSetting = (key: keyof typeof prefs, label: string) => {
    const newState = !prefs[key];
    setPrefs(prev => ({ ...prev, [key]: newState }));
    localStorage.setItem(`mitra_${key}`, String(newState));
    
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', newState);
    }
    
    toast.success(`${label} ${newState ? 'Enabled' : 'Disabled'}`);
  };

  const resetTraining = () => {
    localStorage.removeItem("mitra_completed_drills");
    toast.info("Training Progress Reset Successfully");
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="bg-slate-900 border-b border-white/10 p-6 rounded-b-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        <button onClick={() => navigate(-1)} className="p-3.5 glass-dark rounded-2xl border border-white/10 hover:bg-white/10 transition-all shadow-xl relative z-10">
          <ArrowLeft size={20} />
        </button>
        <div className="relative z-10">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            SYSTEM <span className="text-primary">CORE</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{t("appSettings")}</p>
        </div>
        <div className="ml-auto relative z-10">
           <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <SettingsIcon size={22} className="text-primary animate-spin-slow" style={{ animationDuration: '8s' }} />
           </div>
        </div>
      </div>

      <div className="px-5 space-y-10">
        {/* Localization */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-2">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{t("languageSwitch")}</h3>
           </div>
           <div className="glass-dark p-6 rounded-[3rem] border border-white/10 shadow-2xl flex items-center justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
              <div className="flex items-center gap-5 relative z-10">
                 <div className="p-4 bg-primary/10 text-primary rounded-[1.5rem] border border-primary/20">
                    <Globe size={26} />
                 </div>
                 <div>
                    <span className="text-base font-black text-white tracking-tight block">{t("displayLanguage")}</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Select Regional Dialect</span>
                 </div>
              </div>
              <div className="relative z-10">
                <LanguageSwitcher />
              </div>
           </div>
        </div>

        {/* Marine Preferences */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-2">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">MARINE BROADCAST</h3>
           </div>
           <div className="glass-dark rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden">
              <SettingItem 
                 icon={Bell} 
                 label={t("notificationSettings")} 
                 active={prefs.notifications} 
                 onClick={() => toggleSetting('notifications', 'Push Notifications')} 
              />
              <SettingItem 
                 icon={Volume2} 
                 label="Voice Assistance HUD" 
                 active={prefs.voiceGuide} 
                 onClick={() => toggleSetting('voiceGuide', 'Voice HUD')}
              />
              <SettingItem 
                 icon={ShieldAlert} 
                 label="Global Safety Barrier" 
                 active={prefs.safetyAlerts} 
                 onClick={() => toggleSetting('safetyAlerts', 'Safety Barrier')}
                 last 
              />
           </div>
        </div>

        {/* Interface Preferences */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-2">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">SYSTEM INTERFACE</h3>
           </div>
           <div className="glass-dark rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden">
              <SettingItem 
                 icon={Moon} 
                 label="High-Contrast Night Mode" 
                 active={prefs.darkMode} 
                 onClick={() => toggleSetting('darkMode', 'Night Mode')}
              />
              <SettingItem 
                 icon={LayoutTemplate} 
                 label="Compact Telemetry View" 
                 active={prefs.compactMode} 
                 onClick={() => toggleSetting('compactMode', 'Compact UI')}
                 last 
              />
           </div>
        </div>

        {/* Reset Actions */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-2">
              <div className="w-1.5 h-4 bg-red-500 rounded-full" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">RECOVERY OPERATIONS</h3>
           </div>
           <button 
             onClick={resetTraining}
             className="w-full glass-dark p-6 rounded-[3rem] border border-white/5 shadow-xl flex items-center justify-between hover:border-red-500/30 transition-all group active:scale-95"
           >
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-red-500/10 text-red-500 rounded-[1.5rem] border border-red-500/20 group-hover:rotate-45 transition-transform">
                    <RotateCcw size={22} />
                 </div>
                 <div className="text-left">
                    <h4 className="text-base font-black text-white tracking-tight leading-none mb-1">Reset All Progress</h4>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Clear Training & Certifications</p>
                 </div>
              </div>
           </button>
        </div>

        {/* Version HUD */}
        <div className="p-10 glass-dark rounded-[4rem] border border-white/[0.03] text-center shadow-inner relative overflow-hidden">
           <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
           <div className="flex justify-center mb-6">
              <div className="p-5 bg-white/5 rounded-full border border-white/10 shadow-2xl">
                 <ShieldCheck size={40} className="text-primary" />
              </div>
           </div>
           <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-1">MITRA CORE</h3>
           <p className="text-primary text-[10px] font-black tracking-[0.5em] uppercase mb-8 ml-1">{t("tagline")}</p>
           <div className="flex items-center justify-center gap-3">
              <span className="px-5 py-2.5 bg-white/5 rounded-2xl text-[9px] font-black uppercase text-slate-500 border border-white/5 tracking-widest shadow-lg">Build v3.0-PREX</span>
              <span className="px-5 py-2.5 bg-green-500/10 rounded-2xl text-[9px] font-black uppercase text-green-500 border border-green-500/20 tracking-widest shadow-lg animate-pulse">Encrypted Bridge Active</span>
           </div>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
const SettingItem = ({ icon: Icon, label, active, onClick, last = false }: any) => (
  <div onClick={onClick} className={`p-8 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group active:bg-white/[0.02] ${!last && 'border-b border-white/5'}`}>
     <div className="flex items-center gap-5">
        <div className="p-4 bg-white/5 text-slate-500 rounded-[1.4rem] group-hover:bg-primary/20 group-hover:text-primary transition-all border border-white/5">
           <Icon size={22} className="relative z-10" />
        </div>
        <span className="text-base font-black text-slate-200 tracking-tight group-hover:text-white transition-colors">{label}</span>
     </div>
     <div className={`w-14 h-8 rounded-full p-1.5 transition-all duration-500 relative ${active ? 'bg-primary shadow-[0_0_15px_rgba(14,165,233,0.5)]' : 'bg-white/10'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-2xl transition-transform duration-500 transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
     </div>
  </div>
);

=======
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
export default Settings;
