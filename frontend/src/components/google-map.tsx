import React, { useEffect, useRef, useState } from "react";

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
  }
}

// Helper: load Google Maps script only once
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      resolve();
      return;
    }
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject());
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  places,
  center,
  radius,
  isLoading,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps script only once per app
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GMAP_API_KEY;
    if (!apiKey) {
      // eslint-disable-next-line no-console
      console.error("Google Maps API key not found");
      return;
    }
    loadGoogleMapsScript(apiKey)
      .then(() => setMapLoaded(true))
      .catch(() => {
        // eslint-disable-next-line no-console
        console.error("Failed to load Google Maps script");
      });
  }, []);

  // Initialize map or update center/radius
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google || !window.google.maps) return;

    // Only create map once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: center,
        mapTypeId: "roadmap",
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
    } else {
      // Update center if map already exists
      mapInstanceRef.current.setCenter(center);
    }

    // Remove old circle if exists
    if (mapInstanceRef.current._circle) {
      mapInstanceRef.current._circle.setMap(null);
    }
    // Draw radius circle if radius > 0
    if (radius > 0) {
      mapInstanceRef.current._circle = new window.google.maps.Circle({
        strokeColor: "#3B82F6",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3B82F6",
        fillOpacity: 0.1,
        map: mapInstanceRef.current,
        center: center,
        radius: radius * 1000,
      });
    }
  }, [mapLoaded, center, radius]);

  // Update markers when places change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    if (places.length > 0) {
      places.forEach((place, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: place.latitude, lng: place.longitude },
          map: mapInstanceRef.current,
          title: place.name,
          label: {
            text: (index + 1).toString(),
            color: "white",
            fontWeight: "bold",
            fontSize: "12px",
          },
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="2"/>
                <text x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${index + 1}</text>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20),
          },
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
                  Open in Maps
                </a>
              </div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
      });

      // Fit map to show all markers
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach((place) => {
        bounds.extend({ lat: place.latitude, lng: place.longitude });
      });
      mapInstanceRef.current.fitBounds(bounds);
    }

    // Debug log
    // console.log("Markers updated", { places, markersCount: markersRef.current.length, mapLoaded});
  }, [places, mapLoaded]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-xl shadow border border-gray-200 flex items-center justify-center min-h-[24rem]">
        <div>
          <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  // Map not loaded state
  if (!mapLoaded) {
    return (
      <div className="bg-white p-12 rounded-xl shadow border border-gray-200 flex items-center justify-center min-h-[24rem]">
        <div>
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-gray-500">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  // Main map container
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-1 text-slate-800 flex items-center gap-2">
          🗺️ Location Map
        </h2>
        <p className="text-gray-500 text-sm">Click a marker to see place details</p>
      </div>
      <div>
        <div
          ref={mapRef}
          className="w-full"
          style={{ height: "24rem", minHeight: 400 }}
        />
      </div>
    </div>
  );
};

export default GoogleMap;
