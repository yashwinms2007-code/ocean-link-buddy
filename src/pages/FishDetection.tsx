import { useState } from "react";
import { ArrowLeft, Fish } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";
import { MapContainer, TileLayer, Circle, Popup, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const fishIcon = L.divIcon({
  html: `<div style="font-size:20px;">🐟</div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const fishZones = [
  { lat: 12.99, lng: 74.81, radius: 800, density: "high", label: "High Density - Sardines & Mackerel", species: "Sardines, Mackerel" },
  { lat: 12.96, lng: 74.77, radius: 600, density: "medium", label: "Medium Density - Prawns", species: "Prawns" },
  { lat: 13.02, lng: 74.79, radius: 500, density: "high", label: "High Density - Pomfret", species: "Pomfret, Tuna" },
  { lat: 12.93, lng: 74.82, radius: 400, density: "low", label: "Low Density - Mixed", species: "Mixed catch" },
  { lat: 13.05, lng: 74.84, radius: 700, density: "medium", label: "Medium Density - Kingfish", species: "Kingfish" },
];

const densityColors: Record<string, { color: string; fillColor: string }> = {
  high: { color: "#22c55e", fillColor: "#22c55e" },
  medium: { color: "#eab308", fillColor: "#eab308" },
  low: { color: "#ef4444", fillColor: "#ef4444" },
};

const FishDetection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<typeof fishZones[0] | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("fishDetection")}</h1>
        </div>
      </div>

      {/* Density Summary Cards */}
      <div className="px-5 flex gap-2 mb-4">
        {[
          { level: "high", label: t("high"), emoji: "🐟🐟🐟", bg: "bg-[#22c55e]/10", text: "text-[#22c55e]" },
          { level: "medium", label: t("medium"), emoji: "🐟🐟", bg: "bg-[#eab308]/10", text: "text-[#eab308]" },
          { level: "low", label: t("low"), emoji: "🐟", bg: "bg-[#ef4444]/10", text: "text-[#ef4444]" },
        ].map((d) => (
          <div key={d.level} className={`flex-1 ${d.bg} rounded-xl p-3 text-center`}>
            <p className="text-lg">{d.emoji}</p>
            <p className={`text-xs font-bold ${d.text}`}>{d.label}</p>
            <p className="text-xs text-muted-foreground">
              {fishZones.filter(z => z.density === d.level).length} zones
            </p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="mx-5 rounded-2xl overflow-hidden border border-border flex-1 min-h-[300px] relative" style={{ height: "calc(100vh - 380px)" }}>
        <MapContainer
          center={[12.98, 74.80]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {fishZones.map((zone, i) => {
            const colors = densityColors[zone.density];
            return (
              <Circle
                key={i}
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{ color: colors.color, fillColor: colors.fillColor, fillOpacity: 0.2, weight: 2 }}
                eventHandlers={{ click: () => setSelected(zone) }}
              >
                <Popup>
                  <div>
                    <strong>{zone.label}</strong>
                    <br />
                    <span>Species: {zone.species}</span>
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {fishZones.filter(z => z.density === "high").map((zone, i) => (
            <Marker key={`marker-${i}`} position={[zone.lat, zone.lng]} icon={fishIcon}>
              <Popup>{zone.label}</Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute top-3 right-3 z-[1000] bg-background/90 backdrop-blur rounded-xl p-2.5 space-y-1.5 border border-border">
          <p className="text-xs font-bold text-foreground mb-1">Fish Density</p>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" /> High
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <div className="w-3 h-3 rounded-full bg-[#eab308]" /> Medium
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" /> Low
          </div>
        </div>
      </div>

      {/* Selected Zone Info */}
      {selected && (
        <div className="mx-5 mt-3 bg-card rounded-2xl p-4 border border-border animate-fade-in">
          <div className="flex items-center gap-3">
            <Fish size={24} className="text-primary" />
            <div>
              <p className="font-bold text-foreground">{selected.label}</p>
              <p className="text-sm text-muted-foreground">Species: {selected.species}</p>
              <p className="text-xs text-muted-foreground mt-1">
                📍 {selected.lat.toFixed(4)}°N, {selected.lng.toFixed(4)}°E
              </p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default FishDetection;
