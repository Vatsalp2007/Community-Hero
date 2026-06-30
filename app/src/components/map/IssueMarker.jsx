import React from 'react';
import { Marker } from '@react-google-maps/api';

const STATUS_COLORS = {
  critical: { fill: '#DC2626', stroke: '#FFFFFF' },
  open: { fill: '#2563EB', stroke: '#FFFFFF' },
  reported: { fill: '#2563EB', stroke: '#FFFFFF' },
  verified: { fill: '#9333EA', stroke: '#FFFFFF' },
  assigned: { fill: '#EA580C', stroke: '#FFFFFF' },
  in_progress: { fill: '#EA580C', stroke: '#FFFFFF' },
  resolved: { fill: '#16A34A', stroke: '#FFFFFF' },
  rejected: { fill: '#6B7280', stroke: '#FFFFFF' },
};

const dropPinPath = 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.1 17.7-30.6C17.7-40.2 9.8-48 0-48z';

export default function IssueMarker({ issue, onClick, onLoad }) {
  if (!issue.location) return null;

  const position = issue.location.latitude
    ? { lat: issue.location.latitude, lng: issue.location.longitude }
    : { lat: issue.location.lat, lng: issue.location.lng };

  const colors = STATUS_COLORS[issue.status] || STATUS_COLORS.open;

  const icon = {
    path: dropPinPath,
    fillColor: colors.fill,
    fillOpacity: 1,
    strokeColor: colors.stroke,
    strokeWeight: 2.5,
    scale: 0.9,
    anchor: new google.maps.Point(0, 0),
    labelOrigin: new google.maps.Point(0, -28),
  };

  return (
    <Marker
      position={position}
      onClick={() => onClick?.(issue)}
      icon={icon}
      animation={google.maps.Animation.DROP}
      onLoad={onLoad}
      label={{
        text: issue.severity >= 4 ? '!' : '',
        color: '#FFFFFF',
        fontSize: '13px',
        fontWeight: 'bold',
      }}
    />
  );
}
