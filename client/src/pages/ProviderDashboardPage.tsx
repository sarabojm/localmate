import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  PhoneCall,
  Star,
  Users,
  Eye,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  MessageCircle,
  ExternalLink,
  Copy,
  Share2,
  QrCode,
  Calendar,
  Check,
  AlertCircle,
  TrendingUp,
  Award,
  Layers,
  PhoneForwarded,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  LogIn,
  UserPlus,
  LogOut,
  ArrowRight,
  Zap,
  Loader2,
  Camera,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';
import { updateProviderAvailability, setProviders } from '../store/slices/providerSlice';
import { VisitingCard } from '../components/VisitingCard';
import { UpdateAvatarModal } from '../components/UpdateAvatarModal';
import { ProviderProfile, ServiceItem, Coordinates } from '../types';
import { CATEGORIES } from '../data/mockData';
import { LocationPickerMap } from '../components/LocationPickerMap';
import { WorkingHoursPicker } from '../components/WorkingHoursPicker';
import { CITY_COORDINATES, generateAvatarUrl } from '../utils/geo';
import api from '../services/api';

interface ProviderDashboardPageProps {
  onSelectProvider?: (provider: ProviderProfile) => void;
  onContactProvider?: (provider: ProviderProfile, type: 'call' | 'whatsapp') => void;
}

interface CustomerLead {
  id: string;
  customerName: string;
  phone: string;
  serviceNeeded: string;
  timeAgo: string;
  status: 'New' | 'Connected' | 'Completed';
  notes: string;
}

export const ProviderDashboardPage: React.FC<ProviderDashboardPageProps> = ({
  onSelectProvider,
  onContactProvider,
}) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { providers } = useAppSelector((state) => state.providers);

  // Auth Screen State (when provider is not logged in)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regCategory, setRegCategory] = useState('Electrician');
  const [regCity, setRegCity] = useState('Bangalore');
  const [regArea, setRegArea] = useState('Indiranagar');
  const [regAddress, setRegAddress] = useState('12th Main Road');
  const [regPhone, setRegPhone] = useState('+91 98450 12345');
  const [regWhatsapp, setRegWhatsapp] = useState('919845012345');
  const [regPricingStartsAt, setRegPricingStartsAt] = useState(199);
  const [regWorkingType, setRegWorkingType] = useState('On-site / Home Visit');
  const [regWorkingHours, setRegWorkingHours] = useState('9:00 AM - 8:00 PM (Mon - Sat)');
  const [regAbout, setRegAbout] = useState('');
  const [regLocation, setRegLocation] = useState<Coordinates>(CITY_COORDINATES.Bangalore);

  // Active Tab state for Dashboard
  const [activeTab, setActiveTab] = useState<'card_editor' | 'leads' | 'reviews' | 'qr_card'>('card_editor');

  // Currently selected provider profile to inspect & edit
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    providers[0]?._id || 'mock-p1'
  );

  const currentProvider = providers.find((p) => p._id === selectedProviderId) || providers[0];

  // Editable Form State
  const [businessName, setBusinessName] = useState(currentProvider?.businessName || 'Sharma Electrical Works');
  const [tagline, setTagline] = useState(currentProvider?.tagline || 'Master Electrician & Wiring Specialist');
  const [category, setCategory] = useState(currentProvider?.category || 'Electrician');
  const [phone, setPhone] = useState(currentProvider?.phone || '+91 98450 12345');
  const [whatsapp, setWhatsapp] = useState(currentProvider?.whatsapp || '919845012345');
  const [city, setCity] = useState(currentProvider?.city || 'Bangalore');
  const [area, setArea] = useState(currentProvider?.area || 'Indiranagar');
  const [address, setAddress] = useState(currentProvider?.address || '12th Main Rd, Indiranagar');
  const [pricingStartsAt, setPricingStartsAt] = useState<number>(currentProvider?.pricingStartsAt || 199);
  const [workingType, setWorkingType] = useState(currentProvider?.workingType || 'On-site / Home Visit');
  const [workingHours, setWorkingHours] = useState(currentProvider?.workingHours || '9:00 AM - 8:00 PM (Mon - Sat)');
  const [about, setAbout] = useState(currentProvider?.about || 'Certified professional with 8+ years experience.');
  const [isAvailable, setIsAvailable] = useState<boolean>(currentProvider?.isAvailable ?? true);
  const [location, setLocation] = useState<Coordinates>(
    currentProvider?.location || CITY_COORDINATES.Bangalore
  );
  const [services, setServices] = useState<ServiceItem[]>(
    currentProvider?.services || [
      { id: '1', name: 'General Inspection & Troubleshooting', price: 199, unit: 'per visit' },
      { id: '2', name: 'Ceiling Fan / Light Fixture Repair', price: 299, unit: 'per unit' },
    ]
  );

  // Avatar state & modal
  const [avatarUrl, setAvatarUrl] = useState<string>(currentProvider?.avatarUrl || '');
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);

  // Form input additions
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceUnit, setNewServiceUnit] = useState('per visit');

  // Notification and Toast state
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  // Fetch logged-in provider profile from backend API
  useEffect(() => {
    if (isAuthenticated && user?.role === 'provider') {
      api
        .get('/providers/me')
        .then((res) => {
          if (res.data?.data) {
            const p = res.data.data;
            setSelectedProviderId(p._id);
            setBusinessName(p.businessName);
            setTagline(p.tagline || '');
            setCategory(p.category);
            setPhone(p.phone || '');
            setWhatsapp(p.whatsapp || '');
            setCity(p.city || 'Bangalore');
            setArea(p.area || '');
            setAddress(p.address || '');
            setPricingStartsAt(p.pricingStartsAt || 199);
            setWorkingType(p.workingType || 'On-site / Home Visit');
            setWorkingHours(p.workingHours || '9:00 AM - 8:00 PM (Mon - Sat)');
            setAbout(p.about || '');
            setIsAvailable(p.isAvailable ?? true);
            setLocation(p.location || CITY_COORDINATES.Bangalore);
            setServices(p.services || []);
            if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch provider profile from API:', err.message);
        });
    }
  }, [isAuthenticated, user?._id]);

  // Fetch reviews for current provider from backend API
  useEffect(() => {
    if (currentProvider?._id) {
      api
        .get(`/reviews/${currentProvider._id}`)
        .then((res) => {
          if (res.data?.data && res.data.data.length > 0) {
            setReviews(res.data.data);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch reviews from API:', err.message);
        });
    }
  }, [currentProvider?._id]);

  // Synchronize when switching demo provider profile or on initial load
  useEffect(() => {
    if (currentProvider) {
      setBusinessName(currentProvider.businessName);
      setTagline(currentProvider.tagline);
      setCategory(currentProvider.category);
      setPhone(currentProvider.phone || '');
      setWhatsapp(currentProvider.whatsapp || '');
      setCity(currentProvider.city || 'Bangalore');
      setArea(currentProvider.area || '');
      setAddress(currentProvider.address || '');
      setPricingStartsAt(currentProvider.pricingStartsAt || 199);
      setWorkingType(currentProvider.workingType || 'On-site / Home Visit');
      setWorkingHours(currentProvider.workingHours || '9:00 AM - 8:00 PM (Mon - Sat)');
      setAbout(currentProvider.about || '');
      setIsAvailable(currentProvider.isAvailable ?? true);
      setLocation(currentProvider.location || CITY_COORDINATES.Bangalore);
      setServices(currentProvider.services || []);
    }
  }, [selectedProviderId]);

  // Sync city coordinates in registration
  const handleRegCityChange = (newCity: string) => {
    setRegCity(newCity);
    if (CITY_COORDINATES[newCity]) {
      setRegLocation(CITY_COORDINATES[newCity]);
    }
  };

  // Provider Login Handler
  const handleProviderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      try {
        const res = await api.post('/auth/login', { email: authEmail, password: authPassword });
        if (res.data?.user) {
          dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
          return;
        }
      } catch (err: any) {
        // Fallback for demo when backend is offline
        const matchedProvider = providers.find(
          (p) => p.email?.toLowerCase() === authEmail.toLowerCase() || p.phone.includes(authEmail)
        ) || providers[0];

        const providerUser = {
          _id: matchedProvider?._id || 'demo-provider-u1',
          name: matchedProvider?.businessName || authEmail.split('@')[0],
          email: authEmail,
          role: 'provider' as const,
          phone: matchedProvider?.phone || '9845012345',
        };

        dispatch(setCredentials({ user: providerUser, token: 'demo_provider_token' }));
        if (matchedProvider) {
          setSelectedProviderId(matchedProvider._id);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick 1-Click Demo Login
  const handleQuickDemoLogin = (providerIndex: number) => {
    const demoPro = providers[providerIndex] || providers[0];
    const userIdStr =
      typeof demoPro.userId === 'string'
        ? demoPro.userId
        : (demoPro.userId as any)?._id || `prov-user-${demoPro._id}`;

    const demoUser = {
      _id: userIdStr,
      name: demoPro.businessName,
      email: demoPro.email || `${demoPro.category.toLowerCase()}@localmate.in`,
      role: 'provider' as const,
      phone: demoPro.phone,
    };
    dispatch(setCredentials({ user: demoUser, token: 'demo_provider_token_' + demoPro._id }));
    setSelectedProviderId(demoPro._id);
  };

  // Provider Registration Handler
  const handleProviderRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const userAvatar = generateAvatarUrl(regBusinessName || regName, regCategory);
      const newUserId = 'prov-u-' + Date.now();
      const newProviderId = 'prov-card-' + Date.now();

      const newProviderProfile: ProviderProfile = {
        _id: newProviderId,
        userId: newUserId,
        businessName: regBusinessName || `${regName}'s ${regCategory} Services`,
        tagline: `Verified ${regCategory} Specialist`,
        category: regCategory,
        rating: 5.0,
        reviewCount: 1,
        experienceYears: 4,
        address: `${regAddress}, ${regArea}`,
        city: regCity,
        area: regArea,
        location: regLocation,
        phone: regPhone,
        whatsapp: regWhatsapp || regPhone,
        email: authEmail,
        about: regAbout || `Certified professional offering reliable ${regCategory} services in ${regCity}.`,
        avatarUrl: userAvatar,
        isVerified: true,
        isAvailable: true,
        pricingStartsAt: Number(regPricingStartsAt) || 199,
        workingType: regWorkingType,
        workingHours: regWorkingHours,
        badges: ['Police Verified', 'Licensed Pro', 'Leaflet Listed'],
        services: [
          { id: 'srv-1', name: 'General Visit & Troubleshooting', price: Number(regPricingStartsAt) || 199, unit: 'per visit' },
          { id: 'srv-2', name: 'Emergency Repair', price: (Number(regPricingStartsAt) || 199) + 200, unit: 'per visit' },
        ],
        totalCallsReceived: 0,
      };

      // Attempt backend API registration
      try {
        const res = await api.post('/auth/register', {
          name: regName,
          email: authEmail,
          password: authPassword,
          role: 'provider',
          phone: regPhone,
          whatsapp: regWhatsapp || regPhone,
          businessName: regBusinessName,
          category: regCategory,
          city: regCity,
          area: regArea,
          address: regAddress,
          location: regLocation,
          workingType: regWorkingType,
          workingHours: regWorkingHours,
          pricingStartsAt: Number(regPricingStartsAt) || 199,
          about: regAbout,
          avatar: userAvatar,
        });

        dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      } catch {
        // Local state registration fallback
        const providerUser = {
          _id: newUserId,
          name: regName,
          email: authEmail,
          role: 'provider' as const,
          phone: regPhone,
          avatar: userAvatar,
        };
        dispatch(setCredentials({ user: providerUser, token: 'demo_token_prov' }));
      }

      // Add to Redux provider state
      dispatch(setProviders([newProviderProfile, ...providers]));
      setSelectedProviderId(newProviderProfile._id);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogoutProvider = () => {
    dispatch(logout());
  };

  // Mock Customer Call & WhatsApp Leads Log
  const [leads, setLeads] = useState<CustomerLead[]>([
    {
      id: 'lead-1',
      customerName: 'Karthik Narayanan',
      phone: '+91 98840 92811',
      serviceNeeded: 'Emergency MCB tripping & fuse burning issue',
      timeAgo: '12 mins ago',
      status: 'New',
      notes: 'Customer called directly via Visiting Card',
    },
    {
      id: 'lead-2',
      customerName: 'Priya Sundaram',
      phone: '+91 97910 44219',
      serviceNeeded: 'Inverter wiring and new ceiling fan installation',
      timeAgo: '1 hour ago',
      status: 'Connected',
      notes: 'WhatsApp inquiry initiated',
    },
    {
      id: 'lead-3',
      customerName: 'Amit Verma',
      phone: '+91 99012 33810',
      serviceNeeded: 'Complete switchboard replacement in 2BHK',
      timeAgo: 'Yesterday',
      status: 'Completed',
      notes: 'Service completed, 5-star review received',
    },
    {
      id: 'lead-4',
      customerName: 'Deepa Krishnan',
      phone: '+91 94451 88204',
      serviceNeeded: 'Geyser electrical wiring check',
      timeAgo: '2 days ago',
      status: 'Completed',
      notes: 'Payment collected ₹350',
    },
  ]);

  // Provider reviews state
  const [reviews, setReviews] = useState([
    {
      id: 'r1',
      customerName: 'Ananya Sharma',
      rating: 5,
      date: '2 days ago',
      comment: 'Very polite, showed up in 20 minutes with tools. Solved the problem with great skill!',
      reply: 'Thank you Ananya for trusting our local service! Happy to help anytime.',
    },
    {
      id: 'r2',
      customerName: 'Vikram Joshi',
      rating: 5,
      date: '1 week ago',
      comment: 'Fair pricing and police verified badge gave us total peace of mind. Highly recommended.',
      reply: '',
    },
    {
      id: 'r3',
      customerName: 'Ramesh Babu',
      rating: 4.8,
      date: '2 weeks ago',
      comment: 'Good professional work. Cleaned up after finishing the job.',
      reply: '',
    },
  ]);

  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  // Construct Live Preview Provider Object
  const livePreviewProvider: ProviderProfile = {
    _id: currentProvider?._id || 'demo-provider-id',
    userId: user?._id || 'user-1',
    businessName,
    tagline,
    category,
    rating: currentProvider?.rating || 4.9,
    reviewCount: currentProvider?.reviewCount || 142,
    experienceYears: currentProvider?.experienceYears || 6,
    address,
    city,
    area,
    location,
    phone,
    whatsapp,
    about,
    avatarUrl: avatarUrl || currentProvider?.avatarUrl || generateAvatarUrl(businessName, category),
    coverUrl: currentProvider?.coverUrl,
    isVerified: true,
    isAvailable,
    pricingStartsAt: Number(pricingStartsAt),
    workingType,
    workingHours,
    badges: currentProvider?.badges || ['Police Verified', 'Licensed Pro', 'Direct Connect'],
    services,
    totalCallsReceived: currentProvider?.totalCallsReceived || 48,
  };

  const handleAddService = () => {
    if (!newServiceName.trim() || !newServicePrice) return;
    const item: ServiceItem = {
      id: 'srv-' + Date.now(),
      name: newServiceName,
      price: Number(newServicePrice),
      unit: newServiceUnit,
    };
    setServices([...services, item]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleToggleAvailability = () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    if (currentProvider?._id) {
      dispatch(
        updateProviderAvailability({
          providerId: currentProvider._id,
          isAvailable: nextState,
        })
      );
    }
    api.patch('/providers/me/availability').catch(() => {});
  };

  const handleAvatarUpdated = (newUrl: string) => {
    setAvatarUrl(newUrl);
    if (currentProvider) {
      dispatch(
        setProviders(
          providers.map((p) => (p._id === currentProvider._id ? { ...p, avatarUrl: newUrl } : p))
        )
      );
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      await api.put('/providers/me', {
        businessName,
        tagline,
        category,
        phone,
        whatsapp,
        city,
        area,
        address,
        pricingStartsAt: Number(pricingStartsAt),
        workingType,
        workingHours,
        about,
        avatarUrl: avatarUrl || currentProvider?.avatarUrl,
        services,
        isAvailable,
        location,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopyCardLink = () => {
    const cardSlug =
      currentProvider?.username || currentProvider?._id || encodeURIComponent(businessName);
    const link = `${window.location.origin}/provider/${cardSlug}`;
    navigator.clipboard.writeText(link);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  const handleLeadStatusChange = (leadId: string, newStatus: 'New' | 'Connected' | 'Completed') => {
    setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
  };

  const handlePostReply = (reviewId: string) => {
    const text = replyInputs[reviewId];
    if (!text || !text.trim()) return;
    setReviews(
      reviews.map((r) => (r.id === reviewId ? { ...r, reply: text.trim() } : r))
    );
    setReplyInputs({ ...replyInputs, [reviewId]: '' });
  };

  // =========================================================================
  // VIEW 1: PROVIDER IS NOT LOGGED IN -> SHOW LOGIN OR REGISTER SCREEN
  // =========================================================================
  const isProviderLoggedIn = isAuthenticated && user && user.role === 'provider';

  if (!isProviderLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
        {/* If user is logged in as customer, show friendly prompt */}
        {isAuthenticated && user && user.role === 'customer' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">
                  Customer Account Active ({user.name})
                </span>
                <p className="text-amber-800">
                  You are currently logged in as a customer. The Provider Portal is for verified electricians, AC mechanics, plumbers, and cleaning professionals. Please sign in or register with your provider credentials below.
                </p>
              </div>
            </div>
            <button
              onClick={() => dispatch(logout())}
              className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl font-bold shrink-0 transition-colors"
            >
              Sign Out Customer
            </button>
          </div>
        )}

        {/* Portal Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Service Professional Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Grow Your Local Business on LocalMate
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Connect directly with customers within a 50km radius. Get direct phone calls and WhatsApp enquiries with 0 middleman commissions.
            </p>
          </div>

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-300" />
          </div>
        </div>

        {/* Main Auth Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 text-sm font-bold bg-slate-50/60">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`flex-1 py-4 text-center flex items-center justify-center gap-2 transition-colors border-b-2 ${
                authMode === 'login'
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Provider Sign In</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`flex-1 py-4 text-center flex items-center justify-center gap-2 transition-colors border-b-2 ${
                authMode === 'register'
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Provider</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {authError && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* TAB: SIGN IN AS PROVIDER */}
            {authMode === 'login' && (
              <div className="space-y-6">
                <form onSubmit={handleProviderLogin} className="space-y-4 max-w-lg mx-auto">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Provider Email or Phone
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. sharma.electric@example.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Signing In to Provider Dashboard...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Provider Dashboard</span>
                      </>
                    )}
                  </button>
                </form>

                {/* 1-Click Demo Logins for Easy Verification */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      Or Sign In with 1-Click Demo Provider:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin(0)}
                      className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl text-left transition-all flex items-center gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                        ⚡
                      </div>
                      <div className="flex-1 truncate">
                        <span className="font-bold text-xs text-slate-800 block group-hover:text-indigo-600 truncate">
                          Sharma Electrical Works
                        </span>
                        <span className="text-[10px] text-slate-500">Electrician • Bangalore</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin(1)}
                      className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl text-left transition-all flex items-center gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                        ❄️
                      </div>
                      <div className="flex-1 truncate">
                        <span className="font-bold text-xs text-slate-800 block group-hover:text-indigo-600 truncate">
                          CoolBreeze AC Service
                        </span>
                        <span className="text-[10px] text-slate-500">AC Mechanic • Bangalore</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin(2)}
                      className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl text-left transition-all flex items-center gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                        ✨
                      </div>
                      <div className="flex-1 truncate">
                        <span className="font-bold text-xs text-slate-800 block group-hover:text-indigo-600 truncate">
                          SparklePro Cleaners
                        </span>
                        <span className="text-[10px] text-slate-500">Cleaning • Bangalore</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin(3)}
                      className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl text-left transition-all flex items-center gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                        🔧
                      </div>
                      <div className="flex-1 truncate">
                        <span className="font-bold text-xs text-slate-800 block group-hover:text-indigo-600 truncate">
                          QuickFix 24x7 Plumbers
                        </span>
                        <span className="text-[10px] text-slate-500">Plumber • Chennai</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REGISTER AS NEW PROVIDER */}
            {authMode === 'register' && (
              <form onSubmit={handleProviderRegister} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Professional Owner Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business / Shop Name
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Electrical & AC Works"
                        value={regBusinessName}
                        onChange={(e) => setRegBusinessName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Service Trade / Category
                    </label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <select
                      value={regCity}
                      onChange={(e) => handleRegCityChange(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                    >
                      <option value="Bangalore">Bangalore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Min. Visit Charge (₹)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="199"
                      value={regPricingStartsAt}
                      onChange={(e) => setRegPricingStartsAt(Number(e.target.value))}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Direct Calling Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98450 12345"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="919845012345"
                      value={regWhatsapp}
                      onChange={(e) => setRegWhatsapp(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Indiranagar / Koramangala"
                      value={regArea}
                      onChange={(e) => setRegArea(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Street Address / Shop Landmark
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shop #12, 100ft Road"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Working Type & Selectable Working Hours Section */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Service Mode & Operating Schedule
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Working Service Type
                    </label>
                    <select
                      value={regWorkingType}
                      onChange={(e) => setRegWorkingType(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none bg-white"
                    >
                      <option value="On-site / Home Visit">On-site / Home Visit</option>
                      <option value="In-Shop / Workshop">In-Shop / Workshop</option>
                      <option value="Both (Home Visit & In-Shop)">Both (Home Visit & Shop)</option>
                      <option value="24/7 Emergency Service">24/7 Emergency Service</option>
                      <option value="On-Demand / Freelance">On-Demand / Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Select Working Hours
                    </label>
                    <WorkingHoursPicker
                      value={regWorkingHours}
                      onChange={setRegWorkingHours}
                    />
                  </div>
                </div>

                {/* Leaflet Shop Location Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Pinpoint Shop Location on Leaflet Map
                    </label>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      Lat: {regLocation.lat.toFixed(4)}, Lng: {regLocation.lng.toFixed(4)}
                    </span>
                  </div>
                  <LocationPickerMap
                    initialLocation={regLocation}
                    onLocationSelect={setRegLocation}
                    height="200px"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Registering Pro & Pinning to Map...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Provider Account & Launch Visiting Card</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PROVIDER IS LOGGED IN -> FULL PROVIDER DASHBOARD
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Bar with Demo Switcher & Provider Logout */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">Test Demo Pro Profiles:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {providers.slice(0, 6).map((p) => {
            const isSelected = p._id === selectedProviderId;
            return (
              <button
                key={p._id}
                type="button"
                onClick={() => setSelectedProviderId(p._id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.businessName.split(' ')[0]} ({p.category})
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleLogoutProvider}
            className="text-xs px-3 py-1.5 rounded-xl font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/60 ml-auto sm:ml-2 flex items-center gap-1 transition-colors"
            title="Sign out to test unauthenticated login/register screen"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Pro</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Local Professional Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {businessName}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
            {tagline} • Serving {area}, {city} (Within 50km Local Radius)
          </p>
        </div>

        {/* Quick Actions & Availability Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full md:w-auto">
          {/* Work Status Card */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
            <div>
              <span className="block text-[11px] font-semibold text-slate-300">
                Current Status
              </span>
              <span
                className={`text-sm font-extrabold flex items-center gap-1.5 ${
                  isAvailable ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {isAvailable ? 'Available Now' : 'Busy / Off-Duty'}
              </span>
            </div>

            <button
              onClick={handleToggleAvailability}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isAvailable
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/30'
              }`}
            >
              {isAvailable ? 'Switch to Busy' : 'Set Available'}
            </button>
          </div>

          {/* Preview Public Card Modal Button */}
          {onSelectProvider && (
            <button
              onClick={() => onSelectProvider(livePreviewProvider)}
              className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              title="Preview Public Visiting Card Modal"
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Preview Customer View</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {livePreviewProvider.totalCallsReceived || 48}
            </div>
            <div className="text-xs font-medium text-slate-500">
              Direct Phone Calls
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">34</div>
            <div className="text-xs font-medium text-slate-500">
              WhatsApp Chats
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {livePreviewProvider.rating.toFixed(1)}
            </div>
            <div className="text-xs font-medium text-slate-500">
              Avg Rating ({livePreviewProvider.reviewCount} Reviews)
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">1,240</div>
            <div className="text-xs font-medium text-slate-500">
              Card Impressions
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('card_editor')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'card_editor'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Visiting Card & Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'leads'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PhoneForwarded className="w-4 h-4" />
          <span>Customer Leads ({leads.length})</span>
          <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
            New
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Customer Reviews ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('qr_card')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'qr_card'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Share & Print Card</span>
        </button>
      </div>

      {/* Tab 1: Card Editor & Live Preview */}
      {activeTab === 'card_editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Editor */}
          <form
            onSubmit={handleSaveProfile}
            className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Digital Visiting Card Editor
                </h2>
                <p className="text-xs text-slate-500">
                  Edits immediately update the live preview on the right.
                </p>
              </div>

              {savedSuccess && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Changes Saved!
                </span>
              )}
            </div>

            {/* Profile Picture Section */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white ring-2 ring-indigo-500/20">
                    <img
                      src={
                        avatarUrl ||
                        currentProvider?.avatarUrl ||
                        generateAvatarUrl(businessName, category)
                      }
                      alt={businessName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xs transition-transform active:scale-90"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">Visiting Card Profile Photo</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Upload your picture, workshop logo, or choose a trade badge.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                <span>Update Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Trade Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tagline / Speciality
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Trade
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Min. Visit Charge (₹)
                </label>
                <input
                  type="number"
                  value={pricingStartsAt}
                  onChange={(e) => setPricingStartsAt(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Direct Call Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Contact Number
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Area / Locality
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address / Shop Location
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Working Type & Selectable Working Hours in Card Editor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Working Service Type
              </label>
              <select
                value={workingType}
                onChange={(e) => setWorkingType(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none bg-white"
              >
                <option value="On-site / Home Visit">On-site / Home Visit</option>
                <option value="In-Shop / Workshop">In-Shop / Workshop</option>
                <option value="Both (Home Visit & In-Shop)">Both (Home Visit & Shop)</option>
                <option value="24/7 Emergency Service">24/7 Emergency Service</option>
                <option value="On-Demand / Freelance">On-Demand / Freelance</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Operating Schedule & Selectable Working Hours
              </label>
              <WorkingHoursPicker
                value={workingHours}
                onChange={setWorkingHours}
              />
            </div>

            {/* Leaflet Shop Location Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Shop / Service Base on Leaflet Map (Drag pin or click map)
                </label>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                </span>
              </div>
              <LocationPickerMap
                initialLocation={location}
                onLocationSelect={setLocation}
                height="220px"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                About Your Experience & Qualifications
              </label>
              <textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Service & Rate Card Manager */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Manage Services & Standard Rates
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {services.length} services configured
                </span>
              </div>

              <div className="space-y-2">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 text-xs font-medium transition-colors"
                  >
                    <span className="font-bold text-slate-800">{srv.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-indigo-700">₹{srv.price}</span>
                      <span className="text-slate-400 text-[11px]">{srv.unit}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(srv.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Service Item */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Service name (e.g. Copper Pipe Fitting)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="flex-1 text-xs p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Rate (₹)"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="w-24 text-xs p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Unit (per point)"
                  value={newServiceUnit}
                  onChange={(e) => setNewServiceUnit(e.target.value)}
                  className="w-28 text-xs p-2.5 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Rate
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-wait"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Changes to Server...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Update Visiting Card</span>
                </>
              )}
            </button>
          </form>

          {/* Right Live Visiting Card Preview */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Digital Visiting Card Preview
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/provider/${currentProvider?.username || currentProvider?._id || encodeURIComponent(businessName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                  title="Open Visiting Card Page in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Page</span>
                </Link>

                <button
                  type="button"
                  onClick={handleCopyCardLink}
                  className="text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copyToast ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Render Visiting Card */}
            <VisitingCard
              provider={livePreviewProvider}
              onSelect={() => onSelectProvider?.(livePreviewProvider)}
              onContact={(p, type) => onContactProvider?.(p, type)}
            />

            {/* Quick Share Options */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
              <span className="text-xs font-bold text-slate-800 block">
                Share Your Visiting Card
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCardLink}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Web Link</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out ${businessName}'s verified service visiting card on LocalMate: ${window.location.origin}/explore`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Share</span>
                </a>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Hyper-Local 50km Radius Match
              </span>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                When nearby customers within 50km of {city} open the app, your card will show their exact distance (e.g. 1.8 km away) and prioritize your profile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Customer Leads Log */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Incoming Customer Leads & Call Requests
              </h2>
              <p className="text-xs text-slate-500">
                Direct contacts initiated by customers who viewed your visiting card.
              </p>
            </div>
            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
              Total {leads.length} Leads Tracked
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {lead.customerName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      • {lead.timeAgo}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        lead.status === 'New'
                          ? 'bg-rose-100 text-rose-700'
                          : lead.status === 'Connected'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    Requirement: <span className="font-semibold text-slate-900">{lead.serviceNeeded}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">{lead.notes}</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  <select
                    value={lead.status}
                    onChange={(e) =>
                      handleLeadStatusChange(lead.id, e.target.value as any)
                    }
                    className="text-xs font-bold p-2 border border-slate-200 rounded-xl bg-white text-slate-700"
                  >
                    <option value="New">Mark New</option>
                    <option value="Connected">Mark Connected</option>
                    <option value="Completed">Mark Completed</option>
                  </select>

                  <a
                    href={`tel:${lead.phone}`}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Back</span>
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?phone=${lead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Customer Reviews */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Customer Ratings & Feedback
              </h2>
              <p className="text-xs text-slate-500">
                Build your local trust by replying directly to customer reviews.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
              <div>
                <span className="text-xl font-extrabold text-slate-900">
                  {livePreviewProvider.rating.toFixed(1)}
                </span>
                <span className="text-xs text-amber-800 font-bold block">
                  Top Rated Service Pro
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {rev.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "{rev.comment}"
                </p>

                {rev.reply ? (
                  <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-[11px] text-indigo-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Your Public Response:
                    </span>
                    <p className="text-slate-700">{rev.reply}</p>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Write a public response to this review..."
                      value={replyInputs[rev.id] || ''}
                      onChange={(e) =>
                        setReplyInputs({ ...replyInputs, [rev.id]: e.target.value })
                      }
                      className="flex-1 text-xs p-2 border border-slate-200 rounded-xl bg-white focus:border-indigo-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handlePostReply(rev.id)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: QR Code & Print Visiting Card */}
      {activeTab === 'qr_card' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Printable Digital Visiting Card & QR Scanner
            </h2>
            <p className="text-xs text-slate-500">
              Share this QR code with customers or print it for your shop counter. Customers can scan to view your real-time visiting card!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Business Card Layout */}
            <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl space-y-4 border border-indigo-500/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm">
                    LM
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wider text-indigo-300">
                    LocalMate Verified Pro
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {category}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold">{businessName}</h3>
                <p className="text-xs text-indigo-200 font-medium">{tagline}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10 text-slate-300">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">
                    Direct Call
                  </span>
                  <span className="font-bold text-white">{phone}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">
                    Location
                  </span>
                  <span className="font-bold text-white">{area}, {city}</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-indigo-300/80">
                Scan QR or visit localmate.in to view live availability & rates
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200 text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `${window.location.origin}/provider/${
                      currentProvider?.username || currentProvider?._id || encodeURIComponent(businessName)
                    }`
                  )}`}
                  alt="Visiting Card QR Code"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Scan to Open Digital Visiting Card
                </span>
                <span className="text-[11px] text-slate-400">
                  Instant mobile view without installing any app
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Print Business Card
                </button>
                <button
                  type="button"
                  onClick={handleCopyCardLink}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {copyToast ? 'Link Copied!' : 'Copy Share URL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Avatar Modal */}
      <UpdateAvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatarUrl={
          avatarUrl || currentProvider?.avatarUrl || generateAvatarUrl(businessName, category)
        }
        providerName={businessName}
        category={category}
        onSuccess={handleAvatarUpdated}
      />
    </div>
  );
};

export default ProviderDashboardPage;
