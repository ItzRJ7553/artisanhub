import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { formatINR } from '../lib/utils.ts';

interface CartDrawerProps {
  onCheckout: () => void;
  onViewCreator: (slug: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onViewCreator }) => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    estimatedShipping,
    totalAmount,
  } = useCart();

  if (!isCartOpen) return null;

  // Group items by creator
  const groupedByCreator: { [creatorId: string]: { creatorName: string; creatorSlug?: string; items: typeof items } } = {};

  items.forEach(item => {
    const cId = item.product.creator_id;
    const cName = item.product.creator?.store_name || 'Independent Creator';
    const cSlug = item.product.creator?.slug;

    if (!groupedByCreator[cId]) {
      groupedByCreator[cId] = { creatorName: cName, creatorSlug: cSlug, items: [] };
    }
    groupedByCreator[cId].items.push(item);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-800" />
              <h2 className="font-display font-bold text-lg text-stone-900">
                Your Artisan Bag ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-stone-800 text-lg">Your bag is empty</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Explore handmade creations from verified independent studios and home makers.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-md"
                >
                  Start Discovering
                </button>
              </div>
            ) : (
              Object.entries(groupedByCreator).map(([creatorId, group]) => (
                <div key={creatorId} className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
                  {/* Creator Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200/60">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                      <Store className="w-3.5 h-3.5 text-amber-700" />
                      <span>{group.creatorName}</span>
                    </div>
                    {group.creatorSlug && (
                      <button
                        onClick={() => {
                          closeCart();
                          onViewCreator(group.creatorSlug!);
                        }}
                        className="text-[11px] text-amber-800 hover:underline font-semibold cursor-pointer"
                      >
                        Visit Store
                      </button>
                    )}
                  </div>

                  {/* Creator Items */}
                  <div className="space-y-3">
                    {group.items.map(item => (
                      <div key={item.product.id} className="flex gap-3 bg-white p-2.5 rounded-xl border border-stone-100 shadow-xs">
                        <img
                          src={item.product.primary_image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80'}
                          alt={item.product.title}
                          className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {item.product.title}
                            </h4>
                            <p className="text-xs font-semibold text-amber-900 mt-0.5">
                              {formatINR(item.product.price)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg px-2 py-0.5 bg-stone-50">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="text-stone-500 hover:text-stone-900 cursor-pointer"
                                title="Decrease"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-stone-800 px-1">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                                title="Increase"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Direct studio shipping:</span>
                    <span className="font-semibold text-stone-700">₹99 flat rate</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-stone-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Artisan Shipping ({Object.keys(groupedByCreator).length} studio{Object.keys(groupedByCreator).length > 1 ? 's' : ''}):</span>
                  <span className="font-semibold text-stone-900">{formatINR(estimatedShipping)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Estimated Total:</span>
                  <span className="text-amber-900">{formatINR(totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Protected by Cloudflare edge privacy & direct maker guarantee</span>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  onCheckout();
                }}
                className="w-full py-3 bg-amber-900 hover:bg-amber-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
