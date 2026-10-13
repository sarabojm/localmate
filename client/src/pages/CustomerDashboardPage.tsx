import React from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  PhoneCall,
  ShieldCheck,
  Star,
  MapPin,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAppSelector } from '../store';
import { VisitingCard } from '../components/VisitingCard';
import { VisitingCardSkeleton } from '../components/VisitingCardSkeleton';
import { ProviderProfile } from '../types';

interface CustomerDashboardPageProps {
  onSelectProvider: (provider: ProviderProfile) => void;
  onContactProvider: (provider: ProviderProfile, type: 'call' | 'whatsapp') => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  onSelectProvider,
  onContactProvider,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { favoriteIds } = useAppSelector((state) => state.favorites);
  const { providers, isLoading } = useAppSelector((state) => state.providers);

  const favoriteProviders = providers.filter((p) => favoriteIds.includes(p._id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-white/20">
          {user?.name?.charAt(0) || 'C'}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-indigo-200">
            <User className="w-3.5 h-3.5" />
            <span>Verified Customer Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name || 'Local Customer'}</h1>
          <p className="text-xs sm:text-sm text-indigo-200">{user?.email || 'customer@localmate.com'}</p>
        </div>

        <Link
          to="/explore"
          className="px-5 py-3 bg-white text-indigo-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition-all flex items-center gap-2"
        >
          <span>Find Service Pros</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-6 h-6 fill-rose-500/20" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{favoriteIds.length}</div>
            <div className="text-xs font-medium text-slate-500">Bookmarked Service Pros</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">0% Direct Deal</div>
            <div className="text-xs font-medium text-slate-500">No Booking Commission Ever</div>
          </div>
        </div>
      </div>

      {/* Saved Visiting Cards Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">My Saved Service Pros</h2>
          <Link
            to="/favorites"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View All ({favoriteProviders.length})
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Loading saved service pros...</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <VisitingCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : favoriteProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProviders.slice(0, 3).map((p) => (
              <VisitingCard
                key={p._id}
                provider={p}
                onSelect={onSelectProvider}
                onContact={onContactProvider}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-xs text-slate-500">
              You haven't bookmarked any providers yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
