import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { Coordinates } from '../types';

interface LocationPickerMapProps {
  initialLocation: Coordinates;
  onLocationSelect: (coords: Coordinates) => void;
  height?: string;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLocation,
  onLocationSelect,
  height = '240px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [initialLocation.lat, initialLocation.lng],
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Icon
      const markerHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #4f46e5; color: white; border-radius: 9999px; padding: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div style="background: #1e1b4b; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px; margin-top: 2px; white-space: nowrap;">
            Shop Location
          </div>
        </div>
      `;

      const customPin = L.divIcon({
        className: 'location-picker-pin',
        html: markerHtml,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
      });

      const marker = L.marker([initialLocation.lat, initialLocation.lng], {
        icon: customPin,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        onLocationSelect({ lat: pos.lat, lng: pos.lng });
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position if initialLocation updates from outside
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([initialLocation.lat, initialLocation.lng]);
      mapInstanceRef.current.setView([initialLocation.lat, initialLocation.lng], 13);
    }
  }, [initialLocation.lat, initialLocation.lng]);

  const handleUseCurrentLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onLocationSelect(coords);
        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([coords.lat, coords.lng]);
          mapInstanceRef.current.setView([coords.lat, coords.lng], 14);
        }
      });
    }
  };

  return (
    <div className="isolate relative rounded-2xl overflow-hidden border border-slate-200">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      <div className="absolute top-2 right-2 z-[10]">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <Navigation className="w-3 h-3 text-indigo-600" />
          <span>My Current GPS</span>
        </button>
      </div>
      <div className="absolute bottom-2 left-2 z-[10] bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-lg">
        Click or drag pin to set shop location
      </div>
    </div>
  );
};
