import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, InfoWindow, Marker } from '@react-google-maps/api';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { MAP_CENTER_DEFAULT, MAP_ZOOM_DEFAULT } from '@shared/constants.js';
import IssueMarker from './IssueMarker';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '@shared/config.js';

const mapContainerStyle = { width: '100%', height: '100%' };

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

export default function IssueMap({ center, filters = {}, userLocation, onMapLoad, onZoomChange }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: APP_CONFIG.googleMapsApiKey,
  });
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [map, setMap] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let q = collection(db, 'issues');
    const constraints = [];
    if (filters.category) constraints.push(where('category', '==', filters.category));
    if (filters.status) constraints.push(where('status', '==', filters.status));
    if (constraints.length > 0) q = query(q, ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [filters.category, filters.status]);

  const handleLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    onMapLoad?.(mapInstance);
  }, [onMapLoad]);

  if (!isLoaded) return <div className="h-full bg-slate-900 animate-pulse" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center || MAP_CENTER_DEFAULT}
      zoom={MAP_ZOOM_DEFAULT}
      onLoad={handleLoad}
      options={{
        styles: darkMapStyles,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        backgroundColor: '#0f172a',
        disableDefaultUI: true,
        clickableIcons: false,
      }}
    >
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
      {userLocation && (
        <Marker
          position={{ lat: userLocation.lat, lng: userLocation.lng }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          }}
          zIndex={999}
        />
      )}

      {issues.map((issue) => (
        <IssueMarker
          key={issue.id}
          issue={issue}
          onClick={(i) => setSelectedIssue(i)}
        />
      ))}

      {selectedIssue && (
        <InfoWindow
          position={
            selectedIssue.location.latitude
              ? { lat: selectedIssue.location.latitude, lng: selectedIssue.location.longitude }
              : { lat: selectedIssue.location.lat, lng: selectedIssue.location.lng }
          }
          onCloseClick={() => setSelectedIssue(null)}
          options={{
            pixelOffset: new google.maps.Size(0, -35),
            disableAutoPan: false,
          }}
        >
          <div
            className="p-3 max-w-[260px] cursor-pointer"
            onClick={() => { setSelectedIssue(null); navigate(`/issues/${selectedIssue.id}`); }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                selectedIssue.status === 'critical' ? 'bg-red-400/20 text-red-300' :
                selectedIssue.status === 'resolved' ? 'bg-green-400/20 text-green-300' :
                selectedIssue.status === 'assigned' || selectedIssue.status === 'in_progress' ? 'bg-orange-400/20 text-orange-300' :
                'bg-blue-400/20 text-blue-300'
              }`}>
                {selectedIssue.status === 'in_progress' ? 'In Progress' : selectedIssue.status}
              </span>
            </div>
            <h3 className="font-semibold text-sm text-white/90 mb-1">{selectedIssue.title}</h3>
            <p className="text-xs text-white/50 line-clamp-1">{selectedIssue.address || ''}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
