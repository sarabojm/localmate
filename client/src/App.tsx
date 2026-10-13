import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store';
import {
  setProviders,
  setLocationGranted,
  setLoading,
  setError,
} from './store/slices/providerSlice';
import api from './services/api';
import { ProviderProfile } from './types';

// Layout & Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { ProviderDetailModal } from './components/ProviderDetailModal';
import { AuthModal } from './components/AuthModal';
import { LocationPromptModal } from './components/LocationPromptModal';
import { findNearestDistrict } from './utils/geo';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { ProviderVisitingCardPage } from './pages/ProviderVisitingCardPage';

export function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { filters } = useAppSelector((state) => state.providers);

  // Selected provider for details modal
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);

  // Location prompt modal state
  const [showLocationModal, setShowLocationModal] = useState<boolean>(() => {
    return localStorage.getItem('localmate_loc_status') !== 'granted' && localStorage.getItem('localmate_loc_status') !== 'denied';
  });

  // Contact modal state
  const [contactModalData, setContactModalData] = useState<{
    provider: ProviderProfile | null;
    mode: 'call' | 'whatsapp' | 'info';
  }>({
    provider: null,
    mode: 'call',
  });

  // Auth modal state
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    initialMode?: 'login' | 'register_customer' | 'register_provider';
    promptMessage?: string;
  }>({
    isOpen: false,
    initialMode: 'login',
    promptMessage: undefined,
  });

  // Automatic background refresh if permission was previously granted
  useEffect(() => {
    if (localStorage.getItem('localmate_loc_status') === 'granted' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const district = findNearestDistrict(coords);
          dispatch(setLocationGranted({ coords, district }));
        },
        () => {},
        { timeout: 6000 }
      );
    }
  }, [dispatch]);

  // Fetch providers directly from backend API server with loading state
  useEffect(() => {
    dispatch(setLoading(true));
    api
      .get('/providers')
      .then((res) => {
        if (res.data?.data) {
          dispatch(setProviders(res.data.data));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch providers from API server:', err);
        dispatch(setError(err.message || 'Failed to load service providers'));
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch]);

  const handleSelectProvider = (provider: ProviderProfile) => {
    setSelectedProvider(provider);
  };

  const handleContactProvider = (
    provider: ProviderProfile,
    type: 'call' | 'whatsapp'
  ) => {
    if (!isAuthenticated) {
      handleOpenAuth('login', 'Please sign in or create an account to call or message this service provider.');
      return;
    }
    setContactModalData({
      provider,
      mode: type,
    });
  };

  const handleOpenAuth = (
    initialMode: 'login' | 'register_customer' | 'register_provider' = 'login',
    promptMessage?: string
  ) => {
    setAuthModalState({
      isOpen: true,
      initialMode,
      promptMessage,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenLocationPrompt={() => setShowLocationModal(true)}
      />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onSelectProvider={handleSelectProvider}
                onContactProvider={handleContactProvider}
                onOpenAuth={handleOpenAuth}
              />
            }
          />
          <Route
            path="/explore"
            element={
              <ExplorePage
                onSelectProvider={handleSelectProvider}
                onContactProvider={handleContactProvider}
              />
            }
          />
          <Route
            path="/favorites"
            element={
              <FavoritesPage
                onSelectProvider={handleSelectProvider}
                onContactProvider={handleContactProvider}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <CustomerDashboardPage
                onSelectProvider={handleSelectProvider}
                onContactProvider={handleContactProvider}
              />
            }
          />
          <Route
            path="/provider/dashboard"
            element={
              <ProviderDashboardPage
                onSelectProvider={handleSelectProvider}
                onContactProvider={handleContactProvider}
              />
            }
          />
          <Route
            path="/provider/:username"
            element={
              <ProviderVisitingCardPage
                onContactProvider={handleContactProvider}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Provider Full Visiting Card & Details Modal */}
      <ProviderDetailModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onContact={handleContactProvider}
      />

      {/* Direct Contact Modal (Call / WhatsApp) */}
      <ContactModal
        provider={contactModalData.provider}
        mode={contactModalData.mode}
        onClose={() =>
          setContactModalData({ provider: null, mode: 'call' })
        }
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.initialMode}
        promptMessage={authModalState.promptMessage}
        onClose={() =>
          setAuthModalState({ isOpen: false, initialMode: 'login', promptMessage: undefined })
        }
      />

      {/* Customer Location & 50km Radius / District Modal */}
      <LocationPromptModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}

export default App;
