import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Star,
  Phone,
  MessageCircle,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { ProviderProfile, Coordinates } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { setFilter, setUserLocation } from '../store/slices/providerSlice';

interface ProviderMapProps {
  providers: ProviderProfile[];
  onSelectProvider: (provider: ProviderProfile) => void;
  onContactProvider: (provider: ProviderProfile, type: 'call' | 'whatsapp') => void;
  height?: string;
}

export const ProviderMap: React.FC<ProviderMapProps> = ({
  providers,
  onSelectProvider,
  onContactProvider,
  height = '580px',
}) => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.providers);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [filters.userLocation.lat, filters.userLocation.lng],
        zoom: filters.maxDistanceKm > 0 ? (filters.maxDistanceKm <= 10 ? 13 : 11) : 12,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
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

  // Sync Center, Radius Circle and Provider Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    // Clear previous markers
    markersLayerRef.current.clearLayers();

    // Center map on user location
    map.setView(
      [filters.userLocation.lat, filters.userLocation.lng],
      filters.maxDistanceKm === 10 ? 13 : filters.maxDistanceKm === 25 ? 11 : filters.maxDistanceKm === 50 ? 10 : 12,
      { animate: true }
    );

    // Draw / Update Radius Circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (filters.maxDistanceKm > 0) {
      radiusCircleRef.current = L.circle(
        [filters.userLocation.lat, filters.userLocation.lng],
        {
          radius: filters.maxDistanceKm * 1000, // convert km to meters
          color: '#4f46e5',
          fillColor: '#6366f1',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '4, 8',
        }
      ).addTo(map);
    }

    // Add User Center Marker
    const userMarkerHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(99, 102, 241, 0.25); border-radius: 9999px; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 22px; height: 22px; background-color: #4f46e5; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: userMarkerHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker([filters.userLocation.lat, filters.userLocation.lng], { icon: userIcon })
      .bindTooltip('Your Current Search Location', { direction: 'top', offset: [0, -10] })
      .addTo(markersLayerRef.current);

    // Add Provider Markers
    providers.forEach((provider) => {
      if (!provider.location) return;

      const providerMarkerHtml = `
        <div class="group relative cursor-pointer" style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 44px; height: 44px; border-radius: 14px; background: #ffffff; border: 2.5px solid #4f46e5; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.18); overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <img src="${provider.avatarUrl}" alt="${provider.businessName}" onerror="this.onerror=null; this.src='https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(provider.businessName)}'" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="margin-top: -6px; background: #1e1b4b; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap;">
            ₹${provider.pricingStartsAt}
          </div>
        </div>
      `;

      const providerIcon = L.divIcon({
        className: 'custom-provider-marker',
        html: providerMarkerHtml,
        iconSize: [44, 54],
        iconAnchor: [22, 54],
      });

      const marker = L.marker([provider.location.lat, provider.location.lng], {
        icon: providerIcon,
      });

      // Custom Leaflet Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'w-64 p-4 text-slate-800 bg-white font-sans';
      popupDiv.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${provider.avatarUrl}" alt="${provider.businessName}" onerror="this.onerror=null; this.src='https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(provider.businessName)}'" class="w-12 h-12 rounded-xl object-cover border border-slate-200" />
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-sm text-slate-900 truncate">${provider.businessName}</h4>
            <span class="inline-block text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5">${provider.category}</span>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
          <div class="flex items-center gap-1 font-bold text-amber-500">
            <span>★</span>
            <span>${provider.rating.toFixed(1)}</span>
            <span class="text-slate-400 font-normal">(${provider.reviewCount})</span>
          </div>
          <div class="text-xs font-bold text-indigo-600">
            ${provider.distanceKm !== undefined ? `${provider.distanceKm} km away` : provider.area}
          </div>
        </div>

        <div class="mt-3 flex gap-2">
          <button id="popup-view-${provider._id}" class="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors text-center">
            View Card
          </button>
          <button id="popup-call-${provider._id}" class="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors text-center">
            ${isAuthenticated ? 'Call Pro' : 'Login'}
          </button>
        </div>
      `;

      // Attach event listeners after popup open
      marker.bindPopup(popupDiv, { maxWidth: 280 });
      marker.on('popupopen', () => {
        const viewBtn = document.getElementById(`popup-view-${provider._id}`);
        const callBtn = document.getElementById(`popup-call-${provider._id}`);

        if (viewBtn) {
          viewBtn.onclick = () => onSelectProvider(provider);
        }
        if (callBtn) {
          callBtn.onclick = () => onContactProvider(provider, 'call');
        }
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [providers, filters.userLocation, filters.maxDistanceKm, isAuthenticated]);

  // Handle "Locate Me" GPS trigger
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          dispatch(setUserLocation(userCoords));
        },
        (error) => {
          console.warn('Geolocation access failed or denied:', error.message);
          // Default to Bangalore
          dispatch(setUserLocation({ lat: 12.9716, lng: 77.5946 }));
        }
      );
    }
  };

  return (
    <div className="isolate relative rounded-3xl overflow-hidden border border-slate-200 shadow-md">
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Top Floating Radius & Geolocation Toolbar */}
      <div className="absolute top-4 inset-x-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Radius Filter Pills */}
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-1 text-xs font-bold">
          <span className="text-slate-400 px-2 flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-indigo-600" /> Radius:
          </span>
          {[
            { label: 'All', value: 0 },
            { label: '10 km', value: 10 },
            { label: '25 km', value: 25 },
            { label: '50 km', value: 50 },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => dispatch(setFilter({ maxDistanceKm: r.value }))}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filters.maxDistanceKm === r.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Locate Me Button */}
        <button
          onClick={handleLocateMe}
          className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-slate-50 transition-all pointer-events-auto flex items-center gap-1.5"
          title="Use my current GPS location"
        >
          <Navigation className="w-3.5 h-3.5 text-indigo-600" />
          <span>My GPS Location</span>
        </button>
      </div>

      {/* Bottom Info Banner */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-lg text-xs font-semibold flex items-center gap-2">
        <MapPin className="w-4 h-4 text-emerald-400" />
        <span>
          Showing <strong>{providers.length}</strong> service pros on map
        </span>
      </div>
    </div>
  );
};
