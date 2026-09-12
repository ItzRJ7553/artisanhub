import React from 'react';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { formatINR } from '../lib/utils.ts';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onCreatorClick?: (e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onCreatorClick }) => {
  const { addToCart, items } = useCart();
  const cartItem = items.find(it => it.product.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const hasDiscount = product.compare_price && product.compare_price > product.price;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-stone-200 hover:border-amber-700/40 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        <img
          src={product.primary_image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.is_featured && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-xs">
              Artisan Pick
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
              Sale
            </span>
          )}
        </div>

        {/* Stock status badge */}
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3 bg-amber-950/80 backdrop-blur-xs text-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
            Only {product.stock} left in stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-stone-700">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick Add to Cart Button on Hover */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-3 right-3 p-2.5 rounded-full shadow-lg transition-all duration-200 cursor-pointer ${
              isInCart
                ? 'bg-emerald-600 text-white'
                : 'bg-white/95 text-stone-800 hover:bg-amber-800 hover:text-white group-hover:scale-105'
            }`}
            title={isInCart ? `In Cart (${cartItem?.quantity})` : 'Add to Cart'}
          >
            {isInCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Creator Store Chip */}
          {product.creator && (
            <div
              onClick={e => {
                if (onCreatorClick) {
                  e.stopPropagation();
                  onCreatorClick(e);
                }
              }}
              className="text-[11px] font-semibold text-stone-500 hover:text-amber-800 transition-colors line-clamp-1 mb-1"
            >
              by {product.creator.store_name}
            </div>
          )}

          {/* Title */}
          <h4 className="font-semibold text-stone-900 text-sm group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h4>
        </div>

        {/* Price and Category footer */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-stone-900 text-base">
              {formatINR(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                {formatINR(product.compare_price)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-stone-400 font-medium truncate max-w-[90px]">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
};
