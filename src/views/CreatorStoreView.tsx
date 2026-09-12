import React, { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  Package,
  Shield,
  Truck,
  RotateCcw,
  CheckCircle2,
  Phone,
  Mail,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  Share2,
  Check,
  Search,
  Instagram,
  ShoppingBag,
} from 'lucide-react';
import { CreatorProfile, Product, Review } from '../types.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { ReviewModal } from '../components/ReviewModal.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface CreatorStoreViewProps {
  slug: string;
  onBack: () => void;
  onViewProduct: (productId: string) => void;
  onOpenAuth: () => void;
}

export const CreatorStoreView: React.FC<CreatorStoreViewProps> = ({
  slug,
  onBack,
  onViewProduct,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'policies' | 'reviews'>('products');
  const [storeSearch, setStoreSearch] = useState('');
  const [selectedStoreCat, setSelectedStoreCat] = useState<string>('All');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchCreatorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCreatorBySlug(slug);
      setCreator(res.creator);
      setProducts(res.products);
      setReviews(res.reviews);
    } catch (err: any) {
      setError(err.message || 'Storefront not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorData();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-3 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-500 font-medium">Loading artisan storefront...</p>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Artisan Storefront Not Found</h2>
        <p className="text-sm text-stone-600 mb-6">The creator slug "{slug}" does not exist or may have moved.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-full cursor-pointer"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  // Filter products within store
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(storeSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(storeSearch.toLowerCase());
    const matchesCategory = selectedStoreCat === 'All' || p.category === selectedStoreCat;
    return matchesSearch && matchesCategory;
  });

  const uniqueStoreCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="pb-24">
      {/* Top Breadcrumb navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      {/* Hero Banner Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden bg-stone-200 shadow-md">
          <img
            src={creator.banner_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1400&q=80'}
            alt={creator.store_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

          {/* Share button */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 bg-white/90 hover:bg-white text-stone-800 rounded-full shadow-md backdrop-blur-xs transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share Store</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Store Profile Bar */}
        <div className="relative -mt-16 sm:-mt-20 px-4 sm:px-8 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Logo */}
            <div className="relative">
              <img
                src={creator.logo_url || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=300&q=80'}
                alt={creator.store_name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-stone-100 ring-1 ring-stone-900/10"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-700 text-white p-1 rounded-full ring-3 ring-white" title="Verified Independent Artisan">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Title & Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  {creator.category}
                </span>
                {creator.city && (
                  <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {creator.city}, {creator.state}
                  </span>
                )}
                {creator.instagram_handle && (
                  <a
                    href={`https://instagram.com/${creator.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                  >
                    <Instagram className="w-3 h-3 text-rose-600" />
                    <span>@{creator.instagram_handle.replace('@', '')}</span>
                  </a>
                )}
                {creator.rank_score !== undefined && creator.rank_score > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-900 text-amber-300 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" />
                    Rank Score {creator.rank_score}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
                {creator.store_name}
              </h1>

              {creator.headline && (
                <p className="text-sm text-stone-600 max-w-2xl">{creator.headline}</p>
              )}
            </div>
          </div>

          {/* Quick Rating & Order Stats Box */}
          <div className="flex items-center gap-6 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 self-start md:self-auto">
            <div>
              <div className="flex items-center gap-1 font-bold text-base text-stone-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{creator.avg_rating ? creator.avg_rating.toFixed(1) : 'New'}</span>
              </div>
              <span className="text-[11px] text-stone-500">{creator.total_reviews || 0} reviews</span>
            </div>
            <div className="h-8 w-px bg-stone-200" />
            <div>
              <div className="font-bold text-base text-stone-900">{creator.completed_orders || 0}</div>
              <span className="text-[11px] text-stone-500">Orders Fulfilled</span>
            </div>
            <div className="h-8 w-px bg-stone-200" />
            <div>
              <div className="font-bold text-base text-stone-900">{products.length}</div>
              <span className="text-[11px] text-stone-500">Handmade Items</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-stone-200 mt-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'border-amber-800 text-amber-950'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'about'
                  ? 'border-amber-800 text-amber-950'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>About The Artisan</span>
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'policies'
                  ? 'border-amber-800 text-amber-950'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Shipping & Policies</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'border-amber-800 text-amber-950'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Customer Reviews ({reviews.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (!user) onOpenAuth();
              else setIsReviewModalOpen(true);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 text-amber-600" />
            <span>Write Review</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="mt-8 space-y-6">
            {/* Store search & category filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                {uniqueStoreCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedStoreCat(cat)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                      selectedStoreCat === cat
                        ? 'bg-amber-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={storeSearch}
                  onChange={e => setStoreSearch(e.target.value)}
                  placeholder={`Search ${creator.store_name}...`}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-full focus:bg-white focus:outline-none focus:border-amber-700"
                />
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
                <Package className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-700">No products found in this section.</p>
                <p className="text-xs text-stone-500 mt-1">Try clearing your search filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={{ ...product, creator }}
                    onClick={() => onViewProduct(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ABOUT THE ARTISAN */}
        {activeTab === 'about' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-200">
                <h3 className="font-display font-bold text-xl text-stone-900 mb-4">
                  Our Story & Craft Process
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {creator.bio || 'This creator has not added their detailed story yet.'}
                </p>
              </div>
            </div>

            {/* Studio Info Card */}
            <div className="space-y-4">
              <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 space-y-4 text-xs">
                <h4 className="font-bold text-stone-900 text-sm">Studio Location & Contact</h4>
                {creator.store_address && (
                  <div className="flex items-start gap-2.5 text-stone-600">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-stone-800">{creator.store_address}</p>
                      <p>{creator.city}, {creator.state} {creator.postal_code}</p>
                    </div>
                  </div>
                )}
                {creator.phone && (
                  <div className="flex items-center gap-2.5 text-stone-600">
                    <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{creator.phone}</span>
                  </div>
                )}
                {creator.instagram_handle && (
                  <div className="flex items-center gap-2.5 text-stone-600">
                    <Instagram className="w-4 h-4 text-rose-600 shrink-0" />
                    <a
                      href={`https://instagram.com/${creator.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose-700 hover:underline font-semibold"
                    >
                      instagram.com/{creator.instagram_handle.replace('@', '')}
                    </a>
                  </div>
                )}
                {creator.user?.email && (
                  <div className="flex items-center gap-2.5 text-stone-600">
                    <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{creator.user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: POLICIES */}
        {activeTab === 'policies' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                <Truck className="w-5 h-5" />
                <h3>Delivery & Shipping Policy</h3>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                {creator.shipping_policy || 'Standard shipping: 3-5 business days from studio location.'}
              </p>
            </div>

            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                <RotateCcw className="w-5 h-5" />
                <h3>Returns & Exchanges</h3>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                {creator.return_policy || '30-day return policy for unused, undamaged handmade items.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-stone-900">
                  Patron Reviews & Feedback
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Verified reviews directly influence creator ranking calculations.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!user) onOpenAuth();
                  else setIsReviewModalOpen(true);
                }}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-full transition-colors cursor-pointer shadow-sm"
              >
                Write a Review
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
                <MessageSquare className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-700">No reviews yet for this studio.</p>
                <p className="text-xs text-stone-500 mt-1">Be the first to leave feedback after placing an order!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                          {review.user?.full_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">{review.user?.full_name || 'Artisan Patron'}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {review.is_verified_purchase && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded-full">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">{review.review_text}</p>

                    {/* Creator Reply (if present) */}
                    {review.creator_reply && (
                      <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 text-xs mt-2">
                        <span className="font-bold text-amber-900 block mb-0.5">
                          Reply from {creator.store_name}:
                        </span>
                        <p className="text-stone-700 text-[11px]">{review.creator_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        creatorId={creator.id}
        creatorName={creator.store_name}
        onReviewSubmitted={fetchCreatorData}
      />
    </div>
  );
};
