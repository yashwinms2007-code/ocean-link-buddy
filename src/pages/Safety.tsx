import { useState, useEffect } from "react";
import { ArrowLeft, GraduationCap, Award, Timer, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { SAFETY_TUTORIALS } from "@/services/safetyTutorialsData";
import SafetyTutorialCard from "@/components/SafetyTutorialCard";

const Safety = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"PREPARATION" | "EMERGENCY" | "NAVIGATION">("PREPARATION");

  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem("mitra_completed_drills") || "[]");
    setCompleted(cached);
  }, []);

  const toggleComplete = (id: string) => {
    const newCompleted = completed.includes(id) 
      ? completed.filter(c => c !== id) 
      : [...completed, id];
    setCompleted(newCompleted);
    localStorage.setItem("mitra_completed_drills", JSON.stringify(newCompleted));
    if (!completed.includes(id)) toast.success(t("trainingModuleCompleted") || "✅ Module Verified!");
  };

  const filteredTutorials = SAFETY_TUTORIALS.filter(m => m.category === activeTab);
  const progress = (completed.length / SAFETY_TUTORIALS.length) * 100;

  return (
    <div className="flex flex-col gap-6 min-h-screen pb-20 selection:bg-primary/20">
      {/* Header & Institute HUB */}
      <div className="bg-slate-900 border-b border-white/10 p-6 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <button onClick={() => navigate(-1)} className="p-4 glass-dark rounded-2xl hover:bg-white/10 transition-all text-white border border-white/10 shadow-lg">
            <ArrowLeft size={20} />
          </button>
          <div className="z-10 flex-1">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase leading-none">{t("safetyTraining") || "ಸುರಕ್ಷತಾ ತರಬೇತಿ"}</h1>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,1)]" />
               <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] leading-none">Mitra Marine Digital Training Institute</p>
            </div>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-xl group">
             <GraduationCap size={32} className="text-primary group-hover:rotate-12 transition-transform" />
          </div>
        </div>

        {/* Pro Training HUD */}
        <div className="glass-dark p-8 rounded-[3.5rem] border border-white/10 relative z-10 shadow-2xl backdrop-blur-3xl">
           <div className="flex justify-between items-end mb-6">
              <div>
                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-80">Training Certification Level</p>
                 <h2 className="text-5xl font-black text-white tracking-tighter">{Math.round(progress)}%</h2>
              </div>
              <div className="flex -space-x-3">
                 {completed.slice(0, 4).map((c, i) => (
                   <div key={i} className="w-12 h-12 rounded-full bg-primary border-4 border-slate-900 flex items-center justify-center text-slate-900 shadow-xl">
                      <Award size={20} strokeWidth={3} />
                   </div>
                 ))}
              </div>
           </div>

           <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div 
                 className="h-full bg-primary rounded-full transition-all duration-1500 ease-out shadow-[0_0_25px_rgba(14,165,233,0.6)]" 
                 style={{ width: `${progress}%` }} 
              />
           </div>
           
           <div className="flex justify-between mt-4">
              <div className="flex items-center gap-2">
                 <ShieldCheck size={12} className="text-primary" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{completed.length} of {SAFETY_TUTORIALS.length} Certified</span>
              </div>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">Pro Mode Active</span>
           </div>
        </div>
      </div>

      <div className="px-5 space-y-8">
        {/* Animated Drill Switcher */}
        <div className="flex glass-dark p-2 rounded-[2.5rem] border border-white/10 relative shadow-xl">
           {(["PREPARATION", "EMERGENCY", "NAVIGATION"] as const).map(cat => (
             <button
               key={cat}
               onClick={() => setActiveTab(cat)}
               className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest rounded-full transition-all duration-500 flex flex-col items-center gap-1 ${activeTab === cat ? 'bg-primary text-slate-900 shadow-2xl scale-105' : 'text-slate-500 hover:text-slate-300'}`}
             >
               {cat.charAt(0)}{cat.slice(1).toLowerCase()}
             </button>
           ))}
        </div>

        {/* Drill Initiation Banner */}
        <div className="p-8 rounded-[3.5rem] bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex flex-col items-center text-center gap-6 group hover:border-emerald-500/50 transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500/40 opacity-50" />
           <div className="relative">
              <Timer size={56} className="text-emerald-400 group-hover:rotate-12 transition-transform duration-500" />
              <Zap size={18} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
           </div>
           <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Start Practical Drill</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] opacity-60">Practice emergency procedures in real-time</p>
           </div>
           <button 
             onClick={() => { toast.success("Drill Protocol Initiated..."); setTimeout(() => navigate("/sos"), 1500); }}
             className="px-12 py-5 bg-emerald-500 text-white rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-[0_20px_40px_rgba(16,185,129,0.3)] group-hover:shadow-[0_20px_40px_rgba(16,185,129,0.5)] transition-all"
           >
              Initiate Drill Link
           </button>
        </div>

        {/* Training Grid */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">{activeTab} MODULES</h3>
              <div className="flex-1 h-[1px] bg-white/5" />
           </div>

           <div className="grid grid-cols-1 gap-6">
              {filteredTutorials.map((module) => (
                <SafetyTutorialCard 
                   key={module.id} 
                   module={module} 
                   isCompleted={completed.includes(module.id)}
                   onComplete={() => toggleComplete(module.id)}
                />
              ))}
           </div>
        </div>

        {/* Multi-language Audio Notice */}
        <div className="p-8 bg-white/[0.02] rounded-[3.5rem] border border-white/5 text-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] leading-relaxed relative z-10 px-6">
             All modules are localized in Kannada, Hindi, and English with offline audio support. 
             Mitra uses AI Synthesis to ensure clear instructions in low-literacy environments.
           </p>
        </div>

      </div>
    </div>
  );
};

export default Safety;
