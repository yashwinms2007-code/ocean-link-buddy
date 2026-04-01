import { toast } from "sonner";

export interface MarineData {
  waveHeight: number;
  windWaveHeight: number;
  swellWaveHeight: number;
  sst: number;
  currentVelocity: number;
  wavePeriod: number;
  windSpeed: number;
  windDirection: number;   // NEW — degrees 0-360
  waveDirection: number;   // NEW — degrees 0-360
  precipitation: number;
  pressure: number;        // NEW — hPa
  timestamp: number;
}

export interface MarineForecast {
  time: string;
  waveHeight: number;
  windSpeed: number;
  sst: number;
}

export interface SafetyStatus {
  status: "SAFE" | "MODERATE" | "DANGER";
  score: number;
  color: string;
  alert: string;
  advice: string;
  trend: "WORSENING" | "IMPROVING" | "STABLE";
  risks: {
    waves: "Low" | "Moderate" | "High" | "Extreme";
    currents: "Stable" | "Strong" | "Hazardous";
    thermal: "Stable" | "Anomalous";
  };
}

const CACHE_KEY = "mitra-marine-cache";

export const calculateMarineSafety = (data: MarineData, nextData?: MarineData): SafetyStatus => {
  const risks: SafetyStatus["risks"] = {
    waves: "Low",
    currents: "Stable",
    thermal: "Stable"
  };

  const isDanger    = data.waveHeight > 3.0 || data.windSpeed > 25.0 || data.precipitation > 5.0;
  const isModerate  = data.waveHeight > 1.8 || data.windSpeed > 15.0;

  let trend: SafetyStatus["trend"] = "STABLE";
  if (nextData) {
    if (nextData.waveHeight > data.waveHeight + 0.3 || nextData.windSpeed > data.windSpeed + 5)
      trend = "WORSENING";
    else if (nextData.waveHeight < data.waveHeight - 0.3)
      trend = "IMPROVING";
  }

  if (data.waveHeight < 1)         risks.waves = "Low";
  else if (data.waveHeight < 1.8)  risks.waves = "Moderate";
  else if (data.waveHeight < 2.5)  risks.waves = "High";
  else                              risks.waves = "Extreme";

  if (data.currentVelocity < 0.6)       risks.currents = "Stable";
  else if (data.currentVelocity < 1.2)  risks.currents = "Strong";
  else                                   risks.currents = "Hazardous";

  risks.thermal = (data.sst > 26 && data.sst < 31) ? "Stable" : "Anomalous";

  if (isDanger) {
    return {
      status: "DANGER", score: 1, color: "red",
      alert: "🚨 DANGER: HIGH RISK FOR NAVIGATION",
      advice: `Severe ${data.waveHeight > 3 ? 'wave heights' : 'wind speeds'} detected. Stay in port until further notice.`,
      trend, risks
    };
  } else if (isModerate) {
    return {
      status: "MODERATE", score: 3, color: "yellow",
      alert: "⚠️ MODERATE: Caution Advised",
      advice: "Small vessels should stay near coast. Monitor wave periods closely.",
      trend, risks
    };
  }
  return {
    status: "SAFE", score: 5, color: "green",
    alert: "✅ SAFE: Sea conditions optimal",
    advice: "Ideal for all fishing vessels. Favorable drift currents detected.",
    trend, risks
  };
};

/** Convert degrees to compass direction */
export const degToCompass = (deg: number): string => {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
};

export const fetchMarineWeather = async (
  lat: number, lon: number
): Promise<{ current: MarineData; safety: SafetyStatus; forecast: MarineForecast[] }> => {
  try {
    // ── Fetch marine + atmosphere in parallel using `current` API for live data ──
    const marineUrl  = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
      `&current=wave_height,wind_wave_height,swell_wave_height,sea_surface_temperature,ocean_current_velocity,wave_period,wave_direction` +
      `&hourly=wave_height,wind_wave_height,swell_wave_height,sea_surface_temperature,ocean_current_velocity,wave_period` +
      `&timezone=auto`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=windspeed_10m,winddirection_10m,precipitation,surface_pressure` +
      `&hourly=windspeed_10m,precipitation` +
      `&timezone=auto`;

    const [marineRes, weatherRes] = await Promise.all([fetch(marineUrl), fetch(weatherUrl)]);
    const [marineJson, weatherJson] = await Promise.all([marineRes.json(), weatherRes.json()]);

    // ── Use `current` object for real-time values ──
    const mc  = marineJson.current   || {};
    const wc  = weatherJson.current  || {};
    const mh  = marineJson.hourly    || {};
    const wh  = weatherJson.hourly   || {};
    const idx = new Date().getHours();

    const current: MarineData = {
      waveHeight:     parseFloat((mc.wave_height              ?? mh.wave_height?.[idx]              ?? 1.2).toFixed(1)),
      windWaveHeight: parseFloat((mc.wind_wave_height         ?? mh.wind_wave_height?.[idx]         ?? 0.8).toFixed(1)),
      swellWaveHeight:parseFloat((mc.swell_wave_height        ?? mh.swell_wave_height?.[idx]        ?? 0.5).toFixed(1)),
      sst:            parseFloat((mc.sea_surface_temperature  ?? mh.sea_surface_temperature?.[idx]  ?? 28.5).toFixed(1)),
      currentVelocity:parseFloat((mc.ocean_current_velocity   ?? mh.ocean_current_velocity?.[idx]   ?? 0.3).toFixed(2)),
      wavePeriod:     parseFloat((mc.wave_period              ?? mh.wave_period?.[idx]              ?? 8).toFixed(1)),
      windSpeed:      parseFloat((wc.windspeed_10m            ?? wh.windspeed_10m?.[idx]            ?? 10).toFixed(1)),
      windDirection:  Math.round(wc.winddirection_10m         ?? 180),
      waveDirection:  Math.round(mc.wave_direction            ?? 225),
      precipitation:  parseFloat((wc.precipitation            ?? wh.precipitation?.[idx]            ?? 0).toFixed(1)),
      pressure:       Math.round(wc.surface_pressure          ?? 1013),
      timestamp:      Date.now(),
    };

    // +3 hour trend
    const ni = idx + 3;
    const nextData: MarineData = {
      ...current,
      waveHeight: mh.wave_height?.[ni]    ?? current.waveHeight,
      windSpeed:  wh.windspeed_10m?.[ni]  ?? current.windSpeed,
    };

    const forecast: MarineForecast[] = (mh.time ?? [])
      .slice(idx, idx + 24)
      .map((t: string, i: number) => ({
        time:       new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        waveHeight: mh.wave_height?.[idx + i]           ?? current.waveHeight,
        sst:        mh.sea_surface_temperature?.[idx + i] ?? current.sst,
        windSpeed:  wh.windspeed_10m?.[idx + i]         ?? current.windSpeed,
      }));

    const safety = calculateMarineSafety(current, nextData);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ current, safety, forecast, timestamp: Date.now() }));
    return { current, safety, forecast };

  } catch (error) {
    console.warn("Marine API offline, loading cache...", error);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      toast.info("Offline Mode: Showing last known sea state.");
      return JSON.parse(cached);
    }
    const mockCurrent: MarineData = {
      waveHeight: 1.2, windWaveHeight: 0.8, swellWaveHeight: 0.5,
      sst: 28.5, currentVelocity: 0.3, wavePeriod: 8,
      windSpeed: 10, windDirection: 180, waveDirection: 225,
      precipitation: 0, pressure: 1013, timestamp: Date.now(),
    };
    return { current: mockCurrent, safety: calculateMarineSafety(mockCurrent), forecast: [] };
  }
};
