import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  Heart,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/slices/authSlice';

interface NavbarProps {
  onOpenAuth: (initialMode?: 'login' | 'register_customer' | 'register_provider') => void;
  onOpenLocationPrompt?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { favoriteIds } = useAppSelector((state) => state.favorites);
  const { filters } = useAppSelector((state) => state.providers);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide customer-facing exploration & favorites when a provider is logged in OR when currently on the provider portal
  const isProviderPortal = location.pathname.startsWith('/provider');
  const isProviderLoggedIn = isAuthenticated && user?.role === 'provider';
  const hideCustomerNav = isProviderLoggedIn || isProviderPortal;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                Local<span className="text-indigo-600">Mate</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-wider uppercase text-indigo-500/80">
                Direct Pro Connect
              </span>
            </div>
          </Link>

          {/* Navigation & Action Links */}
          <div className="hidden md:flex items-center gap-3">
            {/* Explore Pros - Hidden for Providers & on Provider Portal */}
            {!hideCustomerNav && (
              <Link
                to="/explore"
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Explore Pros
              </Link>
            )}

            {/* Provider Portal Link */}
            <Link
              to="/provider/dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors border ${
                isProviderPortal
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Provider Portal</span>
            </Link>

            {/* Favorites link with badge - Hidden for Providers & on Provider Portal */}
            {!hideCustomerNav && (
              <Link
                to="/favorites"
                className="relative p-2 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-sm font-medium"
                title="Saved Providers"
              >
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                {favoriteIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {favoriteIds.length}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Buttons / Profile Menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {user.role === 'provider' && (
                  <Link
                    to="/provider/dashboard"
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Pro Card & Dashboard
                  </Link>
                )}

                {user.role === 'customer' && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-600" />
                    My Account
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register_provider')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all hover:shadow"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Join as Pro
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {!hideCustomerNav && (
              <Link to="/favorites" className="relative p-2 text-rose-500">
                <Heart className="w-5 h-5 fill-rose-500/20" />
                {favoriteIds.length > 0 && (
                  <span className="absolute 0 top-0 right-0 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {favoriteIds.length}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <div className="flex flex-col gap-2 pt-1">
            {!hideCustomerNav && (
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Explore All Service Pros
              </Link>
            )}
            <Link
              to="/provider/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-lg flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Provider Portal & Card</span>
            </Link>
            {!hideCustomerNav && (
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Saved Favorites</span>
                <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {favoriteIds.length}
                </span>
              </Link>
            )}

            {isAuthenticated && user ? (
              <>
                {user.role === 'provider' && (
                  <Link
                    to="/provider/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-lg"
                  >
                    Pro Card & Dashboard
                  </Link>
                )}
                {user.role === 'customer' && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 rounded-lg"
                  >
                    My Account
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="py-2.5 text-center text-sm font-bold text-slate-700 border border-slate-200 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register_provider');
                  }}
                  className="py-2.5 text-center text-sm font-bold text-white bg-indigo-600 rounded-xl"
                >
                  Join as Pro
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
