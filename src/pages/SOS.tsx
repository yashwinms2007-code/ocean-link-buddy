import { useState, useEffect, useRef } from "react";
import { ArrowLeft, AlertTriangle, Navigation, Volume2, ShieldAlert, Radio, Activity, Globe, Anchor, MessageSquare, Wifi, WifiOff, PhoneCall, Timer, ChevronUp, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import MarineMap from "@/components/MarineMap";
import {
  calculateDeadReckoning,
  broadcastSOS,
  setupMeshListener,
  getDistance,
  SOSSignal,
  getSenderId,
  sendSOSviaSMS,
  setupAutoEscalation,
  startContinuousTracking,
  stopContinuousTracking,
  generateRadioSOSSignal,
  startRadioListener,
} from "@/services/sosService";
import { saveNotification } from "@/services/notificationStorage";
import { triggerAlert } from "@/utils/alertEngine";

type Priority = "idle" | "medium" | "high" | "critical";

const SOS = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"idle" | "sent">(() =>
    (localStorage.getItem("mitra-sos-active") as any) || "idle"
  );
  const [coords, setCoords] = useState({ lat: 12.9141, lng: 74.856 });
  const [isDeadReckoning, setIsDeadReckoning] = useState(false);
  const [nearbySOS, setNearbySOS] = useState<SOSSignal[]>([]);
  const [flash, setFlash] = useState(false);
  const [channels, setChannels] = useState({ mesh: false, sms: false, server: false });
  const [escalationCountdown, setEscalationCountdown] = useState(60);
  const [priority, setPriority] = useState<Priority>("idle");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [trackUpdates, setTrackUpdates] = useState(0);
  const [isRadioBroadcasting, setIsRadioBroadcasting] = useState(false);
  const [maydayStep, setMaydayStep] = useState(0);
  const [isRadioListening, setIsRadioListening] = useState(false);
  const stopRadioListenerRef = useRef<(() => void) | null>(null);

  const audioIntervalRef = useRef<any>(null);
  const flashIntervalRef = useRef<any>(null);
  const cancelEscalation = useRef<(() => void) | null>(null);
  const countdownRef = useRef<any>(null);

  // Online status
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  // Mesh listener — receives nearby SOS
  useEffect(() => {
    setupMeshListener((signal) => {
      setNearbySOS((prev) => {
        if (prev.find((s) => s.id === signal.id)) return prev;
        const dist = getDistance(coords.lat, coords.lng, signal.lat, signal.lon);
        toast.error(`🚨 NEARBY SOS: Vessel in distress ${dist.toFixed(1)}km away!`, { duration: 10000 });
        return [...prev, signal];
      });
    });
  }, [coords]);

  // GPS watch
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsDeadReckoning(false);
      },
      () => {
        if (status === "sent") {
          setIsDeadReckoning(true);
          const est = calculateDeadReckoning(coords.lat, coords.lng, 50, 15);
          setCoords({ lat: est.lat, lng: est.lon });
          toast.warning("GPS Lost: Switching to Dead Reckoning.");
        }
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [status]);

  // SOS Active — start all systems
  useEffect(() => {
    if (status === "sent") {
      localStorage.setItem("mitra-sos-active", "sent");

      // Flash screen
      flashIntervalRef.current = setInterval(() => setFlash((f) => !f), 200);

      // Voice alert loop
      const speakSOS = () => {
        if (!("speechSynthesis" in window)) return;
        const langMap: Record<Language, string> = { en: "en-IN", hi: "hi-IN", kn: "kn-IN" };
        const texts: Record<Language, string> = {
          en: "S.O.S. Emergency! Fisherman in distress. Please respond!",
          hi: "एसओएस आपातकाल! मछुआरा खतरे में है।",
          kn: "ತುರ್ತು ಸಹಾಯ! ಮೀನುಗಾರ ಅಪಾಯದಲ್ಲಿದ್ದಾರೆ!",
        };
        const msg = new SpeechSynthesisUtterance(texts[language]);
        msg.lang = langMap[language];
        msg.rate = 1.4;
        window.speechSynthesis.speak(msg);
      };
      speakSOS();
      audioIntervalRef.current = setInterval(speakSOS, 8000);

      // Vibrate SOS pattern (... --- ...)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200, 300, 500, 200, 500, 200, 500, 300, 200, 100, 200, 100, 200]);
      }

      // Multi-channel broadcast
      const sosData: SOSSignal = {
        id: `SOS-${Date.now()}`,
        lat: coords.lat,
        lon: coords.lng,
        timestamp: Date.now(),
        danger: "HIGH",
        type: "DISTRESS",
        senderId: getSenderId(),
      };

      broadcastSOS(sosData).then(() => {
        setChannels((prev) => ({ ...prev, mesh: true, server: isOnline }));
        setPriority("high");
      });

      // Auto-escalation countdown
      countdownRef.current = setInterval(() => {
        setEscalationCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownRef.current);
            setPriority("critical");
            return 0;
          }
          return c - 1;
        });
      }, 1000);

      // Set up auto-escalation (SMS + voice at 60s)
      cancelEscalation.current = setupAutoEscalation(coords.lat, coords.lng, language);

      // Continuous 30s GPS tracking
      startContinuousTracking((lat, lon) => {
        setCoords({ lat, lng: lon });
        setTrackUpdates((n) => n + 1);
      });

      return () => {
        clearInterval(flashIntervalRef.current);
        clearInterval(audioIntervalRef.current);
        clearInterval(countdownRef.current);
        window.speechSynthesis.cancel();
        stopContinuousTracking();
        if (cancelEscalation.current) cancelEscalation.current();
      };
    } else {
      localStorage.removeItem("mitra-sos-active");
      setFlash(false);
      setEscalationCountdown(60);
      setPriority("idle");
      setChannels({ mesh: false, sms: false, server: false });
    }
  }, [status]);

  const handleSOS = () => {
    setStatus("sent");
    saveNotification({
      title: "🚨 SOS EMERGENCY DEPLOYED",
      body: `Distress signal active at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}. Multi-channel rescue initiated.`,
      type: "danger",
      data: { lat: coords.lat, lng: coords.lng, isSOS: true }
    });
    triggerAlert(
      "🚨 SOS EMERGENCY DEPLOYED",
      "Broadcasting to nearby vessels + queuing for authorities.",
      "SOS",
      language
    );
  };

  const handleCancel = () => {
    setStatus("idle");
    window.speechSynthesis.cancel();
    clearInterval(audioIntervalRef.current);
    clearInterval(flashIntervalRef.current);
    clearInterval(countdownRef.current);
    stopContinuousTracking();
    if (cancelEscalation.current) cancelEscalation.current();
  };

  const handleSMS = () => {
    sendSOSviaSMS(coords.lat, coords.lng);
    setChannels((prev) => ({ ...prev, sms: true }));
  };

  const handleRadioSignal = async () => {
    setIsRadioBroadcasting(true);
    await generateRadioSOSSignal(coords.lat, coords.lng);
    setIsRadioBroadcasting(false);
  };

  const handleVoiceMayday = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    const scripts: Record<Language, string[]> = {
      en: [
        `Mayday! Mayday! Mayday!`,
        `This is Vessel Mitra ${getSenderId().slice(-4)}.`,
        `Position is ${coords.lat.toFixed(4)} North, ${coords.lng.toFixed(4)} East.`,
        `I require immediate assistance. Over.`
      ],
      hi: [
        `मेडे! मेडे! मेडे!`,
        `यह जहाज मित्रा ${getSenderId().slice(-4)} है।`,
        `स्थान ${coords.lat.toFixed(4)} उत्तर, ${coords.lng.toFixed(4)} पूर्व है।`,
        `हमें तुरंत सहायता की आवश्यकता है। ओवर।`
      ],
      kn: [
        `ಮೇಡೇ! ಮೇಡೇ! ಮೇಡೇ!`,
        `ಇದು ಮಿತ್ರ ಹಡಗು ${getSenderId().slice(-4)}.`,
        `ಸ್ಥಳ ${coords.lat.toFixed(4)} ಉತ್ತರ, ${coords.lng.toFixed(4)} ಪೂರ್ವ.`,
        `ನಮಗೆ ತಕ್ಷಣ ಸಹಾಯ ಬೇಕು. ಓವರ್.`
      ]
    };

    const currentScript = scripts[language] || scripts.en;
    let step = 0;
    const playNext = () => {
      if (step >= currentScript.length) {
        setMaydayStep(0);
        return;
      }
      setMaydayStep(step + 1);
      const msg = new SpeechSynthesisUtterance(currentScript[step]);
      msg.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      msg.rate = 0.85;
      msg.onend = () => setTimeout(playNext, 1200);
      window.speechSynthesis.speak(msg);
      step++;
    };
    playNext();
  };

  const toggleRadioListener = () => {
    if (isRadioListening) {
      if (stopRadioListenerRef.current) stopRadioListenerRef.current();
      setIsRadioListening(false);
      toast.info("Radio Listener Deactivated.");
    } else {
      const stop = startRadioListener((lat, lon) => {
        toast.error(`📡 RADIO SOS DETECTED! Vessel in distress at ${lat.toFixed(4)}, ${lon.toFixed(4)}`, { duration: 8000 });
        setNearbySOS(prev => [...prev, { id: `RADIO-${Date.now()}`, lat, lon, timestamp: Date.now(), danger: "HIGH", type: "DISTRESS", senderId: "RADIO_BRIDGE" }]);
      });
      if (stop) {
        stopRadioListenerRef.current = stop;
        setIsRadioListening(true);
        toast.success("Radio Bridge Active: Listening for nearby SOS chirps...");
      }
    }
  };

  const priorityColor = priority === "critical" ? "bg-red-700" : priority === "high" ? "bg-red-600" : priority === "medium" ? "bg-orange-600" : "bg-slate-900/50 backdrop-blur-xl border-b border-white/10";
  const priorityLabel = priority === "critical" ? "🔴 CRITICAL — ESCALATING ALL CHANNELS" : priority === "high" ? "🚨 HIGH — MULTI-CHANNEL SOS ACTIVE" : priority === "medium" ? "⚠️ MEDIUM — ALERTING NEARBY VESSELS" : "STANDBY";

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-200 ${flash && status === "sent" ? "bg-red-950/60" : "bg-transparent"}`}>
      {/* Header */}
      <div className={`p-6 rounded-b-[2.5rem] shadow-xl flex items-center gap-4 transition-all ${status === "sent" ? priorityColor : "bg-slate-900/50 backdrop-blur-xl border-b border-white/10"}`}>
        <button onClick={() => navigate(-1)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-white">{t("sosEmergency")}</h1>
            {!isOnline && (
              <div className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-md">
                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">OFFLINE</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-400" : "bg-yellow-400"} animate-pulse`} />
            <span className="text-white/70 text-[9px] font-black uppercase tracking-widest">{priorityLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi size={18} className="text-green-400" /> : <WifiOff size={18} className="text-yellow-400" />}
          <Radio size={22} className={status === "sent" ? "animate-ping text-white" : "text-primary animate-pulse"} />
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 flex flex-col items-center flex-1">
        {status === "idle" ? (
          /* ─── IDLE STATE ─── */
          <div className="flex flex-col items-center w-full gap-6 animate-in fade-in zoom-in duration-500">
            {/* SOS Button */}
            <div className="relative group mt-4">
              <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-20 group-hover:opacity-50 transition-opacity" />
              <button
                onClick={handleSOS}
                className="relative w-64 h-64 bg-red-600 rounded-full text-white flex flex-col items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.5)] hover:bg-red-700 active:scale-95 transition-all border-[12px] border-white/10"
              >
                <div className="absolute inset-0 rounded-full border-4 border-red-400/40 animate-ping opacity-40" />
                <ShieldAlert size={72} className="mb-2" />
                <span className="text-5xl font-black uppercase tracking-tighter">SOS</span>
                <span className="text-[9px] font-black uppercase mt-1 opacity-80 tracking-[0.3em]">Deploy Emergency Signal</span>
              </button>
            </div>

            {/* Channel Description */}
            <div className="glass-dark p-5 rounded-[2rem] border border-white/10 w-full">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Multi-Channel Delivery System</h3>
              <div className="space-y-3">
                {[
                  { icon: Radio, label: "Channel 1: Mesh Network", desc: "Nearby fishermen alerted instantly (offline)", color: "text-primary" },
                  { icon: MessageSquare, label: "Channel 2: SMS to 112", desc: "National emergency — works without internet", color: "text-green-400" },
                  { icon: Globe, label: "Channel 3: Web Server", desc: "Authorities + coast guard (when online)", color: "text-blue-400" },
                  { icon: Timer, label: "Auto-Escalation at 60s", desc: "Automatic SMS if no response detected", color: "text-orange-400" },
                ].map(({ icon: Icon, label, desc, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`p-2 bg-white/5 rounded-xl ${color}`}><Icon size={14} /></div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">{label}</p>
                      <p className="text-[9px] text-slate-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby SOS alerts */}
            {nearbySOS.length > 0 && (
              <div className="w-full glass-dark p-5 rounded-[2rem] border-2 border-red-500/30 animate-pulse">
                <h4 className="text-red-400 font-black text-[9px] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} /> Nearby Distress Signals
                </h4>
                {nearbySOS.map((sos) => (
                  <div key={sos.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-white font-bold text-sm">Vessel #{sos.id.slice(-4)}</span>
                    <span className="text-red-400 font-black text-xs">
                      {getDistance(coords.lat, coords.lng, sos.lat, sos.lon).toFixed(2)} KM Away
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ─── ACTIVE SOS STATE ─── */
          <div className="flex flex-col items-center w-full gap-5 animate-in fade-in slide-in-from-bottom-10 duration-500">

            {/* Channel Status Matrix */}
            <div className="w-full grid grid-cols-3 gap-3">
              {[
                { label: "Mesh", icon: Radio, active: channels.mesh, color: "text-primary", desc: "Nearby vessels" },
                { label: "SMS 112", icon: PhoneCall, active: channels.sms, color: "text-green-400", desc: "Emergency line" },
                { label: "Server", icon: Globe, active: channels.server, color: "text-blue-400", desc: "Authorities" },
              ].map(({ label, icon: Icon, active, color, desc }) => (
                <div key={label} className={`glass-dark p-4 rounded-[1.5rem] border flex flex-col items-center text-center transition-all ${active ? "border-green-500/30" : "border-white/10"}`}>
                  <Icon size={20} className={active ? "text-green-400" : color} />
                  <span className="text-[8px] font-black uppercase mt-1 text-slate-400">{label}</span>
                  <span className={`text-[9px] font-black mt-1 ${active ? "text-green-400" : "text-slate-600"}`}>
                    {active ? "✓ SENT" : "PENDING"}
                  </span>
                </div>
              ))}
            </div>

            {/* Escalation Countdown */}
            <div className={`w-full glass-dark p-5 rounded-[2rem] border flex items-center gap-4 ${priority === "critical" ? "border-red-500/50" : "border-yellow-500/30"}`}>
              <div className={`p-3 rounded-2xl ${priority === "critical" ? "bg-red-500/20" : "bg-yellow-500/20"}`}>
                <Timer size={24} className={priority === "critical" ? "text-red-400" : "text-yellow-400"} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  {priority === "critical" ? "AUTO-ESCALATION TRIGGERED" : "Auto-escalating in"}
                </p>
                <p className={`text-2xl font-black ${priority === "critical" ? "text-red-400" : "text-yellow-400"}`}>
                  {priority === "critical" ? "SMS SENT" : `${escalationCountdown}s`}
                </p>
                {priority !== "critical" && (
                  <p className="text-[8px] text-slate-600 uppercase tracking-widest">SMS to 112 auto-sends if no response</p>
                )}
              </div>
              {priority !== "critical" && (
                <button
                  onClick={handleSMS}
                  className="flex flex-col items-center gap-1 px-4 py-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/30 transition-all border border-green-500/20"
                >
                  <MessageSquare size={18} />
                  <span className="text-[8px] font-black uppercase">SMS Now</span>
                </button>
              )}
            </div>

            {/* ─── NEW: RADIO WAVE BRIDGE ─── */}
            <div className="w-full glass-dark p-6 rounded-[2.5rem] border-2 border-primary/20 relative overflow-hidden group">
              {isRadioBroadcasting && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
              )}
              
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${isRadioBroadcasting ? 'bg-primary animate-pulse' : 'bg-primary/20'}`}>
                    <Radio size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-tight">Ship Radio Bridge</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital-over-Radio waves</p>
                  </div>
                </div>
                {isRadioBroadcasting && (
                  <div className="flex gap-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-1 h-4 bg-primary rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: `${i*0.2}s` }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 relative z-10 text-center">
                <div className="flex gap-3 px-2 py-4 bg-black/40 rounded-2xl border border-white/5 items-center justify-center">
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Hold Phone near VHF Radio Mic & Press PTT</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleRadioSignal}
                    disabled={isRadioBroadcasting}
                    className={`flex flex-col items-center gap-2 py-4 rounded-[1.5rem] border-2 transition-all ${isRadioBroadcasting ? 'bg-primary border-primary' : 'bg-primary/10 border-primary/20 hover:bg-primary/20'}`}
                  >
                    <Activity size={24} className="text-white" />
                    <span className="text-[9px] font-black uppercase text-white tracking-widest">
                      {isRadioBroadcasting ? 'Broadcasting...' : 'Digital Burst'}
                    </span>
                  </button>

                  <button
                    onClick={handleVoiceMayday}
                    className={`flex flex-col items-center gap-2 py-4 rounded-[1.5rem] border-2 transition-all ${maydayStep > 0 ? 'bg-orange-600 border-orange-500' : 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20'}`}
                  >
                    <Volume2 size={24} className="text-orange-400" />
                    <span className="text-[9px] font-black uppercase text-white tracking-widest">
                      {maydayStep > 0 ? `Step ${maydayStep}/4` : 'Voice Mayday'}
                    </span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={toggleRadioListener}
                    className={`w-full py-3 rounded-xl border flex items-center justify-center gap-3 transition-all ${isRadioListening ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-slate-400 font-bold'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isRadioListening ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="text-[10px] uppercase tracking-widest font-black">
                      {isRadioListening ? 'Receiver Active: Monitoring Radio' : 'Activate Radio Receiver'}
                    </span>
                  </button>
                </div>

                <p className="text-[8px] text-slate-600 font-medium uppercase tracking-[0.1em]">Sends/Receives GPS data via ship VHF Radio waves</p>
              </div>
            </div>

            {/* GPS + Tracking Status */}
            <div className="w-full glass-dark p-5 rounded-[2rem] border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Navigation size={18} className="text-red-400 animate-bounce" />
                  <span className="text-white font-black text-sm">Rescue Coordinates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                    {isDeadReckoning ? "⚠️ DEAD RECKONING" : "🛰️ GPS LIVE"}
                  </span>
                  {trackUpdates > 0 && (
                    <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {trackUpdates} updates
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/5">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] block mb-1">{t("latitude")}</span>
                  <span className="font-mono text-white text-lg font-black">{coords.lat.toFixed(6)}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/5">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] block mb-1">{t("longitude")}</span>
                  <span className="font-mono text-white text-lg font-black">{coords.lng.toFixed(6)}</span>
                </div>
              </div>

              <a
                href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary/10 text-primary rounded-2xl border border-primary/20 text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
              >
                <Globe size={14} /> Open in Google Maps
              </a>
            </div>

            {/* Live Map */}
            <div className="glass-dark p-4 rounded-[2.5rem] border border-white/10 shadow-2xl relative w-full">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Telemetry Stream</span>
              </div>
              <div className="rounded-[2rem] overflow-hidden h-[280px]">
                <MarineMap
                  center={[coords.lat, coords.lng]}
                  zoom={15}
                  height="100%"
                  markers={[{ position: [coords.lat, coords.lng], label: "YOUR VESSEL (DISTRESS)", isSOS: true }]}
                  nearbySOS={nearbySOS}
                />
              </div>
            </div>

            {/* Deactivate */}
            <button
              onClick={handleCancel}
              className="w-full py-6 glass-dark text-slate-400 font-black rounded-[3rem] border border-white/10 hover:bg-red-600/10 hover:text-red-400 hover:border-red-500/30 transition-all uppercase tracking-[0.3em] text-xs"
            >
              Deactivate Emergency Alert
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOS;
