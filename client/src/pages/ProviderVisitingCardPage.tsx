import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import {
  Phone,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Shield,
  Heart,
  Share2,
  QrCode,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Calendar,
  Briefcase,
  AlertCircle,
  ExternalLink,
  Camera,
  Send,
  Loader2,
  Sparkles,
  Navigation,
  User as UserIcon,
} from 'lucide-react';
import { ProviderProfile, Review } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleFavorite } from '../store/slices/favoriteSlice';
import { Avatar } from '../components/Avatar';
import { UpdateAvatarModal } from '../components/UpdateAvatarModal';
import api from '../services/api';

interface ProviderVisitingCardPageProps {
  onContactProvider?: (provider: ProviderProfile, type: 'call' | 'whatsapp') => void;
}

export const ProviderVisitingCardPage: React.FC<ProviderVisitingCardPageProps> = ({
  onContactProvider,
}) => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { providers } = useAppSelector((state) => state.providers);
  const { favoriteIds } = useAppSelector((state) => state.favorites);

  // Provider state
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Modals & UI states
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Leaflet Map reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const isFavorite = provider ? favoriteIds.includes(provider._id) : false;

  // Determine if logged-in user is the owner of this profile
  const isOwner = Boolean(
    isAuthenticated &&
      user &&
      user.role === 'provider' &&
      provider &&
      (user._id === (typeof provider.userId === 'string' ? provider.userId : provider.userId?._id) ||
        provider.email === user.email)
  );

  // 1. Fetch provider details by ID or username slug
  useEffect(() => {
    if (!username) return;

    // First check in Redux providers store for instant render
    const localMatch = providers.find(
      (p) =>
        p.username === username ||
        p._id === username ||
        p.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') === username.toLowerCase()
    );

    if (localMatch) {
      setProvider(localMatch);
    }

    setLoading(true);
    setFetchError(null);

    api
      .get(`/providers/${encodeURIComponent(username)}`)
      .then((res) => {
        if (res.data?.data) {
          setProvider(res.data.data);
        } else if (!localMatch) {
          setFetchError('Provider visiting card not found');
        }
      })
      .catch((err) => {
        console.warn('Could not fetch provider from API:', err.message);
        if (!localMatch) {
          setFetchError(
            err.response?.data?.message || 'Provider profile could not be loaded. Please check the URL.'
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username, providers]);

  // 2. Fetch verified reviews for this provider
  useEffect(() => {
    if (provider?._id) {
      setLoadingReviews(true);
      api
        .get(`/reviews/${provider._id}`)
        .then((res) => {
          if (res.data?.data) {
            setReviews(res.data.data);
          }
        })
        .catch((err) => {
          console.warn('Could not load reviews:', err.message);
        })
        .finally(() => {
          setLoadingReviews(false);
        });
    }
  }, [provider?._id]);

  // 3. Initialize Interactive Leaflet Map for Provider Location
  useEffect(() => {
    if (!provider?.location || !mapContainerRef.current) return;

    const lat = provider.location.lat;
    const lng = provider.location.lng;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Custom Pin Marker
      const customIcon = L.divIcon({
        className: 'custom-provider-card-pin',
        html: `
          <div style="background-color: #4f46e5; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); border: 3px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4; padding: 2px;">
          <strong style="color: #1e1b4b; display: block; font-size: 14px;">${provider.businessName}</strong>
          <span style="color: #64748b;">${provider.address}, ${provider.area}</span>
        </div>
      `);

      // Service area coverage radius circle (4km)
      L.circle([lat, lng], {
        radius: 4000,
        color: '#4f46e5',
        weight: 1.5,
        opacity: 0.7,
        fillColor: '#818cf8',
        fillOpacity: 0.12,
        dashArray: '4, 6',
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng], 14);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [provider]);

  // Action: Toggle Favorite
  const handleToggleFavorite = () => {
    if (!provider) return;
    dispatch(toggleFavorite(provider._id));
  };

  // Action: Direct Call
  const handleCall = () => {
    if (!provider) return;
    api.post(`/providers/${provider._id}/call-click`).catch(() => {});
    if (onContactProvider) {
      onContactProvider(provider, 'call');
    } else {
      window.open(`tel:${provider.phone}`, '_self');
    }
  };

  // Action: Direct WhatsApp
  const handleWhatsapp = () => {
    if (!provider) return;
    api.post(`/providers/${provider._id}/call-click`).catch(() => {});
    if (onContactProvider) {
      onContactProvider(provider, 'whatsapp');
    } else {
      const cleanPhone = (provider.whatsapp || provider.phone).replace(/\D/g, '');
      const defaultText = `Hi ${provider.businessName}, I saw your visiting card on LocalMate and would like to inquire about your ${provider.category} services.`;
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultText)}`;
      window.open(url, '_blank');
    }
  };

  // Action: Share Card
  const handleShareCard = async () => {
    const cardUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${provider?.businessName} - LocalMate Visiting Card`,
          text: `Check out ${provider?.businessName} (${provider?.category}) on LocalMate:`,
          url: cardUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(cardUrl);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Action: Download vCard contact (.vcf)
  const handleDownloadVCard = () => {
    if (!provider) return;
    const vcardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${provider.businessName}`,
      `ORG:${provider.businessName}`,
      `TITLE:${provider.category} Specialist`,
      `TEL;TYPE=CELL:${provider.phone}`,
      provider.email ? `EMAIL:${provider.email}` : '',
      `ADR;TYPE=WORK:;;${provider.address};${provider.city};;India`,
      `NOTE:LocalMate Verified Provider. Rating: ${provider.rating} ★. Category: ${provider.category}`,
      `URL:${window.location.href}`,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${provider.businessName.replace(/\s+/g, '_')}_VisitingCard.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action: Submit Review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !commentInput.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        providerId: provider._id,
        rating: ratingInput,
        comment: commentInput.trim(),
      });

      if (res.data?.data) {
        setReviews([res.data.data, ...reviews]);
      } else {
        const fallbackReview: Review = {
          _id: 'rev-' + Date.now(),
          providerId: provider._id,
          userId: user?._id || 'guest',
          customerName: user?.name || 'Local Customer',
          rating: ratingInput,
          comment: commentInput.trim(),
          createdAt: 'Just now',
        };
        setReviews([fallbackReview, ...reviews]);
      }

      setCommentInput('');
      setReviewMessage('Thank you! Your verified review was posted successfully.');
      setTimeout(() => setReviewMessage(null), 4000);
    } catch (err: any) {
      const fallbackReview: Review = {
        _id: 'rev-' + Date.now(),
        providerId: provider._id,
        userId: user?._id || 'guest',
        customerName: user?.name || 'Local Customer',
        rating: ratingInput,
        comment: commentInput.trim(),
        createdAt: 'Just now',
      };
      setReviews([fallbackReview, ...reviews]);
      setCommentInput('');
      setReviewMessage('Review saved locally! Thank you for your feedback.');
      setTimeout(() => setReviewMessage(null), 4000);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Avatar update success callback
  const handleAvatarUpdated = (newAvatarUrl: string) => {
    if (provider) {
      setProvider({
        ...provider,
        avatarUrl: newAvatarUrl,
      });
    }
  };

  // --------------------------------------------------------------------------
  // Loading State
  // --------------------------------------------------------------------------
  if (loading && !provider) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">
          Loading digital visiting card...
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Error State
  // --------------------------------------------------------------------------
  if (fetchError || !provider) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Visiting Card Not Found</h2>
          <p className="text-sm text-slate-600">
            {fetchError || `We couldn't locate any provider registered under "${username}".`}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/explore')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            Explore All Local Providers
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const currentUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    currentUrl
  )}&margin=12`;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Banner if viewing own profile */}
      {isOwner && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white text-xs py-2.5 px-4 shadow-sm border-b border-indigo-700/50">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong>Your Public Visiting Card:</strong> This is how local customers view your
                profile and contact you directly.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowAvatarModal(true)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                Update Photo
              </button>
              <Link
                to="/provider/dashboard"
                className="px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors"
              >
                Manage Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Breadcrumb & Back Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareCard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            {copiedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Share Card</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>QR Code</span>
          </button>
        </div>
      </div>

      {/* Main Visiting Card Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* ===================================================================
            DIGITAL VISITING CARD HERO BANNER
        =================================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden relative">
          {/* Header Band */}
          <div className="relative h-44 sm:h-52 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 flex flex-col justify-between text-white overflow-hidden">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-start justify-between">
              {/* Category & Verified Stamp */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200">
                  {provider.category}
                </span>

                {provider.isVerified && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1.5 backdrop-blur-md">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Local Pro
                  </span>
                )}
              </div>

              {/* Status & Favorite */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-black/40 border border-white/10">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      provider.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className={provider.isAvailable ? 'text-emerald-300' : 'text-amber-300'}>
                    {provider.isAvailable ? 'Available Now' : 'Busy Today'}
                  </span>
                </div>

                <button
                  onClick={handleToggleFavorite}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-transform active:scale-90"
                  aria-label="Save to favorites"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorite ? 'text-rose-500 fill-rose-500' : 'text-white'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Tagline / Experience banner */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-300">
              <span className="truncate max-w-md hidden sm:inline">
                {provider.tagline || 'Direct-to-consumer verified neighbourhood technician'}
              </span>
              <span className="font-semibold text-white/90">
                {provider.experienceYears}+ Years Experience
              </span>
            </div>
          </div>

          {/* Profile Section with Overlapping Avatar */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
              {/* Avatar + Edit Photo Overlay */}
              <div className="relative inline-block self-start">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white ring-4 ring-slate-100">
                  <img
                    src={provider.avatarUrl}
                    alt={provider.businessName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {provider.isVerified && (
                  <div
                    className="absolute -bottom-2 -right-2 bg-indigo-600 text-white rounded-2xl p-1.5 border-4 border-white shadow-md"
                    title="Verified Local Specialist"
                  >
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                )}

                {/* Quick Avatar Change Button */}
                {(isOwner || isAuthenticated) && (
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute top-2 right-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-sm shadow-md transition-all hover:scale-105"
                    title="Update Profile Picture"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Buttons Right-Aligned on Desktop */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Direct Call Button */}
                <button
                  onClick={handleCall}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  <span>Call {provider.phone}</span>
                </button>

                {/* Direct WhatsApp Button */}
                <button
                  onClick={handleWhatsapp}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp Chat</span>
                </button>

                {/* Save Contact (vCard) */}
                <button
                  onClick={handleDownloadVCard}
                  className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
                  title="Save to Phone Contacts (vCard)"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Provider Title & Essential Details */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    {provider.businessName}
                  </h1>
                  {provider.tagline && (
                    <p className="text-sm font-medium text-slate-600 mt-1">{provider.tagline}</p>
                  )}
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-2xl self-start sm:self-auto">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {provider.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({provider.reviewCount || reviews.length} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges / Micro Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  {provider.area}, {provider.city}
                </span>

                {provider.workingType && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    {provider.workingType}
                  </span>
                )}

                {provider.workingHours && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {provider.workingHours}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                  Starts at ₹{provider.pricingStartsAt}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            GRID CONTENT: RATE CARD, ABOUT, LOCATION MAP, REVIEWS
        =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Services, About, Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. RATE CARD & SERVICES OFFERED */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    ₹
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Service Rate Card</h3>
                    <p className="text-xs text-slate-500">
                      Standard transparent pricing without hidden commissions
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {provider.services?.length || 0} Listed Services
                </span>
              </div>

              {provider.services && provider.services.length > 0 ? (
                <div className="space-y-3">
                  {provider.services.map((service, idx) => (
                    <div
                      key={service.id || idx}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-indigo-200 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-slate-900 text-sm">{service.name}</h4>
                        <span className="text-xs text-slate-500">
                          Direct service by {provider.businessName}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-indigo-700 text-base">
                          ₹{service.price}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {service.unit || 'per visit'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Direct inspection & consultation begins at ₹{provider.pricingStartsAt}. Contact
                  for specific quote.
                </p>
              )}
            </div>

            {/* 2. ABOUT THE SPECIALIST */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
              <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
                About {provider.businessName}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {provider.about ||
                  `Dedicated ${provider.category} with ${provider.experienceYears}+ years of hands-on experience in ${provider.city}. Committed to fast turnaround times, genuine spare parts, and transparent charges.`}
              </p>

              {/* Trust Badges */}
              {provider.badges && provider.badges.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Trust & Verification Badges
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.badges.map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. VERIFIED REVIEWS & RATINGS */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Customer Reviews</h3>
                  <p className="text-xs text-slate-500">
                    Feedback from genuine neighbourhood residents
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-lg">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>{provider.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Add Review Form */}
              <form
                onSubmit={handleReviewSubmit}
                className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Leave a Verified Review
                  </h4>
                  {/* Star Rating Picker */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= ratingInput ? 'fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={`Write your experience with ${provider.businessName}...`}
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none"
                />

                {reviewMessage && (
                  <p className="text-xs font-semibold text-emerald-600">{reviewMessage}</p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview || !commentInput.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    {submittingReview ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Post Review
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              {loadingReviews ? (
                <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  Loading customer reviews...
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-3.5">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                            {rev.customerName?.charAt(0) || 'C'}
                          </div>
                          <span className="font-bold text-slate-900 text-xs">
                            {rev.customerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  No public reviews yet. Be the first to leave a review!
                </p>
              )}
            </div>
          </div>

          {/* Right Column (1 Col): Location & Operating Hours */}
          <div className="space-y-6">
            {/* LOCATION & SERVICE RADIUS MAP */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Service Location
                </h3>
                <span className="text-xs text-slate-500">{provider.city}</span>
              </div>

              {/* Leaflet Map Card */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-56 shadow-xs">
                <div ref={mapContainerRef} className="w-full h-full" />
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">{provider.address}</p>
                <p>
                  {provider.area}, {provider.city}
                </p>
                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${provider.location.lat},${provider.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold text-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open in Google Maps / Directions
                  </a>
                </div>
              </div>
            </div>

            {/* OPERATING HOURS & AVAILABILITY */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Working Hours & Availability
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600">Status</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      provider.isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {provider.isAvailable ? 'Available Now' : 'Busy Today'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Operating Schedule
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {provider.workingHours || '9:00 AM - 8:00 PM (Mon - Sat)'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Service Delivery Type
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {provider.workingType || 'On-site / Home Visit'}
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK SHARE & QR BOX */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-indigo-300">
                <QrCode className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-base">Digital Visiting Card</h4>
                <p className="text-xs text-indigo-200">
                  Scan on your phone or share with your family and neighbours.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-xs"
                >
                  View QR Code
                </button>
                <button
                  onClick={handleShareCard}
                  className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-colors"
                >
                  {copiedToast ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          QR CODE MODAL
      ===================================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl border border-slate-100">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900">Scan Visiting Card</h3>
              <p className="text-xs text-slate-500">
                Open with phone camera to instantly access {provider.businessName}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-inner inline-block">
              <img
                src={qrCodeUrl}
                alt="Visiting card QR code"
                className="w-56 h-56 mx-auto rounded-xl"
              />
            </div>

            <p className="text-xs text-slate-500 font-mono break-all px-2 bg-slate-50 py-1.5 rounded-lg border border-slate-200">
              {currentUrl}
            </p>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleShareCard}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedToast ? 'Copied!' : 'Copy URL'}
              </button>

              <button
                onClick={() => setShowQrModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          UPDATE PROFILE PIC MODAL
      ===================================================================== */}
      <UpdateAvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatarUrl={provider.avatarUrl}
        providerName={provider.businessName}
        category={provider.category}
        onSuccess={handleAvatarUpdated}
      />
    </div>
  );
};
