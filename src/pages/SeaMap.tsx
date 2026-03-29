import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Navigation, Locate } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const boatIcon = L.divIcon({
  html: `<div style="background:#2563eb;border:3px solid white;border-radius:50%;width:20px;height:20px;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Sample zones along Indian coast
const zones = {
  safe: [
    { lat: 12.98, lng: 74.78, radius: 800, label: "Safe Zone A" },
    { lat: 13.01, lng: 74.82, radius: 600, label: "Safe Zone B" },
  ],
  danger: [
    { lat: 12.95, lng: 74.83, radius: 500, label: "Danger Zone - Strong Currents" },
    { lat: 13.03, lng: 74.76, radius: 400, label: "Danger Zone - Rocky Area" },
  ],
  fish: [
    { lat: 12.99, lng: 74.81, radius: 700, label: "Fish Zone - High Density" },
    { lat: 12.96, lng: 74.77, radius: 500, label: "Fish Zone - Medium Density" },
  ],
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

const SeaMap = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 74.7869 });
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) return;
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  useEffect(() => () => stopTracking(), []);

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
              <ArrowLeft size={20} className="text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">{t("seaMap")}</h1>
          </div>
          <button
            onClick={tracking ? stopTracking : startTracking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              tracking ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            <Locate size={14} />
            {tracking ? "Tracking" : "Track GPS"}
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="mx-5 rounded-2xl overflow-hidden border border-border flex-1 min-h-[350px] relative">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={14}
          className="h-full w-full min-h-[350px]"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {tracking && <RecenterMap lat={position.lat} lng={position.lng} />}

          {/* Boat marker */}
          <Marker position={[position.lat, position.lng]} icon={boatIcon}>
            <Popup>{t("yourBoat")}</Popup>
          </Marker>

          {/* Safe zones */}
          {zones.safe.map((z, i) => (
            <Circle key={`safe-${i}`} center={[z.lat, z.lng]} radius={z.radius}
              pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.15, weight: 2 }}>
              <Popup>{z.label}</Popup>
            </Circle>
          ))}

          {/* Danger zones */}
          {zones.danger.map((z, i) => (
            <Circle key={`danger-${i}`} center={[z.lat, z.lng]} radius={z.radius}
              pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.15, weight: 2 }}>
              <Popup>{z.label}</Popup>
            </Circle>
          ))}

          {/* Fish zones */}
          {zones.fish.map((z, i) => (
            <Circle key={`fish-${i}`} center={[z.lat, z.lng]} radius={z.radius}
              pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15, weight: 2 }}>
              <Popup>{z.label}</Popup>
            </Circle>
          ))}
        </MapContainer>

        {/* Legend overlay */}
        <div className="absolute top-3 right-3 z-[1000] bg-background/90 backdrop-blur rounded-xl p-2.5 space-y-1.5 border border-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" /> {t("safeZone")}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" /> {t("dangerZone")}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]" /> {t("fishZone")}
          </div>
        </div>
      </div>

      {/* Coordinates */}
      <div className="px-5 mt-4">
        <div className="glass-card rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground">{t("latitude")}</p>
            <p className="font-bold text-foreground">{position.lat.toFixed(4)}° N</p>
          </div>
          <Navigation size={20} className="text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">{t("longitude")}</p>
            <p className="font-bold text-foreground">{position.lng.toFixed(4)}° E</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default SeaMap;
