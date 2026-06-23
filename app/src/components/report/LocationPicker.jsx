import React, { useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 23.0225, lng: 72.5714 };

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#475569' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
];

export default function LocationPicker({ location, onLocationChange, address }) {
  const mapRef = useRef(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const mapCenter = location || defaultCenter;

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onIdle = useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      onLocationChange({ lat: center.lat(), lng: center.lng() });
    }
  }, [onLocationChange]);

  if (!isLoaded) return <div className="h-[300px] bg-white/10 rounded-2xl animate-pulse" />;

  return (
    <div className="relative w-full h-full">
      <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          onLoad={onLoad}
          onIdle={onIdle}
          options={{ streetViewControl: false, mapTypeControl: false, zoomControl: false, draggableCursor: 'grab', styles: darkMapStyles }}
        />

      {/* Fixed center pin */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
        <div className="relative">
          <svg width="36" height="48" viewBox="0 0 36 48" className="drop-shadow-lg">
            <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0zm0 27a9 9 0 110-18 9 9 0 010 18z" fill="#1A56DB" stroke="white" strokeWidth="2"/>
            <circle cx="18" cy="18" r="4" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl pointer-events-none">
        <MapPin size={14} className="text-cyan-300 shrink-0" />
        <span className="text-xs text-white/80 truncate">{address || 'Move the map to set location'}</span>
      </div>
    </div>
  );
}
