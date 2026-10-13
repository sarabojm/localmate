import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProviderProfile, Coordinates } from '../../types';
import {
  calculateDistanceKm,
  CITY_COORDINATES,
  findNearestDistrict,
} from '../../utils/geo';

export type LocationPermissionStatus = 'prompt' | 'granted' | 'denied';

export interface ProviderFilter {
  searchQuery: string;
  category: string;
  city: string; // District/City
  minRating: number;
  availableOnly: boolean;
  maxDistanceKm: number; // 50km default when granted, 0 = all
  userLocation: Coordinates;
  locationPermissionStatus: LocationPermissionStatus;
  detectedDistrict?: string;
  sortBy: 'distance' | 'rating' | 'experience' | 'price_low' | 'price_high';
}

interface ProviderState {
  providers: ProviderProfile[];
  filteredProviders: ProviderProfile[];
  selectedProvider: ProviderProfile | null;
  filters: ProviderFilter;
  viewMode: 'grid' | 'map';
  isLoading: boolean;
  error: string | null;
}

// Restore saved location permission status if exists
const savedPermStatus = (localStorage.getItem('localmate_loc_status') as LocationPermissionStatus) || 'prompt';
const savedCity = localStorage.getItem('localmate_district') || 'Bangalore';
const savedCoordsJson = localStorage.getItem('localmate_coords');
let initialCoords = CITY_COORDINATES.Bangalore;
if (savedCoordsJson) {
  try {
    initialCoords = JSON.parse(savedCoordsJson);
  } catch {}
}

const initialFilters: ProviderFilter = {
  searchQuery: '',
  category: 'All',
  city: savedPermStatus === 'denied' ? savedCity : 'All',
  minRating: 0,
  availableOnly: false,
  maxDistanceKm: savedPermStatus === 'granted' ? 50 : 0,
  userLocation: initialCoords,
  locationPermissionStatus: savedPermStatus,
  detectedDistrict: savedCity,
  sortBy: savedPermStatus === 'granted' ? 'distance' : 'rating',
};

const applyFilters = (providers: ProviderProfile[], filters: ProviderFilter): ProviderProfile[] => {
  return providers
    .map((provider) => {
      if (provider.location && filters.userLocation) {
        return {
          ...provider,
          distanceKm: calculateDistanceKm(filters.userLocation, provider.location),
        };
      }
      return provider;
    })
    .filter((provider) => {
      // 1. If GPS permission granted and 50km radius active: filter within 50km
      if (filters.locationPermissionStatus === 'granted' && filters.maxDistanceKm > 0) {
        if (provider.distanceKm !== undefined && provider.distanceKm > filters.maxDistanceKm) {
          return false;
        }
      }

      // 2. If permission denied: strictly filter by selected District/City profile
      if (filters.locationPermissionStatus === 'denied') {
        if (filters.city !== 'All' && provider.city !== filters.city) {
          return false;
        }
      } else if (filters.maxDistanceKm === 0 && filters.city !== 'All' && provider.city !== filters.city) {
        return false;
      }

      // 3. Search query filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = provider.businessName.toLowerCase().includes(query);
        const matchesTagline = provider.tagline.toLowerCase().includes(query);
        const matchesCategory = provider.category.toLowerCase().includes(query);
        const matchesService = provider.services.some((s) => s.name.toLowerCase().includes(query));
        const matchesArea = provider.area.toLowerCase().includes(query) || provider.city.toLowerCase().includes(query);
        if (!matchesName && !matchesTagline && !matchesCategory && !matchesService && !matchesArea) {
          return false;
        }
      }

      // 4. Category filter
      if (filters.category !== 'All' && provider.category !== filters.category) {
        return false;
      }

      // 5. Rating filter
      if (provider.rating < filters.minRating) {
        return false;
      }

      // 6. Available only filter
      if (filters.availableOnly && !provider.isAvailable) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'distance') {
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      }
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (filters.sortBy === 'price_low') return a.pricingStartsAt - b.pricingStartsAt;
      if (filters.sortBy === 'price_high') return b.pricingStartsAt - a.pricingStartsAt;
      return 0;
    });
};

const initialState: ProviderState = {
  providers: [],
  filteredProviders: [],
  selectedProvider: null,
  filters: initialFilters,
  viewMode: 'grid',
  isLoading: true,
  error: null,
};

export const providerSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {
    setProviders: (state, action: PayloadAction<ProviderProfile[]>) => {
      state.providers = action.payload;
      state.filteredProviders = applyFilters(action.payload, state.filters);
    },
    setSelectedProvider: (state, action: PayloadAction<ProviderProfile | null>) => {
      state.selectedProvider = action.payload;
    },
    setLocationGranted: (
      state,
      action: PayloadAction<{ coords: Coordinates; district?: string }>
    ) => {
      const { coords } = action.payload;
      const detected = action.payload.district || findNearestDistrict(coords);
      state.filters.locationPermissionStatus = 'granted';
      state.filters.userLocation = coords;
      state.filters.maxDistanceKm = 50; // default 50km radius
      state.filters.detectedDistrict = detected;
      state.filters.city = 'All'; // show all pros within 50km regardless of strict city border
      state.filters.sortBy = 'distance';

      localStorage.setItem('localmate_loc_status', 'granted');
      localStorage.setItem('localmate_coords', JSON.stringify(coords));
      localStorage.setItem('localmate_district', detected);

      state.filteredProviders = applyFilters(state.providers, state.filters);
    },
    setLocationDenied: (state, action: PayloadAction<{ fallbackDistrict?: string }>) => {
      const district = action.payload.fallbackDistrict || state.filters.city !== 'All' ? state.filters.city : 'Bangalore';
      state.filters.locationPermissionStatus = 'denied';
      state.filters.maxDistanceKm = 0; // disable strict distance radius, use district matching
      state.filters.city = district;
      state.filters.detectedDistrict = district;
      if (CITY_COORDINATES[district]) {
        state.filters.userLocation = CITY_COORDINATES[district];
      }
      state.filters.sortBy = 'rating';

      localStorage.setItem('localmate_loc_status', 'denied');
      localStorage.setItem('localmate_district', district);

      state.filteredProviders = applyFilters(state.providers, state.filters);
    },
    setDistrict: (state, action: PayloadAction<string>) => {
      const district = action.payload;
      state.filters.city = district;
      state.filters.detectedDistrict = district;
      if (CITY_COORDINATES[district]) {
        state.filters.userLocation = CITY_COORDINATES[district];
      }
      localStorage.setItem('localmate_district', district);
      state.filteredProviders = applyFilters(state.providers, state.filters);
    },
    setFilter: (state, action: PayloadAction<Partial<ProviderFilter>>) => {
      let updatedUserLocation = state.filters.userLocation;
      if (action.payload.city && action.payload.city !== 'All' && CITY_COORDINATES[action.payload.city]) {
        updatedUserLocation = CITY_COORDINATES[action.payload.city];
      }
      state.filters = {
        ...state.filters,
        ...action.payload,
        userLocation: action.payload.userLocation || updatedUserLocation,
      };
      state.filteredProviders = applyFilters(state.providers, state.filters);
    },
    setUserLocation: (state, action: PayloadAction<Coordinates>) => {
      state.filters.userLocation = action.payload;
      state.filteredProviders = applyFilters(state.providers, state.filters);
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'map'>) => {
      state.viewMode = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
      state.filteredProviders = applyFilters(state.providers, initialFilters);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateProviderAvailability: (
      state,
      action: PayloadAction<{ providerId: string; isAvailable: boolean }>
    ) => {
      const { providerId, isAvailable } = action.payload;
      const provider = state.providers.find((p) => p._id === providerId);
      if (provider) {
        provider.isAvailable = isAvailable;
        state.filteredProviders = applyFilters(state.providers, state.filters);
      }
      if (state.selectedProvider && state.selectedProvider._id === providerId) {
        state.selectedProvider.isAvailable = isAvailable;
      }
    },
  },
});

export const {
  setProviders,
  setSelectedProvider,
  setLocationGranted,
  setLocationDenied,
  setDistrict,
  setFilter,
  setUserLocation,
  setViewMode,
  resetFilters,
  setLoading,
  setError,
  updateProviderAvailability,
} = providerSlice.actions;

export default providerSlice.reducer;
