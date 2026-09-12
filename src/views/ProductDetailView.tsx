import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  Heart,
  Share2,
} from 'lucide-react';
import { Product, Review } from '../types.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { formatINR } from '../lib/utils.ts';

interface ProductDetailViewProps {
  productId: string;
  onBack: () => void;
  onViewCreator: (slug: string) => void;
  onViewProduct: (productId: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onBack,
  onViewCreator,
  onViewProduct,
}) => {
  const { addToCart, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getProductById(productId);
        setProduct(res.product);
        setReviews(res.reviews);
        setSelectedImage(res.product.primary_image || (res.product.images?.[0] ?? ''));

        // Fetch other products by the same creator
        if (res.product.creator_id) {
          const relRes = await api.getProducts({ creatorId: res.product.creator_id });
          setRelatedProducts(relRes.products.filter(p => p.id !== productId));
        }
      } catch (err: any) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-3 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-500 font-medium">Loading handmade product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-stone-600 mb-6">{error || 'This product does not exist.'}</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-full cursor-pointer"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const galleryImages = [
    product.primary_image,
    ...(product.images || []),
  ].filter(Boolean) as string[];

  const uniqueGallery = Array.from(new Set(galleryImages));

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-12">
      {/* Top breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 p-2 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          <span>{copiedLink ? 'Link Copied' : 'Share Item'}</span>
        </button>
      </div>

      {/* Main product view grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left column: Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm relative">
            <img
              src={selectedImage || product.primary_image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full shadow-md">
                Special Offer
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {uniqueGallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {uniqueGallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === img ? 'border-amber-800 ring-2 ring-amber-800/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`view-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Purchase & Creator Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Creator Tag & Title */}
          <div>
            {product.creator && (
              <div
                onClick={() => onViewCreator(product.creator!.slug)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-700 transition-colors cursor-pointer bg-amber-50 px-3 py-1 rounded-full mb-2"
              >
                <Store className="w-3.5 h-3.5" />
                <span>By {product.creator.store_name}</span>
                <CheckCircle2 className="w-3 h-3 text-amber-700 ml-0.5" />
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 leading-tight">
              {product.title}
            </h1>

            {/* Rating pill */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-700">
                {product.creator?.avg_rating ? product.creator.avg_rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-xs text-stone-400">({reviews.length} reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-3xl font-bold text-stone-900">
              {formatINR(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-base text-stone-400 line-through">
                {formatINR(product.compare_price)}
              </span>
            )}
            <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 ml-auto">
              In Stock: {product.stock} units
            </span>
          </div>

          {/* Add to cart / Quantity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity selector */}
              <div className="flex items-center border border-stone-300 rounded-xl px-3 py-2 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-stone-800 px-4 select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : `Add to Bag • ${formatINR(product.price * quantity)}`}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-stone-200 pt-5 space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              About This Creation
            </h3>
            <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Direct maker guarantee callout */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs text-stone-700">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">Direct Studio Shipping (₹99 flat rate)</span>
                <p className="text-[11px] text-stone-500">Shipped with care directly from {product.creator?.store_name || 'artisan studio'} across India.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">Artisan Privacy & Quality Guarantee</span>
                <p className="text-[11px] text-stone-500">Customer delivery details strictly locked to this seller.</p>
              </div>
            </div>
          </div>

          {/* Creator Mini Card */}
          {product.creator && (
            <div
              onClick={() => onViewCreator(product.creator!.slug)}
              className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-700/40 shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <img
                src={product.creator.logo_url || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=200&q=80'}
                alt={product.creator.store_name}
                className="w-12 h-12 rounded-xl object-cover border border-stone-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-stone-900 text-xs truncate group-hover:text-amber-800">
                    {product.creator.store_name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <p className="text-[11px] text-stone-500 truncate">{product.creator.city}, {product.creator.state}</p>
              </div>
              <span className="text-xs font-semibold text-amber-900 group-hover:underline">Visit Store</span>
            </div>
          )}
        </div>
      </div>

      {/* Related Products from same creator */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-stone-200 pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-stone-900">
              More from {product.creator?.store_name}
            </h3>
            {product.creator && (
              <button
                onClick={() => onViewCreator(product.creator!.slug)}
                className="text-xs font-bold text-amber-900 hover:underline cursor-pointer"
              >
                View full storefront ({relatedProducts.length + 1})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {relatedProducts.slice(0, 4).map(relProd => (
              <ProductCard
                key={relProd.id}
                product={{ ...relProd, creator: product.creator }}
                onClick={() => onViewProduct(relProd.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
