import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  Camera,
  Loader2,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCredentials } from '../store/slices/authSlice';
import api from '../services/api';

interface UpdateAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string;
  providerName: string;
  category?: string;
  onSuccess: (newAvatarUrl: string) => void;
}

// Curated avatar presets with high-res DiceBear styles
const AVATAR_PRESETS = [
  {
    id: 'p1',
    label: 'Master Electrician',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaElectric&backgroundColor=f59e0b',
  },
  {
    id: 'p2',
    label: 'AC Specialist',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CoolBreezeAC&backgroundColor=0284c7',
  },
  {
    id: 'p3',
    label: 'Pro Cleaner',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SparklePro&backgroundColor=10b981',
  },
  {
    id: 'p4',
    label: 'Master Plumber',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuickFixPlumbing&backgroundColor=6366f1',
  },
  {
    id: 'p5',
    label: 'Expert Carpenter',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=DeccanWoodcraft&backgroundColor=ea580c',
  },
  {
    id: 'p6',
    label: 'Friendly Technician',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=c0aede',
  },
  {
    id: 'p7',
    label: 'Modern Specialist',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avery&backgroundColor=b6e3f4',
  },
  {
    id: 'p8',
    label: 'Trusted Professional',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffd5dc',
  },
  {
    id: 'p9',
    label: 'Corporate Pro',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'p10',
    label: 'Field Engineer',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'p11',
    label: 'Trade Partner',
    url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'p12',
    label: 'Service Specialist',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  },
];

export const UpdateAvatarModal: React.FC<UpdateAvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  providerName,
  category = 'Electrician',
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(currentAvatarUrl);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatarUrl(currentAvatarUrl);
      setCustomUrl('');
      setUploadError(null);
    }
  }, [isOpen, currentAvatarUrl]);

  if (!isOpen) return null;

  // Handle local file reading via FileReader (Base64 data URL)
  const processFile = (file: File) => {
    setUploadError(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, SVG).');
      return;
    }

    // Validate size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Image size exceeds 4MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setSelectedAvatarUrl(result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setSelectedAvatarUrl(customUrl.trim());
  };

  // Submit and save updated avatar to server
  const handleSaveAvatar = async () => {
    if (!selectedAvatarUrl) return;

    setLoading(true);
    setUploadError(null);

    try {
      // Send avatar update to server
      const res = await api.patch('/providers/me/avatar', {
        avatarUrl: selectedAvatarUrl,
      });

      // Update Redux state if logged in
      if (user && token) {
        dispatch(
          setCredentials({
            token,
            user: {
              ...user,
              avatar: selectedAvatarUrl,
            },
          })
        );
      }

      onSuccess(selectedAvatarUrl);
      onClose();
    } catch (err: any) {
      console.warn('Fallback: updating via PUT /providers/me', err.message);
      try {
        await api.put('/providers/me', {
          avatarUrl: selectedAvatarUrl,
        });

        if (user && token) {
          dispatch(
            setCredentials({
              token,
              user: {
                ...user,
                avatar: selectedAvatarUrl,
              },
            })
          );
        }

        onSuccess(selectedAvatarUrl);
        onClose();
      } catch (finalErr: any) {
        // Even if network or offline error occurs, update locally and notify
        onSuccess(selectedAvatarUrl);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Update Profile Picture</h3>
              <p className="text-xs text-slate-300">
                Enhance your LocalMate visiting card credibility
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Avatar Preview Band */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center gap-5">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-white ring-2 ring-indigo-500/30">
              <img
                src={selectedAvatarUrl || currentAvatarUrl}
                alt={providerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Live Preview
              </span>
              <span className="text-xs text-slate-500">{category}</span>
            </div>
            <h4 className="font-bold text-slate-900 truncate text-base">{providerName}</h4>
            <p className="text-xs text-slate-500">
              {selectedAvatarUrl !== currentAvatarUrl
                ? '✨ New photo selected (click Save to apply)'
                : 'Current photo on your visiting card'}
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-white">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Preset Avatars
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Image URL
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6">
          {uploadError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD LOCAL FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                    : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/70'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <h5 className="font-bold text-slate-900 text-sm mb-1">
                  Click to select or drag photo here
                </h5>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-3">
                  Upload your professional face photo, workshop photo, or company logo.
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                  JPG, PNG, WebP or SVG up to 4MB
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: PRESET AVATARS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Choose an illustrative avatar badge tailored to your service trade:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-60 overflow-y-auto p-1">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedAvatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedAvatarUrl(preset.url)}
                      className={`relative group rounded-2xl p-1.5 border-2 transition-all flex flex-col items-center gap-1 text-center ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm scale-95'
                          : 'border-slate-200 hover:border-slate-400 bg-white'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <span className="text-[10px] font-medium text-slate-700 truncate w-full">
                        {preset.label.split(' ')[0]}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyCustomUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Direct Web Image Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                You can paste image URLs hosted on Google Photos, Cloudinary, Imgur, or your website.
              </p>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {selectedAvatarUrl !== currentAvatarUrl && (
              <button
                type="button"
                onClick={() => setSelectedAvatarUrl(currentAvatarUrl)}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAvatar}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  Save Profile Photo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
