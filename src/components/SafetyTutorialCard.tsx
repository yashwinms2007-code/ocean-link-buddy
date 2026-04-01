import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { Volume2, CheckCircle2, Play, Info } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { TutorialModule } from "@/services/safetyTutorialsData";
import { toast } from "sonner";

interface Props {
  module: TutorialModule;
  isCompleted: boolean;
  onComplete: () => void;
}

const SafetyTutorialCard = ({ module, isCompleted, onComplete }: Props) => {
  const { language } = useLanguage();
  const content = (module as any)[language];

  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch(module.lottieUrl)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Lottie fetch error:", err));
  }, [module.lottieUrl]);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(content.desc);
    const langMap: Record<Language, string> = { en: "en-US", hi: "hi-IN", kn: "kn-IN" };
    msg.lang = langMap[language];
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
    toast.info("🔊 " + (language === 'kn' ? 'ಆಡಿಯೋ ಪ್ಲೇ ಆಗುತ್ತಿದೆ...' : 'Playing Audio Tutorial...'));
  };

  return (
    <div className={`glass-dark p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group ${isCompleted ? 'border-primary/20 bg-primary/5' : 'border-white/10'}`}>
      {/* Lottie Animation Header */}
      <div className="bg-white/5 rounded-[2rem] p-4 mb-6 relative overflow-hidden h-[180px] flex items-center justify-center border border-white/5">
        <div className="w-40 h-40 group-hover:scale-110 transition-transform duration-700">
           {animationData ? (
             <Lottie 
               animationData={animationData} 
               loop={true} 
               autoplay={true}
               style={{ width: '100%', height: '100%' }}
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
             </div>
           )}
        </div>
        <div className="absolute top-4 left-4">
           <span className="text-[7px] font-black bg-white/10 px-2.5 py-1 rounded-full text-slate-400 uppercase tracking-widest">{module.category}</span>
        </div>
        {isCompleted && (
           <div className="absolute top-4 right-4 bg-primary text-slate-900 p-1.5 rounded-full shadow-lg border-2 border-slate-950 animate-in zoom-in">
              <CheckCircle2 size={16} />
           </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
           <h3 className="font-black text-white text-xl tracking-tighter mb-1 uppercase">{content.title}</h3>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tutorial Link • Multi-Lang</p>
        </div>

        <div className="bg-black/20 p-5 rounded-[2rem] border border-white/[0.03] space-y-3">
           <p className="text-[13px] font-bold text-white leading-relaxed tracking-tight group-hover:text-primary transition-colors">
             "{content.desc}"
           </p>
        </div>

        <div className="flex gap-3">
           <button 
              onClick={handleSpeak}
              className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[1.5rem] flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] transition-all"
           >
              <Volume2 size={16} className="text-primary" />
              Listen (ಕೇಳಿ)
           </button>
           <button 
             onClick={onComplete}
             className={`p-4 rounded-[1.5rem] border transition-all ${isCompleted ? 'bg-primary border-primary text-slate-900 shadow-xl' : 'bg-white/5 border-white/10 text-slate-400'}`}
           >
              {isCompleted ? <CheckCircle2 size={18} /> : <Play size={18} />}
           </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyTutorialCard;
