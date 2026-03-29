import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    const lat = latitude ?? 13.0;  // Default: coastal Karnataka
    const lon = longitude ?? 74.8;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code,precipitation&hourly=wave_height&forecast_days=1&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    const current = data.current;
    const waveHeights = data.hourly?.wave_height ?? [];
    const currentHourIndex = new Date().getHours();
    const currentWaveHeight = waveHeights[currentHourIndex] ?? null;

    // Determine risk level
    const windSpeed = current.wind_speed_10m ?? 0;
    const precipitation = current.precipitation ?? 0;
    const waveH = currentWaveHeight ?? 0;

    let risk: "safe" | "moderate" | "danger" = "safe";
    if (windSpeed > 50 || waveH > 3 || precipitation > 20) {
      risk = "danger";
    } else if (windSpeed > 25 || waveH > 1.5 || precipitation > 5) {
      risk = "moderate";
    }

    // Weather code to condition text
    const code = current.weather_code ?? 0;
    let condition = "Clear";
    if (code >= 71) condition = "Snow";
    else if (code >= 61) condition = "Rain";
    else if (code >= 51) condition = "Drizzle";
    else if (code >= 45) condition = "Foggy";
    else if (code >= 3) condition = "Cloudy";
    else if (code >= 1) condition = "Partly Cloudy";

    // Alerts
    const alerts = [];
    if (waveH > 2) alerts.push({ label: "High Tide Warning", severity: "warning" });
    if (precipitation > 10) alerts.push({ label: "Heavy Rain", severity: "warning" });
    if (precipitation > 20) alerts.push({ label: "Flood Risk", severity: "danger" });
    if (windSpeed > 40) alerts.push({ label: "Strong Winds", severity: "warning" });
    if (alerts.length === 0) alerts.push({ label: "No active alerts", severity: "safe" });

    const result = {
      temperature: `${Math.round(current.temperature_2m)}°C`,
      windSpeed: `${Math.round(windSpeed)} km/h`,
      waveHeight: currentWaveHeight !== null ? `${currentWaveHeight} m` : "N/A",
      condition,
      risk,
      alerts,
      updatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
