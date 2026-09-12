import React from 'react';
import { Store, ShieldCheck, Heart, Sparkles, Layers, ArrowUpRight } from 'lucide-react';
import { StoreCategory } from '../types.ts';

interface FooterProps {
  onCategorySelect: (cat: StoreCategory) => void;
  onOpenCreatorReg: () => void;
  onExploreClick: () => void;
  onOpenRankingExplainer?: () => void;
  onOpenCloudflareGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onCategorySelect,
  onOpenCreatorReg,
  onExploreClick,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md">
                <Store className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Artisan<span className="text-amber-500">Hub</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              A fair, privacy-first multi-vendor marketplace empowering independent makers, ceramicists, botanists, and craft studios worldwide.
            </p>
            <div className="flex items-center gap-2 text-stone-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Customer PII Protected</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Craft Categories
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {['Ceramics & Pottery', 'Botanical Skincare', 'Textiles & Knits', 'Woodcraft & Carvings', 'Candles & Scents', 'Leather Goods'].map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => onCategorySelect(cat as StoreCategory)}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform & Transparency */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={onExploreClick}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Explore All Creators
                </button>
              </li>
              <li>
                <span className="text-stone-400">Direct Workshop Dispatch</span>
              </li>
              <li>
                <span className="text-stone-400">Encrypted Private Checkout</span>
              </li>
              <li>
                <span className="text-stone-400">Verified Buyer Reviews</span>
              </li>
            </ul>
          </div>

          {/* For Creators */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Independent Sellers
            </h4>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Launch your own branded storefront with custom URL, inventory control, and automated buyer delivery slips.
            </p>
            <button
              onClick={onOpenCreatorReg}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-md inline-flex items-center gap-1.5"
            >
              <span>Open Creator Store</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} ArtisanHub. Crafted for makers and conscious patrons.</p>
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>Direct Studio Fulfillment • Verified Artisans</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
