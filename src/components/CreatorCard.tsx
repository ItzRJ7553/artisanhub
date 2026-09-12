import React from 'react';
import { Star, Package, CheckCircle2, MapPin, Sparkles, ArrowRight, Shield, Instagram, ShoppingBag } from 'lucide-react';
import { CreatorProfile } from '../types.ts';
import { formatINR } from '../lib/utils.ts';

interface CreatorCardProps {
  creator: CreatorProfile;
  onClick: () => void;
  onViewProduct?: (productId: string) => void;
  badgeType?: 'featured' | 'popular' | 'new' | 'ranked';
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  onClick,
  onViewProduct,
  badgeType,
}) => {
  const previewProducts = creator.featured_products || [];

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-3xl border border-stone-200 hover:border-amber-700/50 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Studio Banner */}
      <div className="relative h-36 w-full bg-stone-200 overflow-hidden">
        <img
          src={creator.banner_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'}
          alt={creator.store_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badge on Banner */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {badgeType === 'featured' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-stone-950 shadow-xs">
              <Sparkles className="w-3 h-3" /> Featured Studio
            </span>
          )}
          {badgeType === 'new' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-xs">
              Newly Joined
            </span>
          )}
          {badgeType === 'popular' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-900 text-amber-300 shadow-xs">
              Top Rated
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-xs text-white border border-white/20">
            {creator.category}
          </span>
        </div>

        {/* Multi-factor ranking score badge */}
        {creator.rank_score !== undefined && creator.rank_score > 0 && (
          <div className="absolute top-3 right-3 bg-stone-950/90 backdrop-blur-md border border-amber-400/40 text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Score {creator.rank_score}</span>
          </div>
        )}
      </div>

      {/* Profile Header & Info */}
      <div className="p-5 pt-0 relative flex-1 flex flex-col">
        {/* Logo Avatar & Location */}
        <div className="-mt-10 mb-3 flex items-end justify-between">
          <div className="relative">
            <img
              src={creator.logo_url || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=200&q=80'}
              alt={creator.store_name}
              className="w-18 h-18 rounded-2xl object-cover border-4 border-white shadow-lg bg-stone-100 group-hover:ring-2 group-hover:ring-amber-700/30 transition-all"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-700 text-white p-0.5 rounded-full ring-2 ring-white" title="Verified Independent Artisan Studio">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {creator.city && (
              <div className="flex items-center gap-1 text-[11px] text-stone-600 font-semibold bg-stone-100 px-2.5 py-1 rounded-lg">
                <MapPin className="w-3 h-3 text-amber-700" />
                <span>{creator.city}, {creator.state}</span>
              </div>
            )}
            {creator.instagram_handle && (
              <div className="flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                <Instagram className="w-2.5 h-2.5" />
                <span>@{creator.instagram_handle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Store Name & Bio */}
        <h3 className="font-display font-bold text-lg text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
          {creator.store_name}
        </h3>
        <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
          {creator.headline || creator.bio}
        </p>

        {/* Stats Row */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1.5 font-semibold text-stone-900">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span>{creator.avg_rating ? creator.avg_rating.toFixed(1) : 'New'}</span>
            <span className="text-stone-400 font-normal text-[11px]">
              ({creator.total_reviews || 0} reviews)
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
            <Package className="w-3.5 h-3.5 text-stone-400" />
            <span>{creator.product_count || previewProducts.length || 0} creations</span>
          </div>
        </div>

        {/* What this Creator is Selling Preview */}
        {previewProducts.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-stone-100/90">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-amber-700" />
                <span>Selling from this Studio</span>
              </span>
              <span className="text-[10px] text-amber-800 font-semibold">View All ({creator.product_count || previewProducts.length})</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {previewProducts.slice(0, 3).map(prod => (
                <div
                  key={prod.id}
                  onClick={e => {
                    if (onViewProduct) {
                      e.stopPropagation();
                      onViewProduct(prod.id);
                    }
                  }}
                  className="bg-stone-50 hover:bg-amber-50/60 p-1.5 rounded-xl border border-stone-200/80 transition-colors group/item"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-stone-200 mb-1.5">
                    <img
                      src={prod.primary_image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-stone-800 truncate leading-tight">
                    {prod.title}
                  </p>
                  <p className="text-[10px] font-semibold text-amber-900 mt-0.5">
                    {formatINR(prod.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Store CTA Footer */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-900 group-hover:text-amber-950 transition-colors">
          <span>Open Studio Channel & Store</span>
          <div className="w-6 h-6 rounded-full bg-amber-100 group-hover:bg-amber-800 group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
