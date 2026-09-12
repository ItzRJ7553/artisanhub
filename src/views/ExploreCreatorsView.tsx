import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  SlidersHorizontal,
  Star,
  Sparkles,
  TrendingUp,
  Package,
  Clock,
  ArrowUpDown,
  X,
  Store,
} from 'lucide-react';
import { CreatorProfile } from '../types.ts';
import { api } from '../services/api.ts';
import { CreatorCard } from '../components/CreatorCard.tsx';

interface ExploreCreatorsViewProps {
  onViewCreator: (slug: string) => void;
  onOpenCreatorReg: () => void;
  onOpenRankingExplainer?: () => void;
}

export const ExploreCreatorsView: React.FC<ExploreCreatorsViewProps> = ({
  onViewCreator,
  onOpenCreatorReg,
  onOpenRankingExplainer,
}) => {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'rating' | 'orders' | 'newest'>('rank');

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      try {
        const res = await api.getCreators({
          search: search || undefined,
          sort: sortBy,
        });
        setCreators(res.creators);
      } catch (err) {
        console.error('Failed to load creators directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, [search, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900">
            Artisan Studios
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Discover verified craft studios and connect directly with independent makers
          </p>
        </div>
        <button
          onClick={onOpenCreatorReg}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Register a Studio</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by studio name, location, craft, bio..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-stone-50 border border-stone-200 rounded-full focus:bg-white focus:outline-hidden focus:border-amber-700"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort by:</span>
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden font-semibold text-stone-800 cursor-pointer"
            >
              <option value="rank">Multi-Factor Rank Score</option>
              <option value="rating">Highest Star Rating</option>
              <option value="orders">Most Orders Completed</option>
              <option value="newest">Newly Joined Studios</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Creators */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-stone-900 text-sm">
            Showing {creators.length} Artisan Studios
          </h2>
          {onOpenRankingExplainer && (
            <button
              onClick={onOpenRankingExplainer}
              className="text-xs text-amber-900 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Ranking Algorithm Transparency</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : creators.length === 0 ? (
          search ? (
            <div className="text-center py-16 bg-stone-50 rounded-3xl border border-stone-200 p-8">
              <Compass className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <h3 className="font-bold text-stone-800 text-sm">No creators found matching "{search}"</h3>
              <p className="text-xs text-stone-500 mt-1">Try resetting your search query or choosing another craft term.</p>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
                <Store className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold text-stone-900">No studios registered yet</h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                  The marketplace is fresh with zero fake data. Register your artisan studio to showcase your handmade craft.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={onOpenCreatorReg}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Register Your Studio</span>
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map(creator => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                badgeType="ranked"
                onClick={() => onViewCreator(creator.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
