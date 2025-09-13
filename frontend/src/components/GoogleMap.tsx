import React, { useEffect, useRef, useState } from 'react';

interface Place {
  id: number;
  name: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
}

interface GoogleMapProps {
  places: Place[];
  center: { lat: number; lng: number };
  radius: number;
  isLoading: boolean;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({ places, center, radius, isLoading }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      console.log('Google Maps API Key:', process.env.NEXT_PUBLIC_GMAP_API_KEY);
      
      if (window.google) {
        console.log('Google Maps already loaded');
        setMapLoaded(true);
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already exists');
        setMapLoaded(true);
        return;
      }

      if (!process.env.NEXT_PUBLIC_GMAP_API_KEY) {
        console.error('Google Maps API key not found');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GMAP_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Maps script loaded successfully');
        setMapLoaded(true);
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };

      console.log('Loading Google Maps script...');
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    const cleanup = loadGoogleMaps();
    return cleanup;
  }, []);

  // Initialize map
  useEffect(() => {
    console.log('Map initialization check:', { mapLoaded, hasMapRef: !!mapRef.current, hasGoogle: !!window.google });
    
    if (!mapLoaded || !mapRef.current || !window.google) return;

    const initMap = () => {
      if (mapInstanceRef.current) {
        console.log('Map already initialized');
        return;
      }

      console.log('Initializing Google Map...');
      try {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          center: center,
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        console.log('Google Map initialized successfully');

        // Add radius circle
        if (radius > 0) {
          new window.google.maps.Circle({
            strokeColor: '#3B82F6',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            map: mapInstanceRef.current,
            center: center,
            radius: radius * 1000 // Convert km to meters
          });
        }
      } catch (error) {
        console.error('Error initializing Google Map:', error);
      }
    };

    initMap();
  }, [mapLoaded, center, radius]);

  // Update markers when places change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    places.forEach((place, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: mapInstanceRef.current,
        title: place.name,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px'
        },
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <text x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${index + 1}</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${place.name}</h3>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${place.city}, ${place.province}</p>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px;">${place.category}</p>
            <p style="margin: 0 0 8px 0; color: #374151; font-size: 13px; line-height: 1.4;">${place.description}</p>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <a href="https://www.google.com/maps?q=${place.latitude},${place.longitude}" 
                 target="_blank" 
                 style="background: #3B82F6; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                📍 Buka di Maps
              </a>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (places.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach(place => {
        bounds.extend({ lat: place.latitude, lng: place.longitude });
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [places]);

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        minHeight: '24rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{
            display: 'inline-block',
            width: '3rem',
            height: '3rem',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Memuat peta...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        minHeight: '24rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
          <p style={{ color: '#6b7280' }}>Memuat Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🗺️ Peta Lokasi
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Klik marker untuk melihat detail tempat
        </p>
      </div>
      <div style={{ padding: 0 }}>
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '24rem',
            minHeight: '400px'
          }}
        />
      </div>
    </div>
  );
};

export default GoogleMap;
