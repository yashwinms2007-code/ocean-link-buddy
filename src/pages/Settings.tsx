import { useState, useEffect } from "react";
import { ArrowLeft, Globe, Bell, Settings as SettingsIcon, ShieldCheck, Moon, LayoutTemplate, Volume2, ShieldAlert, RotateCcw, CheckCircle2, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { toast } from "sonner";

// ── Apply settings to the DOM immediately ─────────────────────────────────────
const applySettings = (prefs: Record<string, boolean>) => {
  // Dark Mode
  if (prefs.darkMode) {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }

  // Compact Mode — add/remove body class
  if (prefs.compactMode) {
    document.body.classList.add("compact-mode");
  } else {
    document.body.classList.remove("compact-mode");
  }

  // Broadcast a custom event so GlobalNotificationListener and other components can react
  window.dispatchEvent(new CustomEvent("mitra-settings-change", { detail: prefs }));
};
// ─────────────────────────────────────────────────────────────────────────────

const Settings = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const [prefs, setPrefs] = useState(() => ({
    notifications: localStorage.getItem("mitra_notifications") !== "false",
    darkMode: localStorage.getItem("mitra_darkMode") !== "false",
    compactMode: localStorage.getItem("mitra_compactMode") === "true",
    voiceGuide: localStorage.getItem("mitra_voiceGuide") !== "false",
    safetyAlerts: localStorage.getItem("mitra_safetyAlerts") !== "false",
  }));

  // Apply on mount (in case user navigates back to settings)
  useEffect(() => {
    applySettings(prefs);
  }, []);

  const toggleSetting = (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    localStorage.setItem(`mitra_${key}`, String(newPrefs[key]));
    applySettings(newPrefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetTraining = () => {
    localStorage.removeItem("mitra_completed_drills");
    toast.info("Training Progress Reset Successfully");
  };

  const clearAllNotifications = async () => {
    const { openDB } = await import("idb");
    const db = await openDB("mitra_notifications_db", 1);
    await db.clear("notifications");
    window.dispatchEvent(new Event("mitra-notification-change"));
    toast.success("All notifications cleared.");
  };

  const testNotification = () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("🌊 Mitra Test Alert", {
          body: "Your maritime alerts are working correctly!",
          icon: "/favicon.png"
        });
        toast.success("Test notification sent!");
      } else {
        Notification.requestPermission().then(perm => {
          if (perm === "granted") {
            new Notification("🌊 Mitra Test Alert", { body: "Alerts are now active!", icon: "/favicon.png" });
          } else {
            toast.error("Please allow notifications in your browser settings.");
          }
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 rounded-b-[3.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        <button onClick={() => navigate(-1)} className="p-3.5 bg-gray-100 rounded-2xl border border-gray-200 hover:bg-gray-200 transition-all shadow-md relative z-10 text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="relative z-10">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-gray-900">
            SYSTEM <span className="text-primary">CORE</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{t("appSettings")}</p>
        </div>
        <div className="ml-auto relative z-10 flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200 animate-in fade-in slide-in-from-right-4 duration-300">
              <CheckCircle2 size={14} className="text-green-600" />
              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Saved</span>
            </div>
          )}
          <div className="p-3 bg-gray-100 rounded-2xl border border-gray-200">
            <SettingsIcon size={22} className="text-primary" style={{ animation: 'spin 8s linear infinite' }} />
          </div>
        </div>
      </div>

      <div className="px-5 space-y-10">

        {/* Language */}
        <Section title={t("languageSwitch")} color="bg-primary">
          <div className="bg-white p-6 rounded-[3rem] border border-gray-200 shadow-md flex items-center justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="p-4 bg-primary/10 text-primary rounded-[1.5rem] border border-primary/20">
                <Globe size={26} />
              </div>
              <div>
                <span className="text-base font-black text-gray-900 tracking-tight block">{t("displayLanguage")}</span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Select Regional Dialect</span>
              </div>
            </div>
            <div className="relative z-10">
              <LanguageSwitcher />
            </div>
          </div>
        </Section>

        {/* Marine Broadcast */}
        <Section title="MARITIME BROADCAST" color="bg-primary">
          <div className="bg-white rounded-[3.5rem] border border-gray-200 shadow-md overflow-hidden">
            <SettingItem
              icon={Bell}
              label="Push Notifications"
              desc="Receive weather & SOS alerts"
              active={prefs.notifications}
              onClick={() => toggleSetting('notifications')}
            />
            <SettingItem
              icon={Volume2}
              label="Voice Assistance"
              desc="Audio guidance for AI & alerts"
              active={prefs.voiceGuide}
              onClick={() => toggleSetting('voiceGuide')}
            />
            <SettingItem
              icon={ShieldAlert}
              label="Safety Barriers"
              desc="Block unsafe departures automatically"
              active={prefs.safetyAlerts}
              onClick={() => toggleSetting('safetyAlerts')}
              last
            />
          </div>
          <button
            onClick={testNotification}
            className="w-full mt-3 bg-white p-5 rounded-[2rem] border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm"
          >
            <Bell size={16} /> Test System Notification
          </button>
        </Section>

        {/* Interface */}
        <Section title="SYSTEM INTERFACE" color="bg-purple-500">
          <div className="bg-white rounded-[3.5rem] border border-gray-200 shadow-md overflow-hidden">
            <SettingItem
              icon={prefs.darkMode ? Moon : Sun}
              label="Night Mode"
              desc="High-contrast dark interface"
              active={prefs.darkMode}
              onClick={() => toggleSetting('darkMode')}
            />
            <SettingItem
              icon={LayoutTemplate}
              label="Compact View"
              desc="Condensed telemetry display"
              active={prefs.compactMode}
              onClick={() => toggleSetting('compactMode')}
              last
            />
          </div>
        </Section>

        {/* Recovery Actions */}
        <Section title="RECOVERY OPERATIONS" color="bg-red-500">
          <div className="space-y-3">
            <button
              onClick={resetTraining}
              className="w-full bg-white p-6 rounded-[3rem] border border-gray-200 shadow-md flex items-center justify-between hover:border-red-300 hover:bg-red-50 transition-all group active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-red-100 text-red-500 rounded-[1.5rem] border border-red-200 group-hover:rotate-45 transition-transform">
                  <RotateCcw size={22} />
                </div>
                <div className="text-left">
                  <h4 className="text-base font-black text-gray-900 tracking-tight leading-none mb-1">Reset Training Progress</h4>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Clear drills & certifications</p>
                </div>
              </div>
            </button>
            <button
              onClick={clearAllNotifications}
              className="w-full bg-white p-6 rounded-[3rem] border border-gray-200 shadow-md flex items-center justify-between hover:border-orange-300 hover:bg-orange-50 transition-all group active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-orange-100 text-orange-500 rounded-[1.5rem] border border-orange-200 group-hover:scale-110 transition-transform">
                  <Bell size={22} />
                </div>
                <div className="text-left">
                  <h4 className="text-base font-black text-gray-900 tracking-tight leading-none mb-1">Clear All Alerts</h4>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Wipe notification history</p>
                </div>
              </div>
            </button>
          </div>
        </Section>

        {/* Version HUD */}
        <div className="p-10 bg-white rounded-[4rem] border border-gray-200 text-center shadow-md relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex justify-center mb-6">
            <div className="p-5 bg-primary/10 rounded-full border border-primary/20 shadow-lg">
              <ShieldCheck size={40} className="text-primary" />
            </div>
          </div>
          <h3 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase mb-1">MITRA CORE</h3>
          <p className="text-primary text-[10px] font-black tracking-[0.5em] uppercase mb-8 ml-1">{t("tagline")}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="px-5 py-2.5 bg-gray-100 rounded-2xl text-[9px] font-black uppercase text-gray-500 border border-gray-200 tracking-widest">Build v3.0-PREX</span>
            <span className="px-5 py-2.5 bg-green-50 rounded-2xl text-[9px] font-black uppercase text-green-600 border border-green-200 tracking-widest animate-pulse">All Systems Online</span>
          </div>
        </div>

      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Section = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 px-2">
      <div className={`w-1.5 h-4 ${color} rounded-full`} />
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">{title}</h3>
    </div>
    {children}
  </div>
);

const SettingItem = ({ icon: Icon, label, desc, active, onClick, last = false }: any) => (
  <div
    onClick={onClick}
    className={`p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-all group active:bg-gray-100 ${!last ? 'border-b border-gray-100' : ''}`}
  >
    <div className="flex items-center gap-5">
      <div className="p-3.5 bg-gray-100 text-gray-500 rounded-[1.4rem] group-hover:bg-primary/15 group-hover:text-primary transition-all border border-gray-200">
        <Icon size={20} className="relative z-10" />
      </div>
      <div>
        <span className="text-sm font-black text-gray-900 tracking-tight group-hover:text-gray-700 transition-colors block">{label}</span>
        <span className="text-[9px] text-gray-400 font-bold">{desc}</span>
      </div>
    </div>
    <div className={`w-14 h-8 rounded-full p-1.5 transition-all duration-500 relative flex-shrink-0 ${active ? 'bg-primary shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-gray-200'}`}>
      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-500 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default Settings;
