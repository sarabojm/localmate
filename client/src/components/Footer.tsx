import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Heart, ShieldCheck, PhoneCall, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white">
                Local<span className="text-indigo-500">Mate</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Empowering local electricians, AC mechanics, plumbers, and cleaning professionals with direct customer connections and zero commission.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Pros
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-white transition-colors">
                  Saved Visiting Cards
                </Link>
              </li>
              <li>
                <Link to="/provider/dashboard" className="hover:text-white transition-colors">
                  Pro Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Trades */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-1.5">
              <li>Electrician Services</li>
              <li>AC Mechanic & Gas Charge</li>
              <li>Deep House Cleaning</li>
              <li>Plumbing & Leak Repairs</li>
              <li>Woodwork & Carpentry</li>
            </ul>
          </div>

          {/* Safety & Support */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Trust & Safety
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              All providers are background checked. Deals and payments are handled directly between you and the local professional.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Direct Contact Guarantee</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} LocalMate Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Pro Community Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
