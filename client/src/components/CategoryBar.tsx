import React from 'react';
import {
  Zap,
  Wind,
  Sparkles,
  Wrench,
  Hammer,
  Paintbrush,
  Tv,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { useAppDispatch, useAppSelector } from '../store';
import { setFilter } from '../store/slices/providerSlice';

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5" />,
  Wind: <Wind className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
  Hammer: <Hammer className="w-5 h-5" />,
  Paintbrush: <Paintbrush className="w-5 h-5" />,
  Tv: <Tv className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
};

export const CategoryBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeCategory = useAppSelector((state) => state.providers.filters.category);

  const handleSelectCategory = (categoryName: string) => {
    dispatch(setFilter({ category: categoryName }));
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Top Service Categories
        </h2>
        {activeCategory !== 'All' && (
          <button
            onClick={() => handleSelectCategory('All')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {/* "All" button */}
        <button
          onClick={() => handleSelectCategory('All')}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            activeCategory === 'All'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-102'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Services</span>
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.name)}
              className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-102'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-indigo-600'}>
                {iconMap[cat.icon] || <Wrench className="w-4 h-4" />}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
