import React, { useState } from 'react';
import {
  Zap,
  Wind,
  Sparkles,
  Wrench,
  Hammer,
  Paintbrush,
  Tv,
  ShieldAlert,
  User,
} from 'lucide-react';

interface AvatarProps {
  src?: string;
  name: string;
  category?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-14 h-14 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-20 h-20 text-lg',
};

const categoryGradients: Record<string, string> = {
  Electrician: 'from-amber-500 to-orange-600',
  'AC Mechanic': 'from-sky-500 to-blue-600',
  'Cleaning Pro': 'from-emerald-500 to-teal-600',
  Cleaning: 'from-emerald-500 to-teal-600',
  Plumber: 'from-blue-600 to-indigo-700',
  Carpenter: 'from-orange-600 to-amber-700',
  'House Painter': 'from-violet-500 to-purple-700',
  Painter: 'from-violet-500 to-purple-700',
  'Appliance Repair': 'from-rose-500 to-red-600',
  'Pest Control': 'from-teal-600 to-emerald-700',
};

const categoryIcons: Record<string, React.ReactNode> = {
  Electrician: <Zap className="w-1/2 h-1/2 text-white" />,
  'AC Mechanic': <Wind className="w-1/2 h-1/2 text-white" />,
  'Cleaning Pro': <Sparkles className="w-1/2 h-1/2 text-white" />,
  Cleaning: <Sparkles className="w-1/2 h-1/2 text-white" />,
  Plumber: <Wrench className="w-1/2 h-1/2 text-white" />,
  Carpenter: <Hammer className="w-1/2 h-1/2 text-white" />,
  'House Painter': <Paintbrush className="w-1/2 h-1/2 text-white" />,
  Painter: <Paintbrush className="w-1/2 h-1/2 text-white" />,
  'Appliance Repair': <Tv className="w-1/2 h-1/2 text-white" />,
  'Pest Control': <ShieldAlert className="w-1/2 h-1/2 text-white" />,
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  category = 'Electrician',
  size = 'lg',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'P';

  const gradient = categoryGradients[category] || 'from-indigo-600 to-purple-600';
  const icon = categoryIcons[category] || <User className="w-1/2 h-1/2 text-white" />;

  // Effective image URL: if src provided and not errored
  const showImage = !!src && !imageError;

  return (
    <div
      className={`relative shrink-0 rounded-2xl overflow-hidden flex items-center justify-center font-extrabold select-none ${
        sizeClasses[size]
      } ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-2xl"
          loading="eager"
        />
      ) : (
        <div
          className={`w-full h-full bg-gradient-to-tr ${gradient} flex flex-col items-center justify-center text-white shadow-inner p-1`}
        >
          {icon}
          <span className="text-[10px] tracking-wider font-extrabold uppercase mt-0.5 opacity-90">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
};
