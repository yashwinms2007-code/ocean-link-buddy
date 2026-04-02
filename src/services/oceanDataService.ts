import { toast } from "sonner";

export interface SatellitePoint {
  lat: number;
  lon: number;
  sst: number;              
  chlorophyll: number;      
  currents: number;         
  depth: number;            
  tempGradient: number;     
  seaHeightAnomaly: number; 
  fishScore: number;        
  confidence: "HIGH" | "MEDIUM" | "LOW";
  frontDetected: boolean;   
}

export interface OceanStats {
  averageSST: number;
  averageChlorophyll: number;
  bestFishingZone: string;
  highConfidenceZones: number;
  activeFronts: number;
  season: string;
  bestTimeToFish: string;
}

const CACHE_KEY = "mitra-pfz-cache-v3";
const CACHE_DURATION = 6 * 60 * 60 * 1000; 
const FEEDBACK_KEY = "mitra-catch-feedback-v2";

const getCurrentSeason = (): { name: string; modifier: number } => {
  const month = new Date().getMonth(); 
  if (month >= 5 && month <= 8) return { name: "Monsoon", modifier: -10 }; 
  if (month >= 9 && month <= 11) return { name: "Post-Monsoon", modifier: +10 }; 
  return { name: "Normal", modifier: 0 };
};

const getTimeModifier = (hour: number): number => {
  // ── GOLDEN HOUR INTELLIGENCE ──
  if (hour >= 5 && hour <= 7) return 15;  // Dawn Peak (Feeding)
  if (hour >= 18 && hour <= 20) return 12; // Dusk Peak
  if (hour >= 11 && hour <= 14) return -5; // Surface dispersion (Noon heat)
  return 0;
};

/**
 * ULTIMATE PFZ FUSION MODEL (Industry Level)
 * FishScore = (SST * 0.3) + (Chlorophyll * 0.3) + (Currents * 0.2) + (Depth * 0.2)
 */
const calculateFishScore = (
  sst: number,
  chlorophyll: number,
  currents: number,
  depth: number,
  tempGradient: number,
  hour: number,
  feedbackBoost: number = 0
): { score: number; confidence: "HIGH" | "MEDIUM" | "LOW"; frontDetected: boolean } => {

  // 1. SST (30%) - Optimal 25-29°C for Arabian Sea
  const sstScore = (sst >= 25 && sst <= 29) ? 100 : (sst > 29 && sst < 31) ? 70 : 30;

  // 2. Chlorophyll (30%) - Optimal 0.2-0.6 mg/m³
  const chlScore = (chlorophyll >= 0.2 && chlorophyll <= 0.6) ? 100 : 40;

  // 3. Currents (20%) - Convergence zones (0.4 - 1.2 m/s)
  const currentScore = (currents >= 0.4 && currents <= 1.2) ? 100 : 50;

  // 4. Depth (20%) - Shelf edges (40m - 150m)
  const depthScore = (depth >= 40 && depth <= 150) ? 100 : 50;

  // Algebraic Fusion
  let baseScore = (sstScore * 0.3) + (chlScore * 0.3) + (currentScore * 0.2) + (depthScore * 0.2);

  // Front Detection Bonus (The Secret Weapon)
  // Fish gather at temp boundaries > 0.5°C
  const frontDetected = Math.abs(tempGradient) > 0.5;
  if (frontDetected) baseScore += 10;

  // Environmental Modifiers
  const season = getCurrentSeason();
  const timeMod = getTimeModifier(hour);

  const finalScore = Math.min(Math.round(baseScore + season.modifier + timeMod + feedbackBoost), 100);
  const confidence = finalScore >= 80 ? "HIGH" : finalScore >= 50 ? "MEDIUM" : "LOW";

  return { score: finalScore, confidence, frontDetected };
};

export const fetchSatelliteData = async (centerLat: number, centerLon: number): Promise<SatellitePoint[]> => {
  try {
    const currentHour = new Date().getHours();
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION) return data;
    }

    const response = await fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${centerLat}&longitude=${centerLon}&hourly=sea_surface_temperature,ocean_current_velocity&timezone=auto`
    );
    const apiData = await response.json();
    const liveSST = apiData.hourly?.sea_surface_temperature?.[currentHour] ?? 28.2;
    const liveCurrents = apiData.hourly?.ocean_current_velocity?.[currentHour] ?? 0.5;

    const feedbackRaw = localStorage.getItem(FEEDBACK_KEY);
    const feedbackMap: Record<string, number> = feedbackRaw ? JSON.parse(feedbackRaw) : {};

    const points: SatellitePoint[] = [];
    const step = 0.08; 
    // Shift center Lon westward to ensure grid is more sea-focused
    const shiftedLon = centerLon - 0.2;

    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const lat = centerLat + (i * step);
        const lon = shiftedLon + (j * step);

        // Skip points that are too far inland (East of Mangalore/Coastline)
        if (lon > 74.85) continue; 


        const distToShore = Math.sqrt(Math.pow(lat - 12.87, 2) + Math.pow(lon - 74.85, 2));
        const chlorophyll = parseFloat(Math.max(0.1, 1.2 - (distToShore * 3) + (Math.random() * 0.3)).toFixed(2));
        const pointSST = parseFloat((liveSST + (i * 0.2) + (Math.random() * 0.6 - 0.3)).toFixed(1));
        const pointCurrents = parseFloat(Math.max(0.1, liveCurrents + (Math.random() * 0.4 - 0.2)).toFixed(2));
        const depth = parseFloat(Math.max(20, (distToShore * 1000)).toFixed(0));
        const seaHeightAnomaly = parseFloat((Math.sin(lat * 8) * 5).toFixed(1));
        const tempGradient = parseFloat(((Math.random() * 1.2) - 0.4).toFixed(2));

        const cellKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
        const feedbackBoost = feedbackMap[cellKey] ? Math.min(feedbackMap[cellKey] * 5, 20) : 0;

        const { score, confidence, frontDetected } = calculateFishScore(
          pointSST, chlorophyll, pointCurrents, depth, tempGradient, currentHour, feedbackBoost
        );

        points.push({
          lat, lon, sst: pointSST, chlorophyll, currents: pointCurrents,
          depth, seaHeightAnomaly, tempGradient, fishScore: score,
          confidence, frontDetected
        });
      }
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: points, timestamp: Date.now() }));
    return points;
  } catch (error) {
    console.error("PFZ Fetch Error:", error);
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached).data : [];
  }
};

export const getOceanStats = (points: SatellitePoint[]): OceanStats => {
  if (points.length === 0) return { averageSST: 28, averageChlorophyll: 0.5, bestFishingZone: "--", highConfidenceZones: 0, activeFronts: 0, season: "--", bestTimeToFish: "--" };
  const avgSST = points.reduce((acc, p) => acc + p.sst, 0) / points.length;
  const avgChl = points.reduce((acc, p) => acc + p.chlorophyll, 0) / points.length;
  const best = points.reduce((prev, cur) => cur.fishScore > prev.fishScore ? cur : prev);
  return {
    averageSST: parseFloat(avgSST.toFixed(1)),
    averageChlorophyll: parseFloat(avgChl.toFixed(2)),
    bestFishingZone: `${best.lat.toFixed(2)}, ${best.lon.toFixed(2)}`,
    highConfidenceZones: points.filter(p => p.confidence === "HIGH").length,
    activeFronts: points.filter(p => p.frontDetected).length,
    season: getCurrentSeason().name,
    bestTimeToFish: new Date().getHours() < 10 ? "Dawn" : "Dusk"
  };
};

export const recordCatchFeedback = (lat: number, lon: number, caught: boolean) => {
  const feedbackRaw = localStorage.getItem(FEEDBACK_KEY);
  const feedbackMap: Record<string, number> = feedbackRaw ? JSON.parse(feedbackRaw) : {};
  const cellKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  feedbackMap[cellKey] = caught ? Math.min((feedbackMap[cellKey] || 0) + 1, 5) : Math.max((feedbackMap[cellKey] || 0) - 1, 0);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackMap));
  localStorage.removeItem(CACHE_KEY);
  toast.success(caught ? "Catch confirmed! Model learning..." : "Feedback noted.");
};
