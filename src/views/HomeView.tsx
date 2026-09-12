import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Store,
  ShieldCheck,
  Package,
  Star,
  Layers,
  Heart,
  TrendingUp,
  Clock,
  Compass,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { CreatorProfile, Product, StoreCategory } from '../types.ts';
import { api } from '../services/api.ts';
import { CreatorCard } from '../components/CreatorCard.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

interface HomeViewProps {
  onViewCreator: (slug: string) => void;
  onViewProduct: (productId: string) => void;
  onExploreCreators: () => void;
  onOpenCreatorReg: () => void;
  onOpenRankingExplainer: () => void;
  searchQuery: string;
  onClearSearch?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onViewCreator,
  onViewProduct,
  onExploreCreators,
  onOpenCreatorReg,
  onOpenRankingExplainer,
  searchQuery,
  onClearSearch,
}) => {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productSort, setProductSort] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [creatorsRes, productsRes] = await Promise.all([
          api.getCreators({
            search: searchQuery || undefined,
          }),
          api.getProducts({
            search: searchQuery || undefined,
          }),
        ]);
        setCreators(creatorsRes.creators);
        setProducts(productsRes.products);
      } catch (err) {
        console.error('Failed to load marketplace data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchQuery]);

  // Slices for different sections
  const featuredCreators = creators.filter(c => c.is_featured);
  const topRankedCreators = [...creators].sort((a, b) => (b.rank_score || 0) - (a.rank_score || 0)).slice(0, 4);
  const newlyJoinedCreators = [...creators]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const sortedProducts = [...products].sort((a, b) => {
    if (productSort === 'price-asc') return a.price - b.price;
    if (productSort === 'price-desc') return b.price - a.price;
    if (productSort === 'rating') return (b.rating_average || 0) - (a.rating_average || 0);
    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
  });

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 8);
  const displayProducts = products.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      {/* PRODUCTS CATALOG SECTION */}
      <section id="products-catalog">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
          <div>
            {searchQuery ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-stone-800 font-medium flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-700" />
                  <span>Search results for: <strong className="text-stone-900 font-bold">"{searchQuery}"</strong></span>
                </div>
                {onClearSearch && (
                  <button
                    onClick={onClearSearch}
                    className="inline-flex items-center gap-1 text-xs text-stone-700 hover:text-stone-900 font-bold bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
                  Artisan Marketplace
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Handcrafted pieces directly from independent studios and creators
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full">
              {sortedProducts.length} Items
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 font-medium">Sort:</span>
              <select
                value={productSort}
                onChange={e => setProductSort(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl font-semibold text-stone-800 outline-hidden shadow-xs cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-72 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
              <Package className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <p className="text-stone-800 font-bold text-base">No products found</p>
              <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
                Try searching for general craft terms or clear your search query.
              </p>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
                <Store className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold text-stone-900">
                  No products listed yet
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                  The marketplace is fresh with zero fake listings. Register your creator studio to list your handmade creations.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onOpenCreatorReg}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Register Creator Studio</span>
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {sortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onViewProduct(product.id)}
                onCreatorClick={() => product.creator && onViewCreator(product.creator.slug)}
              />
            ))}
          </div>
        )}
      </section>

      {/* FEATURED CREATOR STUDIOS (When not searching and creators exist) */}
      {!searchQuery && featuredCreators.length > 0 && (
        <section className="pt-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900">
                Featured Studios
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Meet the makers behind the craft
              </p>
            </div>
            <button
              onClick={onExploreCreators}
              className="text-xs font-semibold text-stone-800 hover:text-stone-900 flex items-center gap-1 cursor-pointer bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>View All ({creators.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCreators.map(creator => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                badgeType="featured"
                onClick={() => onViewCreator(creator.slug)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
