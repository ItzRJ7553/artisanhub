import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CheckCircle2, Truck, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { formatINR } from '../lib/utils.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (orders: any[]) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  const { items, clearCart, subtotal, estimatedShipping, totalAmount } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryPostal, setDeliveryPostal] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user?.full_name && !customerName) {
      setCustomerName(user.full_name);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const orderPayload = {
        items: items.map(it => ({
          productId: it.product.id,
          quantity: it.quantity,
        })),
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        delivery_state: deliveryState,
        delivery_postal: deliveryPostal,
        delivery_notes: deliveryNotes,
      };

      const res = await api.createOrder(orderPayload);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
      onClose();
      onOrderCompleted(res.orders);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 py-5 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center gap-2 text-amber-800 mb-1">
            <Truck className="w-5 h-5" />
            <span className="font-display font-bold text-sm">Artisan Checkout & Delivery</span>
          </div>
          <h2 className="text-xl font-display font-bold text-stone-900">
            Complete Your Purchase
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Your delivery information is encrypted and only shared with the specific artisans fulfilling your order.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Privacy reassurance callout */}
          <div className="mb-5 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Strict Privacy Protection</span>
              <p className="text-stone-600 mt-0.5 leading-relaxed text-[11px]">
                Your phone number and physical address are locked to the specific artisan(s) fulfilling your pieces. Other sellers and the public cannot access your details.
              </p>
            </div>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contact Phone Number * (10-digit mobile for delivery updates)
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Street Address / House & Building Name *
              </label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder="Flat / House No., Floor, Street name, Locality"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryCity}
                  onChange={e => setDeliveryCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryState}
                  onChange={e => setDeliveryState(e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryPostal}
                  onChange={e => setDeliveryPostal(e.target.value)}
                  placeholder="e.g. 560038"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={deliveryNotes}
                onChange={e => setDeliveryNotes(e.target.value)}
                placeholder="Landmark, security gate instructions, gift message..."
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
              />
            </div>

            {/* Order summary box */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items ({items.reduce((s, i) => s + i.quantity, 0)}):</span>
                <span className="font-semibold text-stone-900">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Direct Studio Shipping (All-India):</span>
                <span className="font-semibold text-stone-900">{formatINR(estimatedShipping)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Amount (incl. taxes):</span>
                <span className="text-amber-900">{formatINR(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order & Pay with UPI / Card ({formatINR(totalAmount)})</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
