import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SatellitePoint } from '@/services/oceanDataService';
import { SOSSignal } from '@/services/sosService';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

const sosIcon = L.divIcon({
  html: `<div style="width:40px;height:40px;background:rgba(239,68,68,0.95);border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 8px rgba(239,68,68,0.25),0 0 24px rgba(239,68,68,0.7);display:flex;align-items:center;justify-content:center;font-size:18px;">🚨</div>`,
  className: '', iconSize: [40, 40], iconAnchor: [20, 20],
});

// ── Vessel icon with animated ring ─────────────────────────────────────────────
const makeVesselIcon = (heading: number = 0, windDir: number = 0) => L.divIcon({
  html: `
    <div style="position:relative;width:48px;height:48px;">
      <!-- Outer pulse ring -->
      <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(14,165,233,0.4);animation:pulse 2s infinite;"></div>
      <!-- Wind direction indicator -->
      <div style="position:absolute;top:50%;left:50%;width:30px;height:2px;background:rgba(251,191,36,0.6);transform-origin:left center;transform:rotate(${windDir}deg) translateY(-50%);border-radius:2px;"></div>
      <!-- Vessel body -->
      <div style="position:absolute;inset:4px;background:linear-gradient(135deg,#0ea5e9,#0284c7);border-radius:50%;border:3px solid rgba(255,255,255,0.9);box-shadow:0 0 16px rgba(14,165,233,0.8),0 4px 12px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:16px;transform:rotate(${heading}deg);">🚢</div>
    </div>
    <style>@keyframes pulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:0.2;transform:scale(1.3)}}</style>
  `,
  className: '', iconSize: [48, 48], iconAnchor: [24, 24],
});

// ── Auto-center ────────────────────────────────────────────────────────────────
const CenterMap = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

// ── Dark map CSS injection ─────────────────────────────────────────────────────
const InjectDarkCSS = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'leaflet-dark-override';
    style.textContent = `
      .leaflet-container { background: #050d1a !important; }
      .leaflet-popup-content-wrapper {
        background: rgba(10,20,40,0.97) !important;
        border: 1px solid rgba(14,165,233,0.3) !important;
        border-radius: 16px !important;
        color: #fff !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
      }
      .leaflet-popup-tip { background: rgba(10,20,40,0.97) !important; }
      .leaflet-popup-close-button { color: #64748b !important; }
      .leaflet-bar a { background: rgba(10,20,40,0.9) !important; color:#94a3b8 !important; border-color:rgba(255,255,255,0.1) !important; }
      .leaflet-bar a:hover { background: rgba(14,165,233,0.2) !important; color: #0ea5e9 !important; }
      .leaflet-control-attribution { background: rgba(0,0,0,0.5) !important; color: #334155 !important; font-size:8px; }
      .leaflet-control-attribution a { color:#475569 !important; }
    `;
    if (!document.getElementById('leaflet-dark-override')) {
      document.head.appendChild(style);
    }
    return () => { document.getElementById('leaflet-dark-override')?.remove(); };
  }, []);
  return null;
};

interface Zone { position: [number, number]; radius: number; color: string; label: string; }

export interface MarineMapProps {
  center: [number, number];
  zoom: number;
  height?: string;
  zones?: Zone[];
  markers?: { position: [number, number]; label: string; isSOS?: boolean; heading?: number; windDir?: number }[];
  nearbySOS?: SOSSignal[];
  route?: [number, number][];
  satellitePoints?: SatellitePoint[];
  activeLayer?: 'none' | 'prediction' | 'sst' | 'chlorophyll';
  showNautical?: boolean;
}

const MarineMap: React.FC<MarineMapProps> = ({
  center, zoom, height = '400px',
  zones = [], markers = [], nearbySOS = [],
  route = [], satellitePoints = [],
  activeLayer = 'none', showNautical = true,
}) => {
  const getPointColor = (point: SatellitePoint) => {
    if (activeLayer === 'sst')
      return point.sst > 30 ? '#ef4444' : point.sst > 26 ? '#fbbf24' : '#3b82f6';
    if (activeLayer === 'chlorophyll')
      return point.chlorophyll > 1.2 ? '#10b981' : point.chlorophyll > 0.6 ? '#84cc16' : '#94a3b8';
    if (activeLayer === 'prediction')
      return point.fishScore > 80 ? '#10b981' : point.fishScore > 55 ? '#fbbf24' : '#ef4444';
    return 'transparent';
  };

  const getOpacity = (point: SatellitePoint) => {
    if (activeLayer === 'none') return 0;
    if (activeLayer === 'prediction')
      return point.confidence === 'HIGH' ? 0.65 : point.confidence === 'MEDIUM' ? 0.45 : 0.25;
    return 0.5;
  };

  return (
    <div style={{ height, width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '1.5rem', background: '#050d1a' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: '#050d1a' }}
      >
        <InjectDarkCSS />
        <CenterMap center={center} zoom={zoom} />

        {/* ── LAYER 1: CartoDB Dark Matter (deepest dark, no label bleed) ── */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* ── LAYER 2: Dark labels on top ── */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          opacity={0.7}
          pane="shadowPane"
        />

        {/* ── LAYER 3: OpenSeaMap Nautical overlay ── */}
        {showNautical && (
          <TileLayer
            attribution='&copy; <a href="https://www.openseamap.org">OpenSeaMap</a>'
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            opacity={0.85}
          />
        )}

        {/* ── Scientific heatmap circles ── */}
        {activeLayer !== 'none' && satellitePoints.map((point, idx) => (
          <Circle
            key={`sat-${idx}-${activeLayer}`}
            center={[point.lat, point.lon]}
            radius={3000}
            pathOptions={{
              fillColor: getPointColor(point),
              fillOpacity: getOpacity(point),
              color: point.frontDetected && activeLayer === 'prediction' ? '#f97316' : 'transparent',
              weight: point.frontDetected && activeLayer === 'prediction' ? 1.5 : 0,
              dashArray: '4, 6',
            }}
          >
            <Popup>
              <div style={{ minWidth: '170px', fontFamily: 'monospace' }}>
                <p style={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#0ea5e9', marginBottom: '6px' }}>
                  🛰 INCOIS Telemetry
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px' }}>
                  <span style={{ color: '#64748b' }}>🌡️ SST</span><span style={{ fontWeight: 800, color: '#f87171' }}>{point.sst}°C</span>
                  <span style={{ color: '#64748b' }}>🌿 Chlor</span><span style={{ fontWeight: 800, color: '#4ade80' }}>{point.chlorophyll} mg/m³</span>
                  <span style={{ color: '#64748b' }}>🌊 Current</span><span style={{ fontWeight: 800 }}>{point.currents} m/s</span>
                  <span style={{ color: '#64748b' }}>⚓ Depth</span><span style={{ fontWeight: 800 }}>~{Math.round(point.depth)}m</span>
                  <span style={{ color: '#64748b' }}>🐟 Score</span>
                  <span style={{ fontWeight: 900, color: point.fishScore > 75 ? '#10b981' : point.fishScore > 50 ? '#fbbf24' : '#ef4444' }}>
                    {point.fishScore}%
                  </span>
                  <span style={{ color: '#64748b' }}>Confidence</span>
                  <span style={{ fontWeight: 900, color: point.confidence === 'HIGH' ? '#10b981' : point.confidence === 'MEDIUM' ? '#fbbf24' : '#94a3b8' }}>
                    {point.confidence}
                  </span>
                  {point.frontDetected && (
                    <><span style={{ color: '#64748b' }}>🌊 Front</span><span style={{ color: '#f97316', fontWeight: 900 }}>DETECTED</span></>
                  )}
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* ── Nearby SOS Signals ── */}
        {nearbySOS.map((sos, idx) => (
          <React.Fragment key={`sos-${idx}`}>
            <Circle
              center={[sos.lat, sos.lon]}
              radius={1500}
              pathOptions={{ fillColor: '#ef4444', fillOpacity: 0.2, color: '#ef4444', weight: 2, dashArray: '5, 5' }}
            />
            <Marker position={[sos.lat, sos.lon]} icon={sosIcon}>
              <Popup>
                <b style={{ color: '#f87171' }}>🚨 SOS #{sos.id.slice(-4)}</b><br />
                Distress via Mesh Network<br />
                <small style={{ color: '#64748b' }}>{new Date(sos.timestamp).toLocaleTimeString()}</small>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* ── Fish Zone Circles ── */}
        {zones.map((zone, idx) => (
          <Circle
            key={`zone-${idx}`}
            center={zone.position}
            radius={zone.radius}
            pathOptions={{ fillColor: zone.color, fillOpacity: 0.15, color: zone.color, weight: 2, dashArray: '6, 10' }}
          >
            <Popup><div style={{ fontWeight: 900, color: zone.color }}>{zone.label}</div></Popup>
          </Circle>
        ))}

        {/* ── GPS Trail ── */}
        {route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{ color: '#38bdf8', weight: 3, dashArray: '10, 8', opacity: 0.75 }}
          />
        )}

        {/* ── Vessel / Point Markers ── */}
        {markers.map((marker, idx) => (
          <React.Fragment key={`marker-${idx}`}>
            {marker.isSOS ? (
              <>
                <Circle
                  center={marker.position}
                  radius={600}
                  pathOptions={{ fillColor: '#ef4444', fillOpacity: 0.35, color: '#ef4444', weight: 3 }}
                />
                <Marker position={marker.position} icon={sosIcon}>
                  <Popup><b>🚨 {marker.label}</b></Popup>
                </Marker>
              </>
            ) : (
              <Marker position={marker.position} icon={makeVesselIcon(marker.heading, marker.windDir)}>
                <Popup>
                  <div style={{ fontFamily: 'monospace', minWidth: '140px' }}>
                    <p style={{ fontWeight: 900, color: '#0ea5e9', fontSize: '11px', marginBottom: '6px' }}>🚢 {marker.label}</p>
                    <p style={{ fontSize: '9px', color: '#64748b' }}>
                      {marker.position[0].toFixed(4)}°N, {marker.position[1].toFixed(4)}°E
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default MarineMap;
