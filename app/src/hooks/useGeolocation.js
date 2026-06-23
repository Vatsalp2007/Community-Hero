import { useState } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermission = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          const data = await response.json();
          if (data.results?.[0]) {
            setAddress(data.results[0].formatted_address);
          }
        } catch (e) {
          setAddress('Location detected');
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        setLocation({ lat: 23.0225, lng: 72.5714 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { location, address, loading, error, requestPermission };
}
