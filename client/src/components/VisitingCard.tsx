import React from 'react';
import {
  Phone,
  MessageCircle,
  Star,
  MapPin,
  CheckCircle2,
  Clock,
  Heart,
  Lock,
} from 'lucide-react';
import { ProviderProfile } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleFavorite } from '../store/slices/favoriteSlice';
import { Avatar } from './Avatar';
import api from '../services/api';

interface VisitingCardProps {
  provider: ProviderProfile;
  onSelect: (provider: ProviderProfile) => void;
  onContact: (provider: ProviderProfile, type: 'call' | 'whatsapp') => void;
}

export const VisitingCard: React.FC<VisitingCardProps> = ({
  provider,
  onSelect,
  onContact,
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { favoriteIds } = useAppSelector((state) => state.favorites);
  const isFav = favoriteIds.includes(provider._id);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFavorite(provider._id));
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Track click on API asynchronously
    api.post(`/providers/${provider._id}/call-click`).catch(() => {});
    onContact(provider, 'call');
  };

  const handleWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    api.post(`/providers/${provider._id}/call-click`).catch(() => {});
    onContact(provider, 'whatsapp');
  };

  return (
    <div
      onClick={() => onSelect(provider)}
      className="visiting-card group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400/80 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      {/* Card Top Header / Visiting Card Header Band */}
      <div className="relative h-24 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-3 flex items-start justify-between text-white overflow-hidden">
        {/* Decorative subtle texture/gradient */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
        
        {/* Availability Badge */}
        <div className="relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md bg-black/40 border border-white/10">
          <span
            className={`w-2 h-2 rounded-full ${
              provider.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className={provider.isAvailable ? 'text-emerald-300' : 'text-amber-300'}>
            {provider.isAvailable ? 'Available Now' : 'Busy Today'}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFav}
          aria-label="Save to favorites"
          className="relative z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-transform active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFav ? 'text-rose-500 fill-rose-500' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Profile Header overlap */}
      <div className="px-5 -mt-10 relative z-10 flex items-end justify-between">
        <div className="relative">
          <Avatar
            src={provider.avatarUrl}
            name={provider.businessName}
            category={provider.category}
            size="lg"
            className="w-16 h-16 rounded-2xl border-4 border-white shadow-md bg-white"
          />
          {provider.isVerified && (
            <div
              className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1 border-2 border-white shadow-xs"
              title="Verified Pro"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Category Pill */}
        <div className="bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold px-3 py-1 rounded-lg">
          {provider.category}
        </div>
      </div>

      {/* Main Visiting Card Body */}
      <div className="px-5 pt-3 pb-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Business & Trade Name */}
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {provider.businessName}
            </h3>
          </div>
          
          <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
            {provider.tagline}
          </p>

          {/* Ratings & Experience Row */}
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{provider.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({provider.reviewCount})
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{provider.experienceYears}+ Yrs Exp</span>
            </div>

            {provider.workingType && (
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-md truncate max-w-[110px]" title={provider.workingType}>
                {provider.workingType}
              </span>
            )}
          </div>

          {/* Location Area & Distance */}
          <div className="flex items-center justify-between gap-1.5 mt-2.5 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">
                {provider.area}, {provider.city}
              </span>
            </div>
            {provider.distanceKm !== undefined && (
              <span className="shrink-0 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                {provider.distanceKm} km away
              </span>
            )}
          </div>

          {/* Services highlight tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {provider.services.slice(0, 3).map((srv) => (
              <span
                key={srv.id}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium truncate max-w-[170px]"
              >
                {srv.name}
              </span>
            ))}
            {provider.services.length > 3 && (
              <span className="text-[10px] text-slate-400 font-semibold self-center">
                +{provider.services.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Visiting Card Actions Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Service Starts
            </span>
            <div className="text-sm font-extrabold text-slate-900">
              ₹{provider.pricingStartsAt}
            </div>
          </div>

          {/* Quick Direct Contact Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleWhatsapp}
              title={isAuthenticated ? "Message on WhatsApp" : "Login to message on WhatsApp"}
              className="relative p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200/80 transition-colors hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              {!isAuthenticated && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-xs">
                  <Lock className="w-2.5 h-2.5" />
                </span>
              )}
            </button>

            <button
              onClick={handleCall}
              title={isAuthenticated ? "Call Directly" : "Login to call provider"}
              className={`flex items-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 ${
                isAuthenticated
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                  : 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/20'
              }`}
            >
              {isAuthenticated ? (
                <>
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Pro</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Login to Call</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
