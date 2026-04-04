import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Mic, MicOff, VolumeX, Globe, Fish, Waves, Compass, Wind, AlertTriangle, Anchor, Map, BookOpen, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { fetchSatelliteData, getOceanStats } from "@/services/oceanDataService";
import { fetchMarineWeather } from "@/services/marineWeatherService";

// ── AI Knowledge Engine ──────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: Fish, label: "Best Fishing Zones", query: "Where are the best fishing zones near me?" },
  { icon: Waves, label: "Sea Conditions", query: "What are the current sea conditions?" },
  { icon: AlertTriangle, label: "Safety Tips", query: "Give me safety tips for fishing at sea" },
  { icon: Wind, label: "Weather Update", query: "What is the current weather and wind speed?" },
  { icon: Compass, label: "Navigation Help", query: "How do I navigate safely in rough seas?" },
  { icon: Phone, label: "Emergency Steps", query: "What should I do in a maritime emergency?" },
];

const getStaticResponse = (msg: string, lang: string): string | null => {
  const m = msg.toLowerCase();

  if (m.includes("emergency") || m.includes("sos") || m.includes("danger") || m.includes("help")) {
    return lang === 'kn'
      ? "🚨 ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ: ತಕ್ಷಣ SOS ಸಿಗ್ನಲ್ ಕಳುಹಿಸಿ. ಭಾರತೀಯ ಕೋಸ್ಟ್ ಗಾರ್ಡ್ ಅನ್ನು 1554 ಗೆ ಕರೆಯಿರಿ. ನಿಮ್ಮ ಲಾಲ್ ಬಣ್ಣದ ಫ್ಲೇರ್ ಉಪಯೋಗಿಸಿ."
      : "🚨 EMERGENCY PROTOCOL: 1. Press SOS button immediately. 2. Call India Coast Guard: 1554. 3. Fire red distress flare. 4. Activate life jackets. 5. Stay with vessel if possible. Help is on its way!";
  }

  if (m.includes("safety") || m.includes("safe") || m.includes("tips") || m.includes("precaution")) {
    return lang === 'kn'
      ? "⛑️ ಮೀನುಗಾರಿಕೆ ಸಮಯದ ಸುರಕ್ಷತೆ: 1) ಯಾವಾಗಲೂ ಜೀವನರಕ್ಷಕ ಜಾಕೆಟ್ ಧರಿಸಿ. 2) VHF ರೇಡಿಯೋ ಇಟ್ಟುಕೊಳ್ಳಿ. 3) ಅನ್ಯರಿಗೆ ನಿಮ್ಮ ಪ್ರಯಾಣದ ಮಾಹಿತಿ ತಿಳಿಸಿ. 4) ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಪರಿಶೀಲಿಸಿ. 5) ತುರ್ತು ಆಹಾರ ಮತ್ತು ನೀರು ತನ್ನಿ."
      : "⛑️ SAFETY ESSENTIALS: 1) Always wear life jackets. 2) Carry VHF radio (Channel 16 for distress). 3) File a Float Plan with someone onshore. 4) Check weather before departing. 5) Carry emergency food, water & first-aid kit. 6) Never sail alone. 7) Know your vessel's capacity.";
  }

  if (m.includes("navigate") || m.includes("navigation") || m.includes("route") || m.includes("direction")) {
    return "🧭 NAVIGATION GUIDANCE: Use GPS and cross-reference with charts. Follow coastal landmarks. Avoid shipping lanes without AIS transponder. In poor visibility: reduce speed, sound fog signals, and use radar. Keep VHF Channel 16 open at all times for Coast Guard communication.";
  }

  if (m.includes("life raft") || m.includes("liferaft") || m.includes("abandon ship")) {
    return "🛟 ABANDON SHIP PROTOCOL: 1) Issue MAYDAY on VHF Ch16. 2) Activate EPIRB beacon. 3) Wear life jackets & immersion suits. 4) Take emergency bag (water, food, flares). 5) Deploy life raft downwind. 6) Board from the vessel if possible — avoid jumping. Stay together for rescue visibility.";
  }

  if (m.includes("coast guard") || m.includes("rescue") || m.includes("contact")) {
    return "📡 COAST GUARD CHANNELS: India Coast Guard: 1554 (toll-free) | VHF Channel 16 (international distress) | MRCC Mumbai: +91 22 2266 5300 | MRCC Chennai: +91 44 2345 0505. The Mitra SOS button broadcasts your GPS coordinates automatically to all channels.";
  }

  if (m.includes("wave") || m.includes("current") || m.includes("tide")) {
    return null; // Let the live API handle it
  }

  if (m.includes("hello") || m.includes("hi") || m.includes("namaste") || m.includes("ನಮಸ್ಕಾರ")) {
    return lang === 'kn'
      ? "ನಮಸ್ಕಾರ! ನಾನು ಮಿತ್ರ, ನಿಮ್ಮ ಸಮುದ್ರ ಸುರಕ್ಷಾ ಸಹಾಯಕ. ನಿಮಗೆ ಏನು ಸಹಾಯ ಬೇಕು?"
      : "👋 Greetings! I am MITRA, your Maritime Intelligence & Safety Assistant. I can help you with:\n• 🐟 Fishing zone predictions\n• 🌊 Live sea conditions & weather\n• ⛑️ Safety protocols\n• 🧭 Navigation guidance\n• 🚨 Emergency procedures\n\nHow can I assist your voyage today?";
  }

  return null; // Signal to use live API response
};

// ──────────────────────────────────────────────────────────────────────────────

const Chatbot = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [history, setHistory] = useState([
    { 
      role: 'ai', 
      text: "👋 I am **MITRA AI**, your Maritime Intelligence Assistant.\n\nAsk me about fishing zones, sea conditions, safety tips, or emergency procedures. Choose a quick action below or type your question.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (window.speechSynthesis) {
      // Pre-load voices to ensure they are available when speak() is called
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.getVoices();
    }
    
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
      recognitionRef.current.onerror = (e: any) => {
        setIsListening(false);
        if (e.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow in browser settings.");
        } else if (e.error === 'network') {
          toast.error("Network required for voice recognition.");
        } else {
          toast.error("Voice link intermittent. Please try typing your query.");
        }
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
        toast.error("Speech recognition is not fully supported in this browser. Please use the text input."); 
        return; 
      }
      stopSpeaking();
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("🎙️ Listening...");
      } catch (err) {
        toast.error("Please allow microphone permissions to use voice search.");
      }
    }
  };

  const speak = (text: string) => {
    const voiceEnabled = localStorage.getItem("mitra_voiceGuide") !== "false";
    if (!voiceEnabled || !window.speechSynthesis) return;
    const cleaned = text.replace(/[*#🚨⛑️🧭🛟📡👋🐟🌊]/gu, '');
    const utterance = new SpeechSynthesisUtterance(cleaned);
    const langMap: Record<Language, string> = { en: "en-US", hi: "hi-IN", kn: "kn-IN" };
    utterance.lang = langMap[language];
    utterance.rate = 0.95;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Fallback to English if native regional voice isn't installed locally
      const bestVoice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0])) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (bestVoice) utterance.voice = bestVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    // Slight delay fixes Chrome text-to-speech bug on direct load
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const handleSend = async (textToSend?: string) => {
    const finalMsg = (textToSend || msg).trim();
    if (!finalMsg) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory(prev => [...prev, { role: 'user', text: finalMsg, timestamp: userTimestamp }]);
    setMsg("");
    setIsThinking(true);

    // 1. Try static knowledge base first
    const staticReply = getStaticResponse(finalMsg, language);
    if (staticReply) {
      setTimeout(() => {
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setHistory(prev => [...prev, { role: 'ai', text: staticReply, timestamp: ts }]);
        setIsThinking(false);
        speak(staticReply);
      }, 700);
      return;
    }

    // 2. Live API response for weather/fish queries
    const tryGPS = () => new Promise<GeolocationCoordinates | null>((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (p) => resolve(p.coords),
        () => resolve(null),
        { timeout: 5000 }
      );
    });

    const coords = await tryGPS();
    const lat = coords?.latitude ?? 12.91;
    const lon = coords?.longitude ?? 74.85;

    try {
      const [{ current: marine, safety }, satResponse] = await Promise.all([
        fetchMarineWeather(lat, lon),
        fetchSatelliteData(lat, lon)
      ]);
      const satStats = getOceanStats(satResponse.points);
      const lowerMsg = finalMsg.toLowerCase();

      let responseText = "";

      if (lowerMsg.includes("fish") || lowerMsg.includes("catch") || lowerMsg.includes("ಮೀನು") || lowerMsg.includes("zone")) {
        responseText = language === 'kn'
          ? `🐟 ಮೀನುಗಾರಿಕೆ ಮಾಹಿತಿ:\n• ಉತ್ತಮ ಪ್ರದೇಶ: ${satStats.bestFishingZone}\n• ಸಮುದ್ರ ತಾಪಮಾನ: ${satStats.averageSST}°C\n• ಸ್ಥಿತಿ: ${safety.status === 'SAFE' ? 'ಸುರಕ್ಷಿತ' : 'ಎಚ್ಚರಿಕೆ ಬೇಕು'}`
          : `🐟 FISHING INTELLIGENCE:\n• Best Zone: ${satStats.bestFishingZone}\n• Sea Surface Temp: ${satStats.averageSST}°C\n• High-Confidence Zones: ${satStats.highConfidenceZones}\n• Active Ocean Fronts: ${satStats.activeFronts}\n• Best Time: ${satStats.bestTimeToFish}\n\n${safety.status === 'SAFE' ? '✅ Sea conditions are favorable for fishing today.' : `⚠️ ${safety.advice}`}`;
      } else if (lowerMsg.includes("weather") || lowerMsg.includes("wind") || lowerMsg.includes("wave") || lowerMsg.includes("sea") || lowerMsg.includes("ಹವಾಮಾನ")) {
        responseText = language === 'kn'
          ? `🌊 ಹವಾಮಾನ ಮಾಹಿತಿ:\n• ಅಲೆಯ ಎತ್ತರ: ${marine.waveHeight}m\n• ಗಾಳಿ ವೇಗ: ${marine.windSpeed}km/h\n• ಸ್ಥಿತಿ: ${safety.status === 'SAFE' ? 'ಸುರಕ್ಷಿತ' : 'ಎಚ್ಚರ!'}`
          : `🌊 LIVE MARITIME CONDITIONS:\n• Wave Height: ${marine.waveHeight}m\n• Wind Speed: ${marine.windSpeed} km/h\n• Wind Direction: ${marine.windDirection}°\n• Sea Temp: ${marine.sst}°C\n• Humidity: ${marine.humidity}%\n• Current: ${marine.currentVelocity}m/s\n\nStatus: **${safety.status}** — ${safety.advice}`;
      } else {
        responseText = language === 'kn'
          ? `ನಾನು ಸಮುದ್ರ ಸುರಕ್ಷೆ, ಹವಾಮಾನ ಮತ್ತು ಮೀನುಗಾರಿಕೆ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ. ದಯವಿಟ್ಟು ಅದರ ಬಗ್ಗೆ ಕೇಳಿ.`
          : `I'm specialized in maritime topics. Here's what I can help with:\n\n• 🐟 **Fishing zones** — "Where are fish today?"\n• 🌊 **Sea conditions** — "How are the waves?"\n• ⛑️ **Safety** — "Safety tips for rough sea"\n• 🚨 **Emergencies** — "What to do in an emergency"\n• 🧭 **Navigation** — "How to navigate at night"\n\nTry asking one of those!`;
      }

      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistory(prev => [...prev, { role: 'ai', text: responseText, timestamp: ts }]);
      speak(responseText);
    } catch (e) {
      const fallback = "Satellite data link interrupted. Please check your connection and try again.";
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistory(prev => [...prev, { role: 'ai', text: fallback, timestamp: ts }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-950">
      {/* ── HEADER ── */}
      <div className="bg-slate-900 border-b border-white/10 px-6 py-5 flex items-center gap-4 relative z-20 flex-shrink-0">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[60px] rounded-full pointer-events-none" />
        <button onClick={() => navigate(-1)} className="p-3 glass-dark rounded-2xl hover:bg-white/10 transition-all border border-white/10 text-white relative z-10">
          <ArrowLeft size={20} />
        </button>
        <div className="relative z-10">
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            MITRA <span className="text-primary font-black px-2 py-0.5 bg-primary/10 rounded-lg text-[10px] leading-none border border-primary/20">AI CORE</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">Advanced Marine Intelligence • Online</p>
          </div>
        </div>
        {isSpeaking && (
          <button onClick={stopSpeaking} className="ml-auto p-3 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 animate-pulse relative z-10">
            <VolumeX size={16} />
          </button>
        )}
      </div>

      {/* ── MESSAGE STREAM ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-6 pb-4 space-y-6 scroll-smooth scrollbar-hide">
        {history.map((h, i) => (
          <div key={i} className={`flex flex-col ${h.role === 'ai' ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className="flex items-center gap-2 mb-1.5 px-2">
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-600">{h.role === 'ai' ? 'Mitra AI' : 'You'}</span>
              <span className="text-[7px] font-bold text-slate-700">{h.timestamp}</span>
            </div>
            <div className={`max-w-[90%] px-5 py-4 rounded-[2rem] shadow-xl relative overflow-hidden ${
              h.role === 'ai'
              ? 'bg-slate-800 border border-white/10 text-slate-100 rounded-tl-none'
              : 'bg-primary text-slate-900 rounded-tr-none font-black'
            }`}>
              {h.role === 'ai' && <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />}
              <p className="text-sm leading-relaxed relative z-10 whitespace-pre-wrap">{h.text}</p>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 px-5 py-3.5 bg-white/5 rounded-full border border-white/5 w-fit animate-pulse">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Syncing data...</span>
          </div>
        )}

        {/* Quick Actions — shown only at start */}
        {history.length <= 1 && (
          <div className="grid grid-cols-2 gap-3 pt-4">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.query}
                onClick={() => handleSend(action.query)}
                className="flex items-center gap-3 p-4 glass-dark rounded-2xl border border-white/10 hover:border-primary/40 hover:bg-white/5 transition-all text-left group active:scale-95"
              >
                <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
                  <action.icon size={14} className="text-primary" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── COMMAND INPUT — RIGHT-BIASED BOTTOM ── */}
      <div className="flex-shrink-0 px-4 py-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
        <div className="flex items-center gap-3 bg-slate-800 rounded-[3rem] border border-white/10 px-4 py-2 shadow-2xl max-w-2xl ml-auto">
          <input
            ref={inputRef}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : "Ask Mitra AI..."}
            className="flex-1 bg-transparent text-white placeholder:text-slate-600 font-medium text-sm outline-none min-w-0 px-2"
          />
          <button
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all flex-shrink-0 ${
              isListening
              ? 'bg-red-500 text-white scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
              : 'bg-white/5 text-slate-400 hover:text-primary hover:bg-white/10'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!msg.trim()}
            className={`p-3 rounded-full transition-all flex-shrink-0 ${
              msg.trim()
              ? 'bg-primary text-slate-950 shadow-lg shadow-primary/30 hover:scale-105 active:scale-95'
              : 'bg-white/5 text-slate-700 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
