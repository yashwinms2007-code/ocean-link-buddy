import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SatellitePoint } from '@/services/oceanDataService';
import { SOSSignal } from '@/services/sosService';

// Fallback token for initial dev, ideally move to .env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWl0cmEtbWFyaW5lIiwiYSI6ImNtMnd4eGZwdzBkazIycXNmdnd4eGZwdzBkazIycXNmdnd4eGZwdzBkazIifQ.placeholder';

interface Zone {
  position: [number, number];
  radius: number;
  color: string;
  label: string;
}

interface MarineMapProps {
  center: [number, number];
  zoom: number;
  height?: string;
  zones?: Zone[];
  markers?: {
    position: [number, number];
    label: string;
    isSOS?: boolean;
  }[];
  satellitePoints?: SatellitePoint[];
  activeLayer?: 'none' | 'prediction' | 'sst' | 'chlorophyll';
  nearbySOS?: SOSSignal[];
}

const MarineMapBox: React.FC<MarineMapProps> = ({ 
  center, 
  zoom, 
  height = "400px", 
  zones = [],
  markers = [],
  satellitePoints = [],
  activeLayer = 'none',
  nearbySOS = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1', // Maritime-ready style
      center: [center[1], center[0]], // Mapbox uses [lng, lat]
      zoom: zoom,
      attributionControl: false
    });

    map.on('load', () => {
      setIsLoaded(true);
      
      // Add Sources and Layers
      map.addSource('marine-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // SST Heatmap Layer
      map.addLayer({
        id: 'sst-heat',
        type: 'heatmap',
        source: 'marine-data',
        layout: {
          'visibility': 'none'
        },
        paint: {
          'heatmap-weight': ['get', 'sst'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.5, 'yellow',
            1, 'red'
          ]
        }
      });

      // Chlorophyll Heatmap Layer
      map.addLayer({
        id: 'chlorophyll-heat',
        type: 'heatmap',
        source: 'marine-data',
        layout: {
          'visibility': 'none'
        },
        paint: {
          'heatmap-weight': ['get', 'chlorophyll'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 128, 0, 0)',
            0.5, 'lime',
            1, 'white'
          ]
        }
      });
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  // Update Data and Center
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Fly to new center
    mapRef.current.flyTo({
      center: [center[1], center[0]],
      zoom: zoom,
      essential: true
    });

    // Update GeoJSON for scientific layers
    const source = mapRef.current.getSource('marine-data') as mapboxgl.GeoJSONSource;
    if (source) {
       const features = satellitePoints.map(p => ({
          type: 'Feature' as const,
          geometry: {
             type: 'Point' as const,
             coordinates: [p.lon, p.lat]
          },
          properties: {
             sst: p.sst,
             chlorophyll: p.chlorophyll,
             fishScore: p.fishScore
          }
       }));
       source.setData({ type: 'FeatureCollection', features });
    }
  }, [center, zoom, satellitePoints, isLoaded]);

  // Update Active Layer
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const layers = ['sst-heat', 'chlorophyll-heat'];
    layers.forEach(l => {
      const visibility = (activeLayer === l.split('-')[0]) ? 'visible' : 'none';
      mapRef.current!.setLayoutProperty(l, 'visibility', visibility);
    });
  }, [activeLayer, isLoaded]);

  // Handle Markers (Traditional and SOS)
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Remove old marker instances
    const currentMarkers = document.querySelectorAll('.mapboxgl-marker');
    currentMarkers.forEach(m => m.remove());

    // Add new markers
    markers.forEach(m => {
       const el = document.createElement('div');
       if (m.isSOS) {
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#ef4444';
          el.style.boxShadow = '0 0 20px #ef4444';
          el.style.border = '3px solid white';
          el.classList.add('animate-pulse');
       } else {
          el.style.width = '14px';
          el.style.height = '14px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#0ea5e9';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 0 10px rgba(14,165,233,0.5)';
       }
       
       new mapboxgl.Marker(el)
         .setLngLat([m.position[1], m.position[0]])
         .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div class="font-black text-xs uppercase tracking-widest p-1">${m.label}</div>`))
         .addTo(mapRef.current!);
    });

    // Add nearby SOS from mesh with extreme pulse
    nearbySOS.forEach(sos => {
       const el = document.createElement('div');
       el.style.width = '30px';
       el.style.height = '30px';
       el.style.borderRadius = '50%';
       el.style.backgroundColor = 'rgba(239, 68, 68, 0.4)';
       el.style.border = '2px solid #ef4444';
       el.classList.add('animate-ping');
       
       new mapboxgl.Marker(el)
         .setLngLat([sos.lon, sos.lat])
         .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<b>🚨 SOS ALERT #${sos.id.slice(-4)}</b>`))
         .addTo(mapRef.current!);
    });

  }, [markers, nearbySOS, isLoaded]);

  return (
    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 glass-dark shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Offline Status */}
      {!navigator.onLine && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-50">
            Offline Mode: Using Cached Tiles
         </div>
      )}
    </div>
  );
};

export default MarineMapBox;
