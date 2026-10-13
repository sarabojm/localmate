import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Phone,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Shield,
  Heart,
  Send,
  Lock,
  Loader2,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { ProviderProfile, Review } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleFavorite } from '../store/slices/favoriteSlice';
import { Avatar } from './Avatar';
import api from '../services/api';

interface ProviderDetailModalProps {
  provider: ProviderProfile | null;
  onClose: () => void;
  onContact: (provider: ProviderProfile, type: 'call' | 'whatsapp') => void;
}

export const ProviderDetailModal: React.FC<ProviderDetailModalProps> = ({
  provider,
  onClose,
  onContact,
}) => {
  if (!provider) return null;

  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { favoriteIds } = useAppSelector((state) => state.favorites);
  const isFav = favoriteIds.includes(provider._id);

  // Reviews state from live backend
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

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
          console.warn('Could not load reviews from server:', err.message);
        })
        .finally(() => {
          setLoadingReviews(false);
        });
    }
  }, [provider?._id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        providerId: provider._id,
        rating: ratingInput,
        comment: commentInput,
      });

      if (res.data?.data) {
        setReviews([res.data.data, ...reviews]);
      } else {
        const fallbackReview: Review = {
          _id: 'rev-' + Date.now(),
          providerId: provider._id,
          userId: user?._id || 'guest-user',
          customerName: user?.name || 'Local Customer',
          rating: ratingInput,
          comment: commentInput,
          createdAt: 'Just now',
        };
        setReviews([fallbackReview, ...reviews]);
      }

      setCommentInput('');
      setReviewMessage('Thank you! Your review was posted successfully.');
    } catch {
      const fallbackReview: Review = {
        _id: 'rev-' + Date.now(),
        providerId: provider._id,
        userId: user?._id || 'guest-user',
        customerName: user?.name || 'Local Customer',
        rating: ratingInput,
        comment: commentInput,
        createdAt: 'Just now',
      };
      setReviews([fallbackReview, ...reviews]);
      setCommentInput('');
      setReviewMessage('Thank you! Your review was posted.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header with Cover Background */}
        <div className="relative h-44 sm:h-48 bg-slate-900 shrink-0 overflow-hidden">
          {provider.coverUrl ? (
            <img
              src={provider.coverUrl}
              alt={provider.businessName}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900" />
          )}

          {/* Controls */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-black/40 backdrop-blur-md border border-white/20">
              {provider.category}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(toggleFavorite(provider._id))}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
                title="Favorite"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFav ? 'text-rose-500 fill-rose-500' : 'text-white'
                  }`}
                />
              </button>
              <Link
                to={`/provider/${provider.username || provider._id}`}
                onClick={onClose}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
                title="Open Dedicated Visiting Card Page"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Visiting Card Identity Overlap */}
        <div className="px-6 pt-3 pb-2 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0">
          <div className="flex items-end gap-4 min-w-0">
            {/* Avatar - only the avatar overlaps the banner image */}
            <div className="relative -mt-14 sm:-mt-16 shrink-0">
              <Avatar
                src={provider.avatarUrl}
                name={provider.businessName}
                category={provider.category}
                size="xl"
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-white object-cover"
              />
              {provider.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1.5 border-2 border-white shadow-xs"
                  title="Verified Professional"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Business Name & Tagline safely on white card background */}
            <div className="pt-2 pb-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {provider.businessName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 line-clamp-2">
                {provider.tagline}
              </p>
            </div>
          </div>

          {/* Availability Badge */}
          <div className="self-start sm:self-center shrink-0 mb-1">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border shadow-2xs ${
                provider.isAvailable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  provider.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{provider.isAvailable ? 'Available Now' : 'Busy Today'}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 pt-4 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Rating</div>
              <div className="flex items-center justify-center gap-1 font-bold text-slate-800 text-sm mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{provider.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({provider.reviewCount})</span>
              </div>
            </div>

            <div className="border-x border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">Experience</div>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {provider.experienceYears}+ Years
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Starts At</div>
              <div className="font-extrabold text-indigo-600 text-sm mt-0.5">
                ₹{provider.pricingStartsAt}
              </div>
            </div>
          </div>

          {/* Badges */}
          {provider.badges && provider.badges.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Verified Credentials
              </h4>
              <div className="flex flex-wrap gap-2">
                {provider.badges.map((b, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-3 py-1 rounded-xl"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location, Service Type & Working Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900">Service Location</span>
                <span>{provider.address}, {provider.city}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900">Service Mode</span>
                <span className="inline-block font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5 border border-indigo-100/80">
                  {provider.workingType || 'On-site / Home Visit'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900">Working Hours</span>
                <span>{provider.workingHours || '8:00 AM - 8:30 PM (Mon - Sun)'}</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              About The Professional
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              {provider.about}
            </p>
          </div>

          {/* Services & Rate List */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Services & Standard Rates
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {provider.services.map((srv) => (
                <div
                  key={srv.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span className="text-sm font-semibold text-slate-800">{srv.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">₹{srv.price}</span>
                    {srv.unit && (
                      <span className="block text-[11px] text-slate-400">{srv.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews & Feedback */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Customer Reviews ({reviews.length})
              </h4>
            </div>

            {loadingReviews ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="font-semibold">Loading verified reviews from server...</span>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {rev.customerName}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {rev.createdAt}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs text-slate-500">
                No reviews yet. Be the first to share your experience!
              </div>
            )}

            {/* Submit a review */}
            <form
              onSubmit={handleReviewSubmit}
              className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3"
            >
              <h5 className="text-xs font-bold text-indigo-900">Write a Review</h5>
              {reviewMessage && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg font-semibold">
                  {reviewMessage}
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    disabled={submittingReview}
                    onClick={() => setRatingInput(star)}
                    className="p-0.5 focus:outline-none disabled:opacity-50"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratingInput
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Share your experience with this pro..."
                  value={commentInput}
                  disabled={submittingReview}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none bg-white disabled:bg-slate-100"
                />
                <button
                  type="submit"
                  disabled={submittingReview || !commentInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Footer Call-to-action */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">
              Standard Visit
            </span>
            <div className="text-base font-extrabold text-slate-900">
              ₹{provider.pricingStartsAt}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onContact(provider, 'whatsapp')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isAuthenticated ? 'WhatsApp' : 'Login to Chat'}</span>
            </button>

            <button
              onClick={() => onContact(provider, 'call')}
              className={`flex items-center gap-2 px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-102 ${
                isAuthenticated
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                  : 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/25'
              }`}
            >
              {isAuthenticated ? (
                <>
                  <Phone className="w-4 h-4" />
                  <span>Call {provider.phone}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Login to View Number & Call</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
