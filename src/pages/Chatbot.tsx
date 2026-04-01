<<<<<<< HEAD
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX, Sparkles, Activity, ShieldCheck, Zap, Radio, Globe, Navigation, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { fetchSatelliteData, getOceanStats } from "@/services/oceanDataService";
import { fetchMarineWeather } from "@/services/marineWeatherService";

const Chatbot = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [history, setHistory] = useState([
    { role: 'ai', text: t("chatbotWelcome"), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      const langMap: Record<Language, string> = { en: "en-US", hi: "hi-IN", kn: "kn-IN" };
      recognitionRef.current.lang = langMap[language];

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMsg(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Voice link intermittent. Try again.");
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history, isThinking]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast.error("Speech engine not initialized.");
        return;
      }
      stopSpeaking();
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("🎤 Listening for Audio-Link...");
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<Language, string> = { en: "en-US", hi: "hi-IN", kn: "kn-IN" };
    utterance.lang = langMap[language];
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const handleSend = async (textToSend?: string) => {
    const finalMsg = textToSend || msg;
    if (!finalMsg.trim()) return;
    
    setHistory(prev => [...prev, { role: 'user', text: finalMsg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMsg("");
    setIsThinking(true);
    
    setTimeout(async () => {
      let responseText = t("aiDefaultResponse");
      const lowerMsg = finalMsg.toLowerCase();

      const isFisheries = lowerMsg.includes("fish") || lowerMsg.includes("ಮೀನು") || lowerMsg.includes("मछली") || lowerMsg.includes("catch");
      const isWeather = lowerMsg.includes("weather") || lowerMsg.includes("sea") || lowerMsg.includes("ಹವಾಮಾನ") || lowerMsg.includes("मौसम");

      if (isFisheries || isWeather) {
         try {
            const { current: marine, safety } = await fetchMarineWeather(12.87, 74.88);
            const satResponse = await fetchSatelliteData(12.87, 74.88);
            const satStats = getOceanStats(satResponse);

            if (safety.status === "DANGER") {
               responseText = language === 'kn' 
                 ? `🚨 ತುರ್ತು ಎಚ್ಚರಿಕೆ: ಇಂದು ಹವಾಮಾನವು ಪ್ರತಿಕೂಲವಾಗಿದೆ. ಅಲೆಗಳ ಎತ್ತರ ${marine.waveHeight} ಮೀಟರ್ ಇದೆ. ಮೀನುಗಾರಿಕೆಗೆ ಹೋಗುವುದು ಅಪಾಯಕಾರಿ.`
                 : `🚨 SCIENTIFIC ALERT: High-risk conditions detected. Wave sync: ${marine.waveHeight}m. Marine advisory recommends staying in port.`;
            } else {
               responseText = language === 'kn'
                 ? `ನಾನು ವಿಶ್ಲೇಷಿಸಿದ ಮಾಹಿತಿಯಂತೆ, ${satStats.bestFishingZone} ಪ್ರದೇಶದಲ್ಲಿ ಅಲೆಗಳು ${marine.waveHeight} ಮೀಟರ್ ಇದ್ದು, ಮೀನುಗಾರಿಕೆಗೆ ಉತ್ತಮ ಕ್ಷಮತೆ ಇದೆ. ಉಷ್ಣಾಂಶ ${satStats.averageSST}°C ಆಗಿದೆ.`
                 : `Telemetry synchronized. I've detected a high-probability convergence zone at ${satStats.bestFishingZone}. Current: ${marine.currentVelocity}m/s. Thermal: ${satStats.averageSST}°C. Safe for deployment.`;
            }
         } catch (e) {
            responseText = "Satellite link intermittent. Based on last scan, coastal regions are stable.";
         }
      }

      setHistory(prev => [...prev, { 
        role: 'ai', 
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
      setIsThinking(false);
      speak(responseText);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden selection:bg-primary/20">
      {/* ── HEADER OVERHAUL ── */}
      <div className="bg-slate-900 border-b border-white/10 p-6 rounded-b-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-20 overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={() => navigate(-1)} className="p-3.5 glass-dark rounded-2xl hover:bg-white/10 transition-all border border-white/10 shadow-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
               MITRA <span className="text-primary font-black px-2 py-0.5 bg-primary/10 rounded-lg text-xs leading-none">AI CORE</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
               <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] leading-none">Advanced Marine Intelligence • V2.0</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
             {isSpeaking && (
                <button onClick={stopSpeaking} className="p-3 bg-red-500/10 text-red-500 rounded-full animate-pulse border border-red-500/20">
                   <VolumeX size={18} />
                </button>
             )}
             <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <Globe size={18} className="text-slate-500" />
             </div>
          </div>
        </div>
      </div>

      {/* ── MESSAGE STREAM ── */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 pt-8 pb-32 space-y-8 scroll-smooth scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed"
      >
        {history.map((h, i) => (
          <div key={i} className={`flex flex-col ${h.role === 'ai' ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
             <div className="flex items-center gap-2 mb-1.5 px-2">
                <span className="text-[7px] font-black uppercase tracking-widest text-slate-600">{h.role === 'ai' ? 'Mitra Intelligence' : 'Vessel Master'}</span>
                <span className="text-[7px] font-bold text-slate-700">{h.timestamp}</span>
             </div>
             
             <div className={`max-w-[88%] p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group ${
               h.role === 'ai' 
               ? 'bg-slate-900 border border-white/10 text-slate-100 rounded-tl-none' 
               : 'bg-primary text-slate-900 rounded-tr-none font-black'
             }`}>
               {h.role === 'ai' && <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />}
               <p className="text-sm leading-relaxed tracking-tight relative z-10">{h.text}</p>
               
               {h.role === 'ai' && (
                 <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 opacity-40">
                   <ShieldCheck size={10} />
                   <span className="text-[7px] font-black uppercase tracking-widest">Source: MAR-DeepScan-API</span>
                 </div>
               )}
             </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex flex-col items-start animate-pulse">
             <div className="flex items-center gap-2 px-6 py-4 bg-white/5 rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-0" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-300" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2">Syncing Ocean Data...</span>
             </div>
          </div>
        )}
      </div>

      {/* ── COMMAND INPUT HUD ── */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-30">
        <div className="glass-dark p-3 rounded-[3.5rem] flex gap-3 shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 max-w-2xl mx-auto backdrop-blur-3xl">
          <button 
            onClick={toggleListening}
            className={`p-5 rounded-full transition-all duration-500 relative group ${
              isListening 
              ? 'bg-red-500 text-white scale-110 shadow-[0_0_30px_rgba(239,68,68,0.5)]' 
              : 'bg-white/[0.03] text-slate-400 hover:text-primary hover:bg-white/5'
            }`}
          >
            {isListening ? (
               <>
                  <MicOff size={28} />
                  <div className="absolute inset-x-[-15px] inset-y-[-15px] border-2 border-red-500/30 rounded-full animate-ping" />
               </>
            ) : <Mic size={28} />}
          </button>
          
          <input 
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : "Command Mitra Intelligence..."}
            className="flex-1 bg-transparent text-white px-3 outline-none placeholder:text-slate-600 font-bold text-base"
          />
          
          <button 
            onClick={() => handleSend()} 
            disabled={!msg.trim()}
            className={`p-5 rounded-full transition-all duration-300 ${
               msg.trim() 
               ? 'bg-primary text-slate-900 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95' 
               : 'bg-white/5 text-slate-700 grayscale cursor-not-allowed'
            }`}
          >
             <Send size={28} />
          </button>
        </div>
        
        {/* Voice Hint */}
        <div className="flex justify-center mt-3">
           <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-2">
              <Sparkles size={10} className="text-primary" /> Supported in Kannada, Hindi & English
           </p>
        </div>
      </div>
=======
import { useState, useRef } from "react";
import { ArrowLeft, Send, Mic, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

type Message = { role: "user" | "bot"; text: string };

const defaultMessages: Message[] = [
  { role: "bot", text: "Hello! I'm Mitra Assistant 🤖 Ask me about weather, safety, or navigation." },
];

const Chatbot = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    const botReply: Message = {
      role: "bot",
      text: getBotReply(input.toLowerCase()),
    };
    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput("");
    setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100);
  };

  const getBotReply = (msg: string): string => {
    if (msg.includes("weather")) return "Current conditions are calm. Temperature 28°C, wind 15km/h. Safe to proceed! ✅";
    if (msg.includes("safe") || msg.includes("danger")) return "Sea conditions are safe right now. Stay alert and keep your radio on. 🟢";
    if (msg.includes("fish")) return "High fish activity detected near coordinates 12.97°N, 74.78°E. Best time: next 2 hours. 🐟";
    return "I can help with weather, safety, and navigation. Try asking about today's weather!";
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <div className="px-5 pt-6 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("chatbot")}</h1>
        </div>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary text-secondary-foreground rounded-bl-md"
            }`}>
              {msg.text}
              {msg.role === "bot" && (
                <button onClick={() => speak(msg.text)} className="ml-2 inline-block opacity-60 hover:opacity-100">
                  <Volume2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-20 pt-2 border-t border-border bg-background">
        <div className="flex gap-2">
          <button onClick={startVoice} className="p-3 rounded-full bg-secondary text-secondary-foreground">
            <Mic size={20} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 h-12 px-4 rounded-full border border-input bg-card text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <button onClick={sendMessage} className="p-3 rounded-full bg-primary text-primary-foreground">
            <Send size={20} />
          </button>
        </div>
      </div>

      <BottomNav />
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
    </div>
  );
};

export default Chatbot;
