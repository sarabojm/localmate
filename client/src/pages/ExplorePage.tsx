import React, { useState, useEffect, useRef } from 'react';
import {
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
  MapPin,
  Navigation,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setFilter, resetFilters, setViewMode } from '../store/slices/providerSlice';
import { VisitingCard } from '../components/VisitingCard';
import { VisitingCardSkeleton } from '../components/VisitingCardSkeleton';
import { ProviderMap } from '../components/ProviderMap';
import { Pagination } from '../components/Pagination';
import { ProviderProfile } from '../types';
import { CATEGORIES } from '../data/mockData';

interface ExplorePageProps {
  onSelectProvider: (provider: ProviderProfile) => void;
  onContactProvider: (provider: ProviderProfile, type: 'call' | 'whatsapp') => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onSelectProvider,
  onContactProvider,
}) => {
  const dispatch = useAppDispatch();
  const { filteredProviders, filters, viewMode, isLoading } = useAppSelector((state) => state.providers);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  // Reset to first page when any search/location/category filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.searchQuery,
    filters.category,
    filters.city,
    filters.minRating,
    filters.availableOnly,
    filters.maxDistanceKm,
    filters.sortBy,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProviders = filteredProviders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & View Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Explore Local Service Professionals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Find electricians, AC mechanics, plumbers, and cleaning pros around you using digital visiting cards or Leaflet live map.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Grid vs Map Toggle */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
            <button
              onClick={() => dispatch(setViewMode('grid'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => dispatch(setViewMode('map'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Leaflet Map</span>
            </button>
          </div>

          <button
            onClick={() => dispatch(resetFilters())}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Search & Radius Filters</span>
          </div>

          <div className="flex items-center gap-2 normal-case">
            {filters.locationPermissionStatus === 'granted' ? (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>GPS Active: Pros within 50 km</span>
              </span>
            ) : (
              <span className="text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>District: {filters.city} (Permission Denied / Manual)</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Service Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => dispatch(setFilter({ category: e.target.value }))}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => dispatch(setFilter({ city: e.target.value }))}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
            >
              <option value="All">All Cities</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          {/* Surround Radius Filter (50km / 10km) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Distance / Surround
            </label>
            <select
              value={filters.maxDistanceKm}
              onChange={(e) => dispatch(setFilter({ maxDistanceKm: Number(e.target.value) }))}
              className="w-full text-xs font-semibold p-2.5 bg-indigo-50/60 border border-indigo-200 text-indigo-900 rounded-xl focus:border-indigo-600 focus:outline-none font-bold"
            >
              <option value="0">Any Distance (All)</option>
              <option value="10">Within 10 km (Nearby)</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km (Citywide)</option>
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Min. Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => dispatch(setFilter({ minRating: Number(e.target.value) }))}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
            >
              <option value="0">Any Rating</option>
              <option value="4">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.8">4.8+ Stars</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                dispatch(setFilter({ sortBy: e.target.value as any }))
              }
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
            >
              <option value="distance">Distance: Nearest First</option>
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          {/* Available Today Only Toggle */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() =>
                dispatch(setFilter({ availableOnly: !filters.availableOnly }))
              }
              className={`w-full py-2.5 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                filters.availableOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  filters.availableOnly ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              <span>Available Now Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div ref={resultsTopRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-500 scroll-mt-24">
        {isLoading ? (
          <span className="flex items-center gap-2 text-indigo-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Finding service pros in selected location & radius...</span>
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900">{filteredProviders.length}</strong>{' '}
              verified service professionals
              {filters.maxDistanceKm > 0 && ` within ${filters.maxDistanceKm}km`}
            </span>
            {filteredProviders.length > itemsPerPage && (
              <span className="text-slate-400 font-normal">
                (Page {currentPage} of {Math.ceil(filteredProviders.length / itemsPerPage)})
              </span>
            )}
          </div>
        )}
      </div>

      {/* View Content: Leaflet Map or Visiting Cards Grid */}
      {isLoading ? (
        viewMode === 'map' ? (
          <div className="h-[620px] bg-slate-100 rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-500 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <div className="text-sm font-bold text-slate-700">Loading Radar & Geocoded Pros...</div>
            <p className="text-xs text-slate-400">Plotting live locations on interactive map</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <VisitingCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : viewMode === 'map' ? (
        <div className="space-y-6">
          <ProviderMap
            providers={filteredProviders}
            onSelectProvider={onSelectProvider}
            onContactProvider={onContactProvider}
            height="620px"
          />

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Visiting Cards ({filteredProviders.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProviders.map((provider) => (
                <VisitingCard
                  key={provider._id}
                  provider={provider}
                  onSelect={onSelectProvider}
                  onContact={onContactProvider}
                />
              ))}
            </div>

            {filteredProviders.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredProviders.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={(newSize) => {
                  setItemsPerPage(newSize);
                  setCurrentPage(1);
                }}
                itemsPerPageOptions={[6, 9, 12]}
              />
            )}
          </div>
        </div>
      ) : filteredProviders.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProviders.map((provider) => (
              <VisitingCard
                key={provider._id}
                provider={provider}
                onSelect={onSelectProvider}
                onContact={onContactProvider}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredProviders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={(newSize) => {
              setItemsPerPage(newSize);
              setCurrentPage(1);
            }}
            itemsPerPageOptions={[6, 9, 12]}
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Service Pros In This Radius</h3>
          <p className="text-xs text-slate-500">
            No professionals matched within {filters.maxDistanceKm > 0 ? `${filters.maxDistanceKm} km` : 'your filters'}. Try expanding the radius to 25 km or 50 km!
          </p>
          <button
            onClick={() => dispatch(setFilter({ maxDistanceKm: 0 }))}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors"
          >
            Expand to All Distances
          </button>
        </div>
      )}
    </div>
  );
};
