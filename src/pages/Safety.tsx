import { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, BookOpen, Clock, Award, 
  ChevronRight, Zap, PlayCircle, Volume2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

// ── Native Sequence Animation with Emojis + Per-Step Images ──
const DRILLS: Record<string, { titleKey: string, steps: { tKey: string, emoji: string, img: string }[] }> = {
  vhf: {
    titleKey: "vhfTitle",
    steps: [
      { tKey: "vhfStep1", emoji: "📻", img: "/assets/vhf_step1.png" },
      { tKey: "vhfStep2", emoji: "🗣️", img: "/assets/vhf_step2.png" },
      { tKey: "vhfStep3", emoji: "📍", img: "/assets/vhf_step3.png" }
    ]
  },
  raft: {
    titleKey: "raftTitle",
    steps: [
      { tKey: "raftStep1", emoji: "🔓", img: "/assets/raft_step1.png" },
      { tKey: "raftStep2", emoji: "🌊", img: "/assets/raft_step2.png" },
      { tKey: "raftStep3", emoji: "🪢", img: "/assets/raft_step3.png" }
    ]
  },
  mob: {
    titleKey: "mobTitle",
    steps: [
      { tKey: "mobStep1", emoji: "⚠️", img: "/assets/mob_step1.png" },
      { tKey: "mobStep2", emoji: "🛟", img: "/assets/mob_step2.png" },
      { tKey: "mobStep3", emoji: "🚢", img: "/assets/mob_step3.png" }
    ]
  },
  flare: {
    titleKey: "flareTitle",
    steps: [
      { tKey: "flareStep1", emoji: "🧨", img: "/assets/flare_step1.png" },
      { tKey: "flareStep2", emoji: "🌬️", img: "/assets/flare_step2.png" },
      { tKey: "flareStep3", emoji: "🔥", img: "/assets/flare_step3.png" }
    ]
  }
};

const getTutorials = (t: any) => [
  {
    id: "vhf",
    duration: "03 Min",
    category: t("communication"),
    thumbnail: "/assets/vhf_drill.png"
  },
  {
    id: "raft",
    duration: "05 Min",
    category: t("equipment"),
    thumbnail: "/assets/raft_drill.png"
  },
  {
    id: "mob",
    duration: "02 Min",
    category: t("drills"),
    thumbnail: "/assets/mob_drill.png"
  },
  {
    id: "flare",
    duration: "02 Min",
    category: t("safety"),
    thumbnail: "/assets/flare_drill.png"
  }
];

const Safety = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedDrill, setSelectedDrill] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Voice Engine logic
  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any currently playing audio so it doesn't overlap
    window.speechSynthesis.cancel(); 

    const msg = new SpeechSynthesisUtterance(text);
    
    // Attempt to map language tightly. 
    // Kannada voice depends on OS availability. Hindi & English are standard.
    if (language === "hi") msg.lang = "hi-IN";
    else if (language === "kn") msg.lang = "kn-IN"; 
    else msg.lang = "en-IN";

    msg.rate = 0.9;  // Slightly slower for clarity
    msg.pitch = 1.0;

    window.speechSynthesis.speak(msg);
  }, [language]);

  // Handle Speech trigger
  useEffect(() => {
    if (!selectedDrill) {
      window.speechSynthesis?.cancel(); // Mute when entirely closed
      return;
    }
    // Speak immediately for current step
    const textToSpeak = t(DRILLS[selectedDrill].steps[currentStep].tKey);
    speakText(textToSpeak);
  }, [currentStep, selectedDrill, speakText, t]);

  // Handle auto-advance
  useEffect(() => {
    if (!selectedDrill) {
      setCurrentStep(0);
      return;
    }
    const timer = setInterval(() => {
      setCurrentStep(s => {
        const sequenceLength = DRILLS[selectedDrill].steps.length;
        if (s === sequenceLength - 1) return s; // Stop at last step naturally
        return s + 1;
      });
    }, 6000); // 6 Sec delay to allow voice to comfortably finish reading
    
    return () => clearInterval(timer);
  }, [selectedDrill]);

  return (
    <div className="flex flex-col gap-12 pb-40 selection:bg-rose-500/10 min-h-screen">
      {/* ── ACADEMY HEADER ── */}
      <div className="bg-slate-900 border-b border-white/10 p-10 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-6 mb-12">
          <button onClick={() => navigate(-1)} className="p-4 glass-dark rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all text-white active:scale-90 relative z-10">
            <ArrowLeft size={22} />
          </button>
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tight uppercase leading-none">{t("safety")}</h1>
            <div className="flex items-center gap-2 mt-3">
               <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,1)]" />
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] leading-none">{t("vesselIntegrity")} • {t("drills")}</p>
            </div>
          </div>
        </div>

        {/* Pro Stats Strip */}
        <div className="grid grid-cols-2 gap-4 relative z-10">
           <div className="glass-dark p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-5">
              <div className="p-3 bg-white/5 rounded-2xl text-rose-400"><Award size={24} /></div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{t("academyRank")}</p>
                 <p className="text-lg font-black text-rose-500 mt-1">{t("masterMariner")}</p>
              </div>
           </div>
           <div className="glass-dark p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-5">
              <div className="p-3 bg-white/5 rounded-2xl text-teal-400"><Clock size={24} /></div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{t("trainingHours")}</p>
                 <p className="text-lg font-black text-teal-400 mt-1">42.5 hrs</p>
              </div>
           </div>
        </div>
      </div>

      {/* ── DRILL GALLERY ── */}
      <div className="px-6 space-y-10">
         <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
               <BookOpen size={16} className="text-rose-500" /> {t("mandatoryDrills")}
            </h3>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
               <Zap size={14} strokeWidth={3} /> {t("verified")}
            </span>
         </div>
         <div className="space-y-8">
            {getTutorials(t).map((drill) => (
              <motion.div 
                key={drill.id}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedDrill(drill.id)}
                className="block glass-dark rounded-[3.5rem] border border-white/5 overflow-hidden group shadow-2xl hover:border-rose-500/30 transition-all cursor-pointer"
              >
                 <div className="relative h-64 overflow-hidden">
                    <img src={drill.thumbnail} alt={t(DRILLS[drill.id].titleKey)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/60 transition-colors" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-auto px-6 py-4 bg-rose-500 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                          <PlayCircle size={20} /> {t("startDrill")}
                       </div>
                    </div>
                    
                    <div className="absolute top-6 left-6 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl text-[9px] font-black text-white border border-white/10 uppercase tracking-widest">
                       {drill.category}
                    </div>
                    <div className="absolute bottom-6 right-6 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl text-[9px] font-black text-rose-400 border border-rose-500/20 uppercase tracking-widest flex items-center gap-2">
                       <Clock size={12} /> {drill.duration}
                    </div>
                 </div>
                 
                 <div className="p-8 space-y-3">
                    <h4 className="text-xl font-black text-white tracking-tighter leading-tight flex items-center justify-between">
                      {t(DRILLS[drill.id].titleKey)}
                      <ChevronRight size={20} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                 </div>
              </motion.div>
            ))}
          </div>
      </div>

      {/* ── NATIVE DRILL ANIMATOR OVERLAY ── */}
      <AnimatePresence>
        {selectedDrill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] bg-slate-950 flex flex-col"
          >
            {/* ── Close Button ── */}
            <button
              onClick={() => setSelectedDrill(null)}
              className="absolute top-10 right-10 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-rose-500 transition-all z-50 shadow-2xl"
            >
              <ChevronRight size={28} className="rotate-180" />
            </button>

            {/* ── Step Image (Top Half) — Animates per step ── */}
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`img-${currentStep}`}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src={DRILLS[selectedDrill].steps[currentStep].img}
                    alt={`Step ${currentStep + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient fade into bottom panel */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950" />
                </motion.div>
              </AnimatePresence>

              {/* Floating Drill Title Badge */}
              <div className="absolute top-8 left-6 flex items-center gap-3 z-10">
                <div className="px-5 py-2.5 bg-slate-950/70 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-2">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">
                    {t(DRILLS[selectedDrill].titleKey)}
                  </span>
                  <Volume2 size={14} className="text-rose-500 animate-pulse" />
                </div>
              </div>

              {/* Floating Emoji Badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`emoji-${currentStep}`}
                  initial={{ opacity: 0, y: 20, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.7 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="absolute bottom-8 left-6 z-10 w-20 h-20 rounded-[1.5rem] bg-slate-950/80 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-2xl text-[44px]"
                >
                  {DRILLS[selectedDrill].steps[currentStep].emoji}
                </motion.div>
              </AnimatePresence>

              {/* Step Progress Dots */}
              <div className="absolute bottom-10 right-6 flex items-center gap-2 z-10">
                {DRILLS[selectedDrill].steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`rounded-full transition-all duration-500 ${
                      idx === currentStep
                        ? "w-8 h-3 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                        : "w-3 h-3 bg-white/25 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* ── Instruction Panel (Bottom Half) ── */}
            <div className="flex-shrink-0 px-6 pb-10 pt-6 space-y-6">
              {/* Step Count Label */}
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 text-center">
                {t("step")} {currentStep + 1} / {DRILLS[selectedDrill].steps.length}
              </p>

              {/* Animated Instruction Text */}
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`text-${currentStep}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="text-[22px] font-black text-white leading-snug tracking-tight text-center max-w-xs mx-auto"
                >
                  {t(DRILLS[selectedDrill].steps[currentStep].tKey)}
                </motion.h2>
              </AnimatePresence>

              {/* Previous / Next Controls */}
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-20 transition-all hover:bg-white/10 active:scale-95"
                >
                  ← {t("previous")}
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(DRILLS[selectedDrill].steps.length - 1, currentStep + 1))}
                  disabled={currentStep === DRILLS[selectedDrill].steps.length - 1}
                  className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-20 transition-all hover:bg-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.5)] active:scale-95"
                >
                  {t("nextStep")} →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Safety;
