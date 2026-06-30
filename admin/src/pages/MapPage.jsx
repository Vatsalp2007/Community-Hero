import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { ISSUE_CATEGORIES, MAP_CENTER_DEFAULT } from '@shared/constants.js';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '@shared/config.js';

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0f172a' }],
  },
];

const getMarkerColor = (severity) => {
  if (severity >= 5) return '#DC2626';
  if (severity >= 4) return '#EA580C';
  if (severity >= 3) return '#D97706';
  return '#16A34A';
};

export default function MapPage() {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: APP_CONFIG.googleMapsApiKey });
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [mapType, setMapType] = useState('map');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'issues'), (snap) => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const filtered = filter === 'all' ? issues : issues.filter(i => i.category === filter);

  const criticalCount = filtered.filter(i => i.severity >= 5).length;
  const activeCount = filtered.filter(i => ['open', 'verified', 'in_progress'].includes(i.status)).length;
  const resolvedCount = filtered.filter(i => i.status === 'resolved').length;

  if (!isLoaded) return <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl" />;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Dark GMaps InfoWindow styles */}
      <style>{`
        .gm-style-iw {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
        }
        .gm-style-iw-d {
          overflow: hidden !important;
          border-radius: 12px !important;
        }
        .gm-style-iw-c {
          padding: 0 !important;
          border-radius: 12px !important;
          background: rgba(255,255,255,0.15) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
        }
        .gm-style-iw-t::after {
          background: rgba(255,255,255,0.15) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          box-shadow: none !important;
        }
        .gm-ui-hover-effect {
          top: 6px !important;
          right: 6px !important;
        }
        .gm-ui-hover-effect img {
          filter: brightness(0) invert(1) !important;
          opacity: 0.6 !important;
        }
      `}</style>
      {/* Background Map */}
      <div className="absolute inset-0">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={MAP_CENTER_DEFAULT}
          zoom={12}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: mapType === 'satellite' ? 'satellite' : 'roadmap',
            styles: mapType === 'satellite' ? [] : darkMapStyles,
          }}
        >
          {filtered.filter(i => i.location).map(issue => {
            const pos = issue.location.latitude
              ? { lat: issue.location.latitude, lng: issue.location.longitude }
              : { lat: issue.location.lat, lng: issue.location.lng };
            return (
              <Marker
                key={issue.id}
                position={pos}
                onClick={() => setSelected(issue)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: getMarkerColor(issue.severity),
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                }}
              />
            );
          })}
          {selected && selected.location && (
            <InfoWindow
              position={
                selected.location.latitude
                  ? { lat: selected.location.latitude, lng: selected.location.longitude }
                  : { lat: selected.location.lat, lng: selected.location.lng }
              }
              onCloseClick={() => setSelected(null)}
            >
              <div className="px-3 py-2 max-w-[220px] cursor-pointer" onClick={() => navigate(`/issues/${selected.id}`)}>
                <p className="font-semibold text-sm text-white/90">{selected.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{ISSUE_CATEGORIES[selected.category]?.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{selected.address || ''}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Top Filter Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-[90vw] md:max-w-[800px] px-6">
        <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 whitespace-nowrap ${filter === 'all' ? 'bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white' : 'text-white/70 hover:bg-white/10 border border-white/10'}`}
          >
            All
          </button>
          {Object.entries(ISSUE_CATEGORIES).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 whitespace-nowrap ${filter === k ? 'bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white' : 'text-white/70 hover:bg-white/10 border border-white/10'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-24 left-6 z-10 flex flex-col gap-3">
        <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-1 rounded-xl shadow-md flex flex-col">
          <button className="p-3 text-white/70 hover:text-white transition-colors border-b border-white/10 material-symbols-outlined cursor-pointer">add</button>
          <button className="p-3 text-white/70 hover:text-white transition-colors material-symbols-outlined cursor-pointer">remove</button>
        </div>
        <button className="bg-white/20 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-md text-white/70 hover:text-white transition-colors material-symbols-outlined cursor-pointer">my_location</button>
      </div>

      {/* Layer Selector */}
      <div className="absolute top-24 right-6 z-10">
        <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-1 rounded-xl shadow-md flex gap-1">
          <button
            onClick={() => setMapType('map')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all cursor-pointer ${mapType === 'map' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined text-sm">map</span> Map
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all cursor-pointer ${mapType === 'satellite' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>layers</span> Satellite
          </button>
        </div>
      </div>

      {/* Bottom Stats Card */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-[90vw] md:max-w-[600px] px-6">
        <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Area Status</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-cyan-300">84.2</span>
              <span className="text-sm text-amber-400 pb-1 flex items-center">
                <span className="material-symbols-outlined text-sm">trending_up</span> +2.4%
              </span>
            </div>
            <p className="text-sm text-white/50">Civic Health Score</p>
          </div>
          <div className="h-12 w-px bg-white/10 hidden md:block" />
          <div className="flex-1 grid grid-cols-3 gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
              <span className="text-sm font-semibold text-white/80 whitespace-nowrap">{criticalCount} Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
              <span className="text-sm font-semibold text-white/80 whitespace-nowrap">{activeCount} Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/30 shrink-0" />
              <span className="text-sm font-semibold text-white/80 whitespace-nowrap">{resolvedCount} Resolved</span>
            </div>
          </div>
          <button className="p-3 bg-white/10 text-white/70 rounded-2xl hover:bg-gradient-to-r hover:from-[#1A56DB] hover:to-[#06B6D4] hover:text-white transition-all material-symbols-outlined shrink-0 cursor-pointer">fullscreen</button>
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white shadow-xl flex items-center justify-center z-50 active:scale-95 transition-transform cursor-pointer">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
