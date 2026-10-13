import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Clock,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Crosshair,
  Compass,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setFilter, setLocationGranted } from '../store/slices/providerSlice';
import { CategoryBar } from '../components/CategoryBar';
import { VisitingCard } from '../components/VisitingCard';
import { VisitingCardSkeleton } from '../components/VisitingCardSkeleton';
import { ProviderMap } from '../components/ProviderMap';
import { ProviderProfile } from '../types';
import { DISTRICTS, CITY_COORDINATES, findNearestDistrict } from '../utils/geo';

interface HomePageProps {
  onSelectProvider: (provider: ProviderProfile) => void;
  onContactProvider: (provider: ProviderProfile, type: 'call' | 'whatsapp') => void;
  onOpenAuth: (mode?: 'login' | 'register_customer' | 'register_provider') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProvider,
  onContactProvider,
  onOpenAuth,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { filteredProviders, filters, isLoading } = useAppSelector((state) => state.providers);

  const [heroSearch, setHeroSearch] = useState('');
  const [heroCity, setHeroCity] = useState(filters.city);
  const [detectingGps, setDetectingGps] = useState(false);

  // Sync heroCity with redux filters
  useEffect(() => {
    setHeroCity(filters.city);
  }, [filters.city]);

  const handleCityChange = (newCity: string) => {
    if (newCity === 'gps') {
      handleDetectGps();
      return;
    }

    setHeroCity(newCity);
    dispatch(
      setFilter({
        city: newCity,
        locationPermissionStatus: newCity === 'All' ? 'prompt' : 'denied',
        maxDistanceKm: 0,
      })
    );
  };

  const handleDetectGps = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser. Please select a city manually.');
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const district = findNearestDistrict(coords);
        localStorage.setItem('localmate_loc_status', 'granted');
        dispatch(setLocationGranted({ coords, district }));
        setHeroCity(district);
      },
      (err) => {
        setDetectingGps(false);
        console.warn('Geolocation permission not granted:', err.message);
        dispatch(setFilter({ city: 'Bangalore', locationPermissionStatus: 'denied', maxDistanceKm: 0 }));
      },
      { timeout: 7000 }
    );
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilter({ searchQuery: heroSearch, city: heroCity }));
    navigate('/explore');
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12 mt-4 shadow-2xl">
        {/* Glow & background patterns */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hyper-Local Service Professionals At Your Fingertips</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Connect Directly with Trusted{' '}
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">
              Local Service Pros
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Need an electrician, AC repair, plumber, or deep cleaning? Browse digital visiting cards, check verified rates, and call or WhatsApp directly—no middleman, no hidden commission.
          </p>

          {/* Hero Search Box with City Selector */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2 text-slate-800"
            >
              {/* City & GPS Selector */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 sm:bg-transparent rounded-xl sm:border-r border-slate-200 text-xs font-semibold shrink-0">
                {filters.locationPermissionStatus === 'granted' ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                )}

                <select
                  value={filters.locationPermissionStatus === 'granted' ? 'gps' : heroCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="gps">📍 Live 50km GPS Mode</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Delhi">Delhi</option>
                  <option value="All">All Cities</option>
                </select>

                <button
                  type="button"
                  onClick={handleDetectGps}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition-colors ml-0.5"
                  title="Detect My Current GPS Location"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
              </div>

              {/* Keyword Input */}
              <div className="flex-1 flex items-center px-3 py-1">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="What service do you need? (e.g., Electrician, AC repair...)"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Search CTA */}
              <button
                type="submit"
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102 flex items-center justify-center gap-2 shrink-0"
              >
                <span>Find Pros</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {detectingGps && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300 animate-pulse pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Detecting GPS coordinates & finding nearest district within 50km...</span>
              </div>
            )}

            {/* Quick City Selection Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <span className="text-indigo-300 font-semibold text-[11px] mr-1">Choose Location:</span>

              <button
                type="button"
                onClick={handleDetectGps}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filters.locationPermissionStatus === 'granted'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/15'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filters.locationPermissionStatus === 'granted' ? 'bg-white animate-ping' : 'bg-emerald-400'}`} />
                <span>50km GPS</span>
              </button>

              {DISTRICTS.map((d) => {
                const isActive = filters.locationPermissionStatus !== 'granted' && heroCity === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleCityChange(d)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                        : 'bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/15'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleCityChange('All')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filters.locationPermissionStatus !== 'granted' && heroCity === 'All'
                    ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                    : 'bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/15'
                }`}
              >
                All Cities
              </button>
            </div>
          </div>

          {/* Value props pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-indigo-200/90 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Police & ID Verified
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-amber-400" /> Direct 1-Tap Calling
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" /> Same-Day Availability
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Category Horizontal Filter Bar */}
        <CategoryBar />

        {/* Featured Service Providers - Visiting Cards Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Top Rated Visiting Cards in Your Area
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tap on any card to view detailed rates or directly call the professional.
              </p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <span>View All Pros</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Loading verified service providers from server...</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <VisitingCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : filteredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.slice(0, 6).map((provider) => (
                <VisitingCard
                  key={provider._id}
                  provider={provider}
                  onSelect={onSelectProvider}
                  onContact={onContactProvider}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No service pros found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active professionals found for this filter. Try selecting "All Cities" or switching to Live GPS mode.
              </p>
              <button
                onClick={() => handleCityChange('All')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-700 transition-colors"
              >
                Show All Cities
              </button>
            </div>
          )}
        </section>

        {/* Leaflet Live Map Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Leaflet Interactive Radar</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Find Service Pros Around You (10km / 50km Radius)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Click any avatar pin on the map to see visiting card details, distance, and direct contact options.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-[460px] bg-slate-100 rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-500 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <div className="text-sm font-bold text-slate-700">Loading Radar & Geocoded Pros...</div>
              <p className="text-xs text-slate-400">Plotting live locations on interactive map</p>
            </div>
          ) : (
            <ProviderMap
              providers={filteredProviders}
              onSelectProvider={onSelectProvider}
              onContactProvider={onContactProvider}
              height="460px"
            />
          )}
        </section>

        {/* How LocalMate Works Section */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              How LocalMate Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Simple, transparent, and direct—designed for fast local help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto font-extrabold text-base">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Find Your Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose your trade—electrician, AC mechanic, plumber, or cleaning pro in your specific area.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto font-extrabold text-base">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">Inspect Visiting Card</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review verified licenses, standard service price lists, customer star ratings, and real experience.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto font-extrabold text-base">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Call or WhatsApp Directly</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect instantly with the pro. No booking commissions or wait time—deal directly!
              </p>
            </div>
          </div>
        </section>

        {/* Join as Pro CTA */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">
              Are You an Electrician, AC Mechanic, or Local Pro?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
              Create your free digital visiting card today. Get direct customer phone calls and WhatsApp inquiries with zero commission.
            </p>
          </div>
          <button
            onClick={() => onOpenAuth('register_provider')}
            className="shrink-0 px-6 py-3 bg-white hover:bg-slate-100 text-indigo-900 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
          >
            Create Your Pro Card Free
          </button>
        </section>
      </div>
    </div>
  );
};
