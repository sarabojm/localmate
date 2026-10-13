import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, ArrowRight, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { clearFavorites } from '../store/slices/favoriteSlice';
import { VisitingCard } from '../components/VisitingCard';
import { VisitingCardSkeleton } from '../components/VisitingCardSkeleton';
import { ProviderProfile } from '../types';

interface FavoritesPageProps {
  onSelectProvider: (provider: ProviderProfile) => void;
  onContactProvider: (provider: ProviderProfile, type: 'call' | 'whatsapp') => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  onSelectProvider,
  onContactProvider,
}) => {
  const dispatch = useAppDispatch();
  const { favoriteIds } = useAppSelector((state) => state.favorites);
  const { providers, isLoading } = useAppSelector((state) => state.providers);

  const favoriteProviders = providers.filter((p) => favoriteIds.includes(p._id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Saved Visiting Cards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Favorite Service Pros ({favoriteProviders.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quickly access your saved electrician, AC mechanic, and trusted local pros.
          </p>
        </div>

        {!isLoading && favoriteProviders.length > 0 && (
          <button
            onClick={() => dispatch(clearFavorites())}
            className="self-start sm:self-auto text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
          >
            Clear All Favorites
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            <span>Loading your saved favorite service pros...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <VisitingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : favoriteProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProviders.map((provider) => (
            <VisitingCard
              key={provider._id}
              provider={provider}
              onSelect={onSelectProvider}
              onContact={onContactProvider}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Favorites Saved Yet</h3>
          <p className="text-xs text-slate-500">
            You haven't bookmarked any service pros yet. Click the heart icon on any provider's visiting card to keep them handy here!
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-all"
          >
            <span>Explore Service Pros</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
