import { useState, useEffect } from "react";
import { fetchMarineWeather, SafetyStatus } from "@/services/marineWeatherService";
import { AlertTriangle, ChevronRight, X, Volume2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Lottie from "lottie-react";

const GlobalSafetyBarrier = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [safety, setSafety] = useState<SafetyStatus | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [lastCheck, setLastCheck] = useState(0);

  useEffect(() => {
    const checkSafety = async () => {
      // Check every 5 minutes or on navigation
      if (Date.now() - lastCheck < 300000) return;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { safety: status } = await fetchMarineWeather(pos.coords.latitude, pos.coords.longitude);
          setSafety(status);
          setLastCheck(Date.now());
          
          if (status.status === "DANGER" || status.score <= 1) {
             setShowModal(true);
             speakWarning(status.alert + ". " + status.advice);
          }
        });
      }
    };

    checkSafety();
    const interval = setInterval(checkSafety, 600000); // 10 min check
    return () => clearInterval(interval);
  }, [lastCheck]);

  const speakWarning = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: any = { en: "en-US", hi: "hi-IN", kn: "kn-IN" };
    utterance.lang = langMap[language];
    window.speechSynthesis.speak(utterance);
    toast.error("🚨 CRITICAL MARINE ALERT: Audio Briefing Initiated.");
  };

  if (!showModal || !safety) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="glass-dark w-full max-w-sm rounded-[3.5rem] border-2 border-red-500/30 overflow-hidden shadow-[0_0_100px_rgba(239,68,68,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500 animate-pulse" />
        
        <button 
          onClick={() => setShowModal(false)}
          className="absolute top-6 right-6 p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center gap-6">
           <div className="relative">
              <div className="w-28 h-28 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center border border-red-500/20">
                 <ShieldAlert size={56} className="text-red-500 animate-bounce" />
              </div>
           </div>

           <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">MARINE DANGER</h2>
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Immediate Safety Protocol Required</p>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[12px] font-bold text-slate-300 leading-relaxed italic">
                 {safety.alert} — {safety.advice}
              </div>
           </div>

           <div className="w-full space-y-3">
              <button 
                onClick={() => { setShowModal(false); navigate("/sos"); }}
                className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                 <AlertTriangle size={18} /> Open Rescue Bridge
              </button>
              <button 
                onClick={() => { setShowModal(false); navigate("/safety"); }}
                className="w-full py-4 bg-white/10 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-white/20 transition-all"
              >
                 Watch Safety Drill <ChevronRight size={14} />
              </button>
           </div>

           <div className="flex items-center gap-2 opacity-40">
              <Volume2 size={12} className="text-primary" />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Audio Guide Active</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSafetyBarrier;
