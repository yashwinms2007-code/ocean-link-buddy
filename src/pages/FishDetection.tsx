import { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, MapPin, Search, Compass, AlertTriangle, ShieldCheck, Thermometer, Waves } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { INCOIS_DATA, INCOISDataRecord } from "@/data/incoisData";

const MANGALORE_LAT = 12.9141;
const MANGALORE_LNG = 74.8560;

// Haverise distance formula
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

// Custom pulsing icon for the user's vessel
const userIcon = L.divIcon({
  className: 'user-marker-container',
  html: `<div class="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-2xl relative">
           <div class="absolute inset-0 bg-primary rounded-full animate-ping opacity-30"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Generic Dark marker for Fishing Hotspots (matching screenshot)
const hotspotIcon = L.divIcon({
  className: 'hotspot-marker',
  html: `<div class="w-4 h-4 bg-slate-900 rounded-full border-[3px] border-white shadow-lg pointer-events-none" />`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Map component for auto-centering
const MapController = ({ center, zoom = 10 }: { center: [number, number], zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, map, zoom]);
  return null;
};

const FishDetection = () => {
  const { t } = useLanguage();
  const [userLoc, setUserLoc] = useState<[number, number]>([MANGALORE_LAT, MANGALORE_LNG]);
  const [selectedRecord, setSelectedRecord] = useState<INCOISDataRecord | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([MANGALORE_LAT, MANGALORE_LNG]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc([pos.coords.latitude, pos.coords.longitude]);
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { timeout: 10000 }
      );
    }
  }, []);

  const handleSelectRecord = (record: INCOISDataRecord) => {
    setSelectedRecord(record);
    setMapCenter([record.lat, record.lng]);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const getSafetyStatus = (distanceStr: string) => {
    const maxDist = parseInt(distanceStr.split('-')[1]);
    if (maxDist > 60) return { status: 'DANGER', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (maxDist > 40) return { status: 'CAUTION', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { status: 'SAFE', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  return (
    <div className="flex flex-col gap-8 pb-40">
      {/* HEADER */}
      <div className="px-6 md:px-10 space-y-4 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
           <div className="flex items-center gap-3">
              <div className="h-0.5 w-10 bg-primary rounded-full" />
              <span className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Official Forecast</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter uppercase leading-none">
              INCOIS PFZ Mapping
           </h1>
           <p className="text-sm font-bold text-slate-400 max-w-md leading-relaxed">
              Real-time, tabular Potential Fishing Zones (PFZ) derived from official oceanic coordinates, bearings, and depth measurements for the Karnataka coastline.
           </p>
        </motion.div>
      </div>

      {/* TRACKING MAP */}
      <div className="px-6 md:px-10">
        <div className="relative h-[450px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
          <MapContainer
            center={mapCenter}
            zoom={9}
            className="h-full w-full z-10"
            zoomControl={false}
          >
            {/* Standard Dark Google-like Map Tiles for higher hotspot contrast */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapController center={mapCenter} zoom={selectedRecord ? 11 : 9} />
            
            <Marker position={userLoc} icon={userIcon} />

            {/* If a record is selected, draw a line from user to the record */}
            {selectedRecord && (
              <Polyline 
                positions={[userLoc, [selectedRecord.lat, selectedRecord.lng]]}
                color="#0ea5e9"
                weight={3}
                dashArray="5, 10"
                className="animate-pulse"
              />
            )}

            {INCOIS_DATA.map((record, i) => (
              <Marker 
                key={i} 
                position={[record.lat, record.lng]} 
                icon={hotspotIcon}
                eventHandlers={{ click: () => handleSelectRecord(record) }}
              >
                 <Popup className="dark-popup" closeButton={false}>
                    <div className="bg-slate-900 border border-slate-700 p-4 w-64 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                       <h3 className="text-white text-[15px] font-medium leading-tight mb-4">
                         Fishing Hotspot —<br/>Arabian Sea, Karnataka
                       </h3>
                       <button className="flex items-center justify-between w-24 px-3 py-1.5 border border-slate-700 rounded-lg text-slate-300 text-xs mb-4 hover:bg-slate-800">
                         Copy <span className="text-[10px]">▼</span>
                       </button>
                       <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-start gap-4 cursor-pointer hover:bg-slate-800 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0">
                             <MapPin size={14} className="text-blue-400" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-white text-xs font-medium">Fishing Hotspot</p>
                             <p className="text-slate-400 text-[10px] uppercase">
                               From {record.coast}
                             </p>
                             <p className="text-slate-500 text-[10px] leading-tight break-all">
                               {record.latDMS}N, {record.lngDMS}E
                             </p>
                          </div>
                       </div>
                    </div>
                 </Popup>
              </Marker>
            ))}
          </MapContainer>

          <style>{`
            .dark-popup .leaflet-popup-content-wrapper {
              background: transparent;
              box-shadow: none;
              padding: 0;
            }
            .dark-popup .leaflet-popup-tip { background: #0f172a; }
          `}</style>
        </div>
      </div>

      {/* SELECTED RECORD HUD DETAILS */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 md:px-10 overflow-hidden"
          >
             <div className="bg-slate-950 text-white rounded-[3rem] p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                   <Compass size={200} />
                </div>
                
                <div className="flex-1 space-y-4 relative z-10 w-full">
                   <h3 className="text-2xl font-black">{selectedRecord.coast} <span className="text-slate-500 text-lg">Sector</span></h3>
                   
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                         <span className="text-[10px] font-black text-slate-500 uppercase">Heading</span>
                         <p className="text-lg font-bold text-blue-400">{selectedRecord.direction} • {selectedRecord.bearing}°</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 relative">
                         <span className="text-[10px] font-black text-slate-500 uppercase">Live Distance</span>
                         <p className="text-lg font-bold text-white mb-2">{getDistance(userLoc[0], userLoc[1], selectedRecord.lat, selectedRecord.lng)} km</p>
                         <p className="text-[10px] font-bold text-slate-500 border-t border-slate-800 pt-2 text-right">Zone Width: {selectedRecord.distanceKm}km</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 relative">
                         <span className="text-[10px] font-black text-slate-500 uppercase inline-flex items-center gap-1"><Waves size={12}/> Depth</span>
                         <p className="text-lg font-bold text-white mb-2">{selectedRecord.depthMtr} m</p>
                         <div className="absolute right-3 bottom-3 text-red-500">
                           <Thermometer size={16} />
                         </div>
                      </div>
                      <div className={`p-4 rounded-2xl border flex flex-col justify-center items-center text-center ${getSafetyStatus(selectedRecord.distanceKm).bg} border-white/5`}>
                         <ShieldCheck className={getSafetyStatus(selectedRecord.distanceKm).color} size={24} />
                         <span className={`text-[11px] font-black mt-2 uppercase tracking-widest ${getSafetyStatus(selectedRecord.distanceKm).color}`}>
                           {getSafetyStatus(selectedRecord.distanceKm).status} ZONE
                         </span>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OFFICIAL INCOIS TABULAR VIEW */}
      <div className="px-6 md:px-10">
         <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Karnataka Forecast Database</h3>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Validity: 3 Apr 2026 - 4 Apr 2026</p>
               </div>
               <Search className="text-slate-300" />
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-white">
                     <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Origin Coast</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Direction</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Bearing</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Distance (km)</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Depth (m)</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Coordinates (DMS)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {INCOIS_DATA.map((row, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => handleSelectRecord(row)}
                          className={`cursor-pointer transition-colors ${selectedRecord?.coast === row.coast ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                        >
                           <td className="px-8 py-4">
                             <div className="flex items-center gap-3">
                               <div className={`w-2 h-2 rounded-full ${selectedRecord?.coast === row.coast ? 'bg-primary animate-pulse' : 'bg-slate-300'}`} />
                               <span className="text-sm font-bold text-slate-900">{row.coast}</span>
                             </div>
                           </td>
                           <td className="px-8 py-4 text-sm font-bold text-slate-500">{row.direction}</td>
                           <td className="px-8 py-4 text-sm font-bold text-slate-500">{row.bearing}&deg;</td>
                           <td className="px-8 py-4 text-sm font-bold text-slate-500">{row.distanceKm}</td>
                           <td className="px-8 py-4 text-sm font-bold text-slate-500">{row.depthMtr}</td>
                           <td className="px-8 py-4 text-xs font-bold text-slate-600 bg-slate-50/50 font-mono tracking-tighter rounded-r-2xl">
                             {row.latDMS} N<br/>{row.lngDMS} E
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FishDetection;

