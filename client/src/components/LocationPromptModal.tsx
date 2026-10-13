import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  Compass,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setLocationGranted,
  setLocationDenied,
  setDistrict,
} from '../store/slices/providerSlice';
import { DISTRICTS, findNearestDistrict } from '../utils/geo';

interface LocationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationPromptModal: React.FC<LocationPromptModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.providers);

  const [loadingGps, setLoadingGps] = useState(false);
  const [deniedState, setDeniedState] = useState(
    filters.locationPermissionStatus === 'denied'
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    filters.detectedDistrict || 'Bangalore'
  );

  const handleRequestLocation = () => {
    setLoadingGps(true);

    if (!('geolocation' in navigator)) {
      setDeniedState(true);
      setLoadingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const district = findNearestDistrict(coords);
        dispatch(setLocationGranted({ coords, district }));
        setLoadingGps(false);
        onClose();
      },
      (error) => {
        console.warn('Geolocation error / permission denied:', error.message);
        // Switch to District selection fallback
        setDeniedState(true);
        setLoadingGps(false);
        dispatch(setLocationDenied({ fallbackDistrict: selectedDistrict }));
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectDistrictAndConfirm = (district: string) => {
    setSelectedDistrict(district);
    dispatch(setLocationDenied({ fallbackDistrict: district }));
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Local Pro Discovery</h3>
              <p className="text-[11px] text-indigo-200">Hyper-local 50km service radius</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!deniedState ? (
            <>
              {/* Permission Request State */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Navigation className="w-7 h-7 text-indigo-600 animate-pulse" />
                </div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  Allow Location Access
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Allow access so LocalMate can load verified electricians, mechanics, and cleaning pros{' '}
                  <strong className="text-slate-800">within 50 km</strong> of your current location.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleRequestLocation}
                  disabled={loadingGps}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait"
                >
                  {loadingGps ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span>{loadingGps ? 'Detecting 50km GPS Location...' : 'Allow GPS Location (Within 50km)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeniedState(true)}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors"
                >
                  Choose My District / City Manually
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Fallback District Selection State */}
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-950">
                      Location Permission Denied or Not Shared
                    </span>
                    <span>
                      No problem! Please select your district to load top-rated local service provider profiles.
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Select Your District / City:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DISTRICTS.map((district) => (
                      <button
                        key={district}
                        type="button"
                        onClick={() => setSelectedDistrict(district)}
                        className={`p-3 text-xs font-bold rounded-xl border flex items-center justify-between transition-all ${
                          selectedDistrict === district
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{district} District</span>
                        </span>
                        {selectedDistrict === district && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelectDistrictAndConfirm(selectedDistrict)}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-600/25 transition-all"
                >
                  Show Providers in {selectedDistrict}
                </button>

                <button
                  type="button"
                  onClick={handleRequestLocation}
                  className="w-full py-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Try GPS Location Again
                </button>
              </div>
            </>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Your location is only used to calculate proximity with service pros</span>
          </div>
        </div>
      </div>
    </div>
  );
};
