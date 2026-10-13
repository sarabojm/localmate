import React from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2,
  Copy,
  Share2,
} from 'lucide-react';
import { ProviderProfile } from '../types';
import { Avatar } from './Avatar';

interface ContactModalProps {
  provider: ProviderProfile | null;
  mode: 'call' | 'whatsapp' | 'info';
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  provider,
  mode,
  onClose,
}) => {
  if (!provider) return null;

  const [copied, setCopied] = React.useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(provider.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanWhatsappNumber = (provider.whatsapp || provider.phone).replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    `Hello ${provider.businessName}, I found your contact on LocalMate and would like to inquire about your ${provider.category} services.`
  )}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-300">
              Direct Provider Connect
            </span>
            <h3 className="text-lg font-bold">Contact {provider.businessName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Visiting Card Summary Box */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center gap-4">
            <Avatar
              src={provider.avatarUrl}
              name={provider.businessName}
              category={provider.category}
              size="lg"
              className="w-16 h-16 rounded-xl border border-slate-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  {provider.businessName}
                </h4>
                {provider.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                )}
              </div>
              <p className="text-xs text-slate-500">{provider.category}</p>
              <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {provider.area}, {provider.city}
                </span>
              </div>
            </div>
          </div>

          {/* Working Hours & Availability */}
          <div className="space-y-1.5 px-3 py-2 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Hours: {provider.workingHours || '8:00 AM - 8:00 PM'}</span>
              </div>
              <span className="font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px]">
                {provider.isAvailable ? 'Available Now' : 'Busy Today'}
              </span>
            </div>
            {provider.workingType && (
              <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                <span>Mode:</span>
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-indigo-200/50">
                  {provider.workingType}
                </span>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-1">
            {/* Direct Phone Call */}
            <a
              href={`tel:${provider.phone}`}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-indigo-200 font-semibold">
                    Direct Call
                  </div>
                  <div className="text-sm font-extrabold">{provider.phone}</div>
                </div>
              </div>
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-lg">
                Tap to Call
              </span>
            </a>

            {/* WhatsApp Chat */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-emerald-200 font-semibold">
                    Instant WhatsApp
                  </div>
                  <div className="text-sm font-extrabold">Chat with Provider</div>
                </div>
              </div>
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-lg">
                Open Chat
              </span>
            </a>
          </div>

          {/* Copy number button */}
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>Direct phone number:</span>
            <button
              onClick={handleCopyPhone}
              className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 p-1 rounded-md"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Number'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
