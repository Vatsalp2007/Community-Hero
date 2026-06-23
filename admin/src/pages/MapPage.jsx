import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { ISSUE_CATEGORIES, MAP_CENTER_DEFAULT } from '@shared/constants.js';
import { useNavigate } from 'react-router-dom';

const getMarkerColor = (severity) => {
  if (severity >= 5) return '#DC2626';
  if (severity >= 4) return '#EA580C';
  if (severity >= 3) return '#D97706';
  return '#16A34A';
};

export default function MapPage() {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });
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

  if (!isLoaded) return <div className="h-full w-full bg-surface-container/50 animate-pulse rounded-2xl" />;

  return (
    <div className="relative w-full h-full overflow-hidden">
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
              <div className="p-1 max-w-[200px] cursor-pointer" onClick={() => navigate(`/issues/${selected.id}`)}>
                <p className="font-semibold text-sm text-on-surface">{selected.title}</p>
                <p className="text-xs text-on-surface-variant">{ISSUE_CATEGORIES[selected.category]?.label}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Top Filter Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-[90vw] md:max-w-[800px] px-6">
        <div className="glass-panel p-2 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 whitespace-nowrap ${filter === 'all' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-variant/40 border border-outline-variant/30'}`}
          >
            All
          </button>
          {Object.entries(ISSUE_CATEGORIES).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 whitespace-nowrap ${filter === k ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-variant/40 border border-outline-variant/30'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-24 left-6 z-10 flex flex-col gap-3">
        <div className="glass-panel p-1 rounded-xl shadow-md flex flex-col">
          <button className="p-3 text-on-surface-variant hover:text-primary transition-colors border-b border-outline-variant/20 material-symbols-outlined">add</button>
          <button className="p-3 text-on-surface-variant hover:text-primary transition-colors material-symbols-outlined">remove</button>
        </div>
        <button className="glass-panel p-3 rounded-xl shadow-md text-on-surface-variant hover:text-primary transition-colors material-symbols-outlined">my_location</button>
      </div>

      {/* Layer Selector */}
      <div className="absolute top-24 right-6 z-10">
        <div className="glass-panel p-1 rounded-xl shadow-md flex gap-1">
          <button
            onClick={() => setMapType('map')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${mapType === 'map' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-variant/40'}`}
          >
            <span className="material-symbols-outlined text-sm">map</span> Map
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${mapType === 'satellite' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-variant/40'}`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>layers</span> Satellite
          </button>
        </div>
      </div>

      {/* Bottom Stats Card */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-[90vw] md:max-w-[600px] px-6">
        <div className="glass-panel p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Area Status</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary">84.2</span>
              <span className="text-sm text-secondary pb-1 flex items-center">
                <span className="material-symbols-outlined text-sm">trending_up</span> +2.4%
              </span>
            </div>
            <p className="text-sm text-on-surface-variant">Civic Health Score</p>
          </div>
          <div className="h-12 w-px bg-outline-variant/30 hidden md:block" />
          <div className="flex-1 grid grid-cols-3 gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error shrink-0" />
              <span className="text-sm font-semibold whitespace-nowrap">{criticalCount} Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary shrink-0" />
              <span className="text-sm font-semibold whitespace-nowrap">{activeCount} Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-outline shrink-0" />
              <span className="text-sm font-semibold whitespace-nowrap">{resolvedCount} Resolved</span>
            </div>
          </div>
          <button className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all material-symbols-outlined shrink-0">fullscreen</button>
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center z-50 active:scale-95 transition-transform">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
