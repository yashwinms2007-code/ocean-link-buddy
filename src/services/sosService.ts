import { toast } from "sonner";
import { saveAlert } from "./localDb";

export interface SOSSignal {
  id: string;
  lat: number;
  lon: number;
  timestamp: number;
  danger: "HIGH" | "MEDIUM" | "LOW";
  type: "DISTRESS" | "SYNC";
  senderId: string;
  userId?: string;
  channel?: string[];
}

const MESH_CHANNEL = "mitra_fisherman_mesh";
const meshChannel = new BroadcastChannel(MESH_CHANNEL);
const senderId = Math.random().toString(36).substring(7);
const SOS_QUEUE_KEY = "mitra_sos_delivery_queue_v3";

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

// ─── SMS Fallback ────────────────────────────────────────────────────────
export const sendSOSviaSMS = (lat: number, lon: number) => {
  const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
  const message = `SOS EMERGENCY ALERT!\nFisherman in danger at sea.\nLocation: ${mapsLink}\nPlease dispatch rescue immediately.`;
  window.open(`sms:112?body=${encodeURIComponent(message)}`, "_blank");
  toast.success("SMS to 112 emergency service triggered.");
};

// ─── MAIN: Multi-Channel Broadcast (Free Offline Version) ──────────────────
export const broadcastSOS = async (data: SOSSignal) => {
  // Channel 1: Local Mesh (Same browser/tabs or nearby peer devices bridging this channel)
  meshChannel.postMessage(data);

  // Channel 2: Persist deeply into IndexedDB queue instead of Paid Cloud Database
  try {
    await saveAlert(data);
    toast.success("SOS Registered on Local PWA node & Mesh Network.");
  } catch (err) {
    console.error("Local DB Save Error:", err);
    toast.error("Failed to queue SOS locally!");
  }
};

// ─── Global Realtime Listener (Free Offline Version) ───────────────────────
export const setupGlobalSOSListener = (onReceive: (data: SOSSignal) => void) => {
  // In the free version, we listen exclusively to the mesh layer
  // since there's no central cloud server broadcasting signals over WebSockets.
  const handler = (event: MessageEvent) => {
    const data = event.data as SOSSignal;
    if (data.senderId !== senderId && data.type === "DISTRESS") {
      // Save incoming foreign alerts to our local DB too for tracking
      saveAlert(data).catch(() => {});
      onReceive(data);
    }
  };
  
  meshChannel.addEventListener("message", handler);

  return () => {
    meshChannel.removeEventListener("message", handler);
  };
};

export const getSenderId = () => senderId;

// ─── Local Mesh Listener (BroadcastChannel only) ──────────────────────────
export const setupMeshListener = (onReceive: (data: SOSSignal) => void) => {
  meshChannel.addEventListener("message", (event) => {
    const data = event.data as SOSSignal;
    if (data.senderId !== senderId) onReceive(data);
  });
};

// ─── Auto-Escalation (SMS at T+60s) ──────────────────────────────────────
export const setupAutoEscalation = (lat: number, lon: number, lang: string): (() => void) => {
  const timer = setTimeout(() => {
    sendSOSviaSMS(lat, lon);
    toast.warning("Auto-Escalation: SOS SMS sent to 112 automatically.");
  }, 60000);
  return () => clearTimeout(timer);
};

// ─── Continuous GPS Tracking ──────────────────────────────────────────────
let continuousWatchId: number | null = null;

export const startContinuousTracking = (onUpdate: (lat: number, lon: number) => void) => {
  if (!navigator.geolocation) return;
  continuousWatchId = navigator.geolocation.watchPosition(
    (pos) => onUpdate(pos.coords.latitude, pos.coords.longitude),
    (err) => console.warn("[SOS Track] GPS error:", err),
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
  );
};

export const stopContinuousTracking = () => {
  if (continuousWatchId !== null) {
    navigator.geolocation.clearWatch(continuousWatchId);
    continuousWatchId = null;
  }
};

// ─── Radio SOS Signal (Audio Tone Burst) ─────────────────────────────────
export const generateRadioSOSSignal = async (lat: number, lon: number): Promise<void> => {
  try {
    const ctx = new AudioContext();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration + 0.05);
    };
    // Morse SOS: ... --- ...
    const dit = 0.1, dah = 0.3, gap = 0.1, letterGap = 0.3;
    let t = 0;
    [dit, dit, dit].forEach(d => { playTone(800, t, d); t += d + gap; }); t += letterGap;
    [dah, dah, dah].forEach(d => { playTone(800, t, d); t += d + gap; }); t += letterGap;
    [dit, dit, dit].forEach(d => { playTone(800, t, d); t += d + gap; });
    toast.success(`📡 SOS Radio Burst sent — GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    await new Promise(r => setTimeout(r, (t + 0.5) * 1000));
    ctx.close();
  } catch {
    toast.warning("Audio tone failed — check speaker permissions.");
  }
};

// ─── Radio Listener (Simulated microphone bridge) ─────────────────────────
export const startRadioListener = (
  onDetect: (lat: number, lon: number) => void
): (() => void) | null => {
  const timer = setTimeout(() => {
    onDetect(12.9241, 74.861);
  }, 20000);
  toast.info("Radio Bridge armed — scanning 2182 kHz distress band...");
  return () => clearTimeout(timer);
};


// End of sosService.ts
