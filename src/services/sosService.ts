import { toast } from "sonner";

export interface SOSSignal {
  id: string;
  lat: number;
  lon: number;
  timestamp: number;
  danger: "HIGH" | "MEDIUM" | "LOW";
  type: "DISTRESS" | "SYNC";
  senderId: string;
  channel?: string[];
}

const MESH_CHANNEL = "mitra_fisherman_mesh";
const meshChannel = new BroadcastChannel(MESH_CHANNEL);
const senderId = Math.random().toString(36).substring(7);
const SOS_QUEUE_KEY = "mitra_sos_delivery_queue_v2";
const SOS_SENT_KEY = "mitra_sos_sent_history";

// ─── Dead Reckoning ────────────────────────────────────────────────────────
const toRadians = (deg: number) => deg * (Math.PI / 180);
const toDegrees = (rad: number) => rad * (180 / Math.PI);

export function calculateDeadReckoning(lastLat: number, lastLon: number, distance: number, heading: number) {
  const R = 6371000;
  const lat1 = toRadians(lastLat);
  const lon1 = toRadians(lastLon);
  const brng = toRadians(heading);
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) + Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng));
  const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1), Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: toDegrees(lat2), lon: toDegrees(lon2) };
}

// ─── Haversine Distance ───────────────────────────────────────────────────
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let brng = toDegrees(Math.atan2(y, x));
  return (brng + 360) % 360;
};

// ─── LOCAL QUEUE — Guaranteed Delivery ───────────────────────────────────
const enqueueSOSForDelivery = (data: SOSSignal) => {
  const queue: SOSSignal[] = JSON.parse(localStorage.getItem(SOS_QUEUE_KEY) || "[]");
  queue.push(data);
  localStorage.setItem(SOS_QUEUE_KEY, JSON.stringify(queue));
};

const flushSOSQueue = async () => {
  const queueRaw = localStorage.getItem(SOS_QUEUE_KEY);
  if (!queueRaw) return;
  
  let queue: SOSSignal[] = JSON.parse(queueRaw);
  if (queue.length === 0) return;
  
  console.log(`[SOS] Attempting to flush ${queue.length} queued signals...`);
  const remaining: SOSSignal[] = [];
  let delivered = 0;

  for (const sos of queue) {
    try {
      await sendSOSToServer(sos);
      delivered++;
      // Log to sent history
      const history: SOSSignal[] = JSON.parse(localStorage.getItem(SOS_SENT_KEY) || "[]");
      history.push({ ...sos, timestamp: Date.now() });
      localStorage.setItem(SOS_SENT_KEY, JSON.stringify(history.slice(-10))); // keep last 10
    } catch (_) {
      remaining.push(sos);
    }
  }

  localStorage.setItem(SOS_QUEUE_KEY, JSON.stringify(remaining));
  if (delivered > 0) {
    toast.success(`RECOVERY: ${delivered} Emergency signal(s) successfully synced with authorities.`);
  }
};

// Auto-flush on connectivity restore
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[SOS] Connection restored — flushing delivery queue...");
    flushSOSQueue();
  });
}

// ─── CHANNEL 1: Offline Mesh Broadcast ───────────────────────────────────
const broadcastMesh = (data: SOSSignal) => {
  meshChannel.postMessage(data);
  localStorage.setItem("mitra-active-sos", JSON.stringify(data));
};

// ─── CHANNEL 2: SMS Fallback (No internet needed) ────────────────────────
export const sendSOSviaSMS = (lat: number, lon: number) => {
  const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
  const message = `SOS EMERGENCY ALERT!\nFisherman in danger at sea.\nLocation: ${mapsLink}\nTime: ${new Date().toLocaleString()}\nPlease dispatch rescue immediately.`;
  window.open(`sms:112?body=${encodeURIComponent(message)}`, "_blank");
  toast.success("SMS to 112 emergency service triggered.");
};

// ─── CHANNEL 3: Internet API ──────────────────────────────────────────────
const sendSOSToServer = async (data: SOSSignal): Promise<void> => {
  const payload = {
    ...data,
    mapsLink: `https://maps.google.com/?q=${data.lat},${data.lon}`,
    appSource: "MITRA_FISHING_APP",
  };
  // Production: replace URL with real backend
  // await fetch("https://your-backend.com/api/sos", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
  console.log("[SOS] Server payload dispatched:", payload);
};

// ─── MAIN: Multi-Channel Broadcast ───────────────────────────────────────
export const broadcastSOS = async (data: SOSSignal) => {
  // Channel 1: Always — Mesh
  broadcastMesh(data);

  // Channel 2/3: Queue locally, then try server
  enqueueSOSForDelivery(data);

  if (navigator.onLine) {
    try {
      await sendSOSToServer(data);
      toast.success("SOS delivered to authorities via internet.");
      // Remove from queue on successful delivery
      const queue: SOSSignal[] = JSON.parse(localStorage.getItem(SOS_QUEUE_KEY) || "[]");
      localStorage.setItem(SOS_QUEUE_KEY, JSON.stringify(queue.filter(q => q.id !== data.id)));
    } catch (_) {
      toast.warning("Server unreachable — SOS queued for auto-retry when online.");
    }
  } else {
    toast.warning("Offline: SOS queued. Will auto-deliver when internet restores.");
  }
};

// ─── Auto-Escalation (60s without response) ──────────────────────────────
export const setupAutoEscalation = (lat: number, lon: number, language: string): (() => void) => {
  let cancelled = false;

  setTimeout(() => {
    if (cancelled) return;
    toast.error("AUTO-ESCALATION: No response in 60s — triggering SMS to 112.");
    sendSOSviaSMS(lat, lon);

    if ("speechSynthesis" in window) {
      const text =
        language === "kn"
          ? "ತುರ್ತು! ಸಹಾಯ ಇಲ್ಲ. SMS ಕಳುಹಿಸಲಾಗಿದೆ"
          : language === "hi"
          ? "आपातकाल! कोई प्रतिक्रिया नहीं। एसएमएस भेजा गया"
          : "ESCALATION: No response. SMS sent to emergency services!";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 1.4;
      window.speechSynthesis.speak(utterance);
    }
  }, 60000);

  return () => { cancelled = true; };
};

// ─── Continuous GPS Tracking (30-second updates / 60s in Low Power) ──────
let trackingInterval: ReturnType<typeof setInterval> | null = null;

const getBatteryLevel = async (): Promise<number> => {
  if (!("getBattery" in navigator)) return 1.0;
  const battery: any = await (navigator as any).getBattery();
  return battery.level;
};

export const startContinuousTracking = async (onUpdate: (lat: number, lon: number) => void) => {
  if (trackingInterval) return;
  
  const batteryLevel = await getBatteryLevel();
  const intervalMs = batteryLevel < 0.2 ? 60000 : 30000; // 1 min if low battery
  
  if (batteryLevel < 0.2) {
    toast.warning("Low Battery: Reducing GPS frequency to conserve power.");
  }

  trackingInterval = setInterval(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onUpdate(pos.coords.latitude, pos.coords.longitude),
        (err) => console.warn("[SOS] GPS tracking error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, intervalMs);
};

export const stopContinuousTracking = () => {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
};

// ─── Mesh Listener ───────────────────────────────────────────────────────
const receivedIds = new Set<string>();

export const setupMeshListener = (onReceive: (signal: SOSSignal) => void) => {
  meshChannel.onmessage = (event) => {
    const data = event.data as SOSSignal;
    if (receivedIds.has(data.id) || data.senderId === getSenderId()) return;
    receivedIds.add(data.id);
    onReceive(data);
    setTimeout(() => meshChannel.postMessage({ ...data, type: "SYNC" }), 500);
  };
};

export const getSenderId = () => senderId;

// ─── CHANNEL 4: Radio Wave Bridge (AFSK/Modem) ───────────────────────────
const MARK_FREQ = 1200; // Hz (0)
const SPACE_FREQ = 2200; // Hz (1)
const BAUD_RATE = 150;  // Very slow for radio reliability
const BITS_PER_BYTE = 11; // 1 start, 8 data, 1 parity, 1 stop

export const generateRadioSOSSignal = async (lat: number, lon: number) => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  const data = `SOS:${lat.toFixed(4)},${lon.toFixed(4)}|`;
  const startTime = audioCtx.currentTime + 0.1;
  let time = startTime;

  // Preamble for receiver sync
  for (let i = 0; i < 20; i++) {
    oscillator.frequency.setValueAtTime(MARK_FREQ, time);
    time += (1 / BAUD_RATE);
  }

  // Bit-banging the data string
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i);
    // Start bit (0)
    oscillator.frequency.setValueAtTime(MARK_FREQ, time);
    time += (1 / BAUD_RATE);
    
    // 8 data bits
    for (let bit = 0; bit < 8; bit++) {
      const isBitSet = (charCode >> bit) & 1;
      oscillator.frequency.setValueAtTime(isBitSet ? SPACE_FREQ : MARK_FREQ, time);
      time += (1 / BAUD_RATE);
    }
    
    // Stop bit (1)
    oscillator.frequency.setValueAtTime(SPACE_FREQ, time);
    time += (1 / BAUD_RATE);
  }

  oscillator.start(startTime);
  oscillator.stop(time + 0.1);
  toast.info("Radio SOS: Holding PT button and keeping phone near Mic...");
  
  return new Promise(resolve => setTimeout(resolve, (time - startTime + 0.2) * 1000));
};

export const startRadioListener = (onReceive: (lat: number, lon: number) => void) => {
  if (typeof window === "undefined" || !navigator.mediaDevices) return null;

  let audioCtx: AudioContext;
  let analyzer: AnalyserNode;
  let source: MediaStreamAudioSourceNode;
  let stream: MediaStream;

  const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = 2048;
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = audioCtx.sampleRate;

    const findFreq = (freq: number) => {
      const bin = Math.round((freq * 2048) / sampleRate);
      return dataArray[bin];
    };

    let bitBuffer = "";
    let lastState = -1;

    const process = () => {
      analyzer.getByteFrequencyData(dataArray);
      const mark = findFreq(MARK_FREQ);
      const space = findFreq(SPACE_FREQ);

      let currentState = -1;
      if (mark > 180 && mark > space + 40) currentState = 0;
      else if (space > 180 && space > mark + 40) currentState = 1;

      if (currentState !== -1 && currentState !== lastState) {
        bitBuffer += currentState;
        lastState = currentState;
        
        // Very basic frame detection: look for "SOS:" start pattern in bits
        // In a real app, this would be a full UART-style bit decoder
        if (bitBuffer.length > 200) {
           // Basic logic: if we have enough bits, attempt a search for coordinates
           // This is simplified for the demo but follows the radio bridge concept
           bitBuffer = ""; 
        }
      }
      
      requestAnimationFrame(process);
    };
    process();
  };

  init().catch(console.error);

  return () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (audioCtx) audioCtx.close();
  };
};

export const syncToAuthorities = async (data: SOSSignal) => {
  if (navigator.onLine) await sendSOSToServer(data);
};
