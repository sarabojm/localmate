import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Briefcase, MapPin, Loader2, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCredentials } from '../store/slices/authSlice';
import { setProviders } from '../store/slices/providerSlice';
import api from '../services/api';
import { CATEGORIES } from '../data/mockData';
import { LocationPickerMap } from './LocationPickerMap';
import { WorkingHoursPicker } from './WorkingHoursPicker';
import { CITY_COORDINATES, generateAvatarUrl } from '../utils/geo';
import { Coordinates, ProviderProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register_customer' | 'register_provider';
  promptMessage?: string;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  promptMessage,
  onClose,
}) => {
  if (!isOpen) return null;

  const dispatch = useAppDispatch();
  const { providers } = useAppSelector((state) => state.providers);

  const [tab, setTab] = useState<'login' | 'register'>(
    initialMode === 'login' ? 'login' : 'register'
  );
  const [role, setRole] = useState<'customer' | 'provider'>(
    initialMode === 'register_provider' ? 'provider' : 'customer'
  );

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Electrician');
  const [city, setCity] = useState('Bangalore');
  const [area, setArea] = useState('');
  const [workingType, setWorkingType] = useState('On-site / Home Visit');
  const [workingHours, setWorkingHours] = useState('9:00 AM - 8:00 PM (Mon - Sat)');
  const [providerCoords, setProviderCoords] = useState<Coordinates>(CITY_COORDINATES.Bangalore);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    if (CITY_COORDINATES[newCity]) {
      setProviderCoords(CITY_COORDINATES[newCity]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        try {
          const res = await api.post('/auth/login', { email, password });
          dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
          onClose();
        } catch (apiErr: any) {
          // If server is not yet running, allow quick demo login
          if (apiErr.code === 'ERR_NETWORK' || !apiErr.response) {
            const demoUser = {
              _id: 'demo-u1',
              name: email.split('@')[0] || 'Demo User',
              email,
              role: (email.includes('provider') ? 'provider' : 'customer') as any,
              phone: '9876543210',
            };
            dispatch(setCredentials({ user: demoUser, token: 'demo_token_123' }));
            onClose();
          } else {
            setError(apiErr.response?.data?.message || 'Login failed. Please check credentials.');
          }
        }
      } else {
        // Registration
        const userAvatar = generateAvatarUrl(name, category);
        try {
          const res = await api.post('/auth/register', {
            name,
            email,
            password,
            role,
            phone,
            businessName,
            category,
            city,
            area,
            location: providerCoords,
            avatar: userAvatar,
            workingType: role === 'provider' ? workingType : undefined,
            workingHours: role === 'provider' ? workingHours : undefined,
          });
          dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
          onClose();
        } catch (apiErr: any) {
          if (apiErr.code === 'ERR_NETWORK' || !apiErr.response) {
            // Demo fallback
            const demoUser = {
              _id: 'demo-new-user-' + Date.now(),
              name,
              email,
              role,
              phone,
              avatar: userAvatar,
            };
            dispatch(setCredentials({ user: demoUser, token: 'demo_token_123' }));

            // If registering as provider, add to active state so they immediately see their card & Leaflet pin
            if (role === 'provider') {
              const newProviderCard: ProviderProfile = {
                _id: 'prov-' + Date.now(),
                userId: demoUser._id,
                businessName: businessName || `${name}'s Services`,
                tagline: `Professional ${category} Specialist`,
                category,
                rating: 5.0,
                reviewCount: 1,
                experienceYears: 4,
                address: area ? `${area}, ${city}` : 'Main Street',
                city,
                area: area || 'Downtown',
                location: providerCoords,
                phone: phone || '+91 98450 00000',
                whatsapp: phone || '919845000000',
                email,
                about: `Dedicated ${category} providing trusted services in ${city}.`,
                avatarUrl: userAvatar,
                isVerified: true,
                isAvailable: true,
                pricingStartsAt: 249,
                workingType,
                workingHours,
                badges: ['Verified Pro', 'Leaflet Listed'],
                services: [
                  { id: 's1', name: 'General Inspection & Fix', price: 249, unit: 'per visit' },
                ],
              };
              dispatch(setProviders([newProviderCard, ...providers]));
            }

            onClose();
          } else {
            setError(apiErr.response?.data?.message || 'Registration failed.');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {tab === 'login' ? 'Welcome Back to LocalMate' : 'Join LocalMate'}
            </h3>
            <p className="text-xs text-indigo-200">
              {tab === 'login'
                ? 'Sign in to access favorites and direct pro contact'
                : 'Connect with local customers or find trusted service pros'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 text-sm font-bold">
          <button
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              tab === 'login'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              tab === 'register'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {promptMessage && (
            <div className="p-3 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-xl flex items-start gap-2 font-medium shadow-xs">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{promptMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                I want to join as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    role === 'customer'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Customer (Hire Pros)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    role === 'provider'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Service Provider (Pro)
                </button>
              </div>
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {tab === 'register' && role === 'provider' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Company Name
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Electrical & AC Works"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trade / Service
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2 px-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
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
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full py-2 px-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Local Area / Locality
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indiranagar / Anna Nagar"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Working Type & Selectable Working Hours */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Working Service Type
                </label>
                <select
                  value={workingType}
                  onChange={(e) => setWorkingType(e.target.value)}
                  className="w-full py-2 px-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none bg-white"
                >
                  <option value="On-site / Home Visit">On-site / Home Visit</option>
                  <option value="In-Shop / Workshop">In-Shop / Workshop</option>
                  <option value="Both (Home Visit & In-Shop)">Both (Home Visit & Shop)</option>
                  <option value="24/7 Emergency Service">24/7 Emergency Service</option>
                  <option value="On-Demand / Freelance">On-Demand / Freelance</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Operating Hours (Select Time Range)
                </label>
                <WorkingHoursPicker
                  value={workingHours}
                  onChange={setWorkingHours}
                  compact
                />
              </div>

              {/* Pinpoint Location on Leaflet Map */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Pinpoint Shop Location on Leaflet Map
                  </label>
                  <span className="text-[10px] text-indigo-600 font-bold">
                    {providerCoords.lat.toFixed(4)}, {providerCoords.lng.toFixed(4)}
                  </span>
                </div>
                <LocationPickerMap
                  initialLocation={providerCoords}
                  onLocationSelect={setProviderCoords}
                  height="180px"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number (for direct customer calls)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60 disabled:cursor-wait mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {tab === 'login'
                    ? 'Authenticating...'
                    : role === 'provider'
                    ? 'Registering Pro & Pinning to Map...'
                    : 'Creating Account...'}
                </span>
              </>
            ) : tab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account & Pin on Map'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
