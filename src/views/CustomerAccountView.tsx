import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  MapPin,
  Star,
  Phone,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { Order } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ReviewModal } from '../components/ReviewModal.tsx';
import { formatINR } from '../lib/utils.ts';

interface CustomerAccountViewProps {
  onViewProduct: (productId: string) => void;
  onViewCreator: (slug: string) => void;
  onStartShopping: () => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  onViewProduct,
  onViewCreator,
  onStartShopping,
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean;
    creatorId: string;
    creatorName: string;
    productId?: string;
    productTitle?: string;
    orderId?: string;
  }>({
    isOpen: false,
    creatorId: '',
    creatorName: '',
  });

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders);
    } catch (err: any) {
      setError(err.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Package className="w-12 h-12 text-stone-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-stone-900 mb-2">Sign In Required</h2>
        <p className="text-xs text-stone-600 mb-6">
          Please log in to your account to view your past purchases and track deliveries.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
            <Package className="w-4 h-4 text-amber-700" />
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-stone-900">
            Welcome back, {user.full_name}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {user.email} • {orders.length} orders placed with independent creators
          </p>
        </div>

        <button
          onClick={onStartShopping}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          Explore Marketplace
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-stone-900">
            Order History & Delivery Tracking
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-stone-500">Loading order records...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-stone-800 text-base">No orders placed yet</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              When you purchase handmade goods from our studios, your order status and delivery tracking will appear here.
            </p>
            <button
              onClick={onStartShopping}
              className="mt-6 px-6 py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs rounded-full cursor-pointer shadow-md"
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
                {/* Top order bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-stone-900">Order #{order.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Total Amount</span>
                    <span className="font-bold text-stone-900 text-base">{formatINR(order.total_amount)}</span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-3">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200/70">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                          {item.quantity}x
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-stone-900">{item.product_title}</h4>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {formatINR(item.unit_price)} each
                          </span>
                        </div>
                      </div>

                      {/* Review CTA */}
                      <button
                        onClick={() => {
                          setReviewModalData({
                            isOpen: true,
                            creatorId: order.creator_id,
                            creatorName: order.creator?.store_name || 'Artisan Studio',
                            productId: item.product_id,
                            productTitle: item.product_title,
                            orderId: order.id,
                          });
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>Leave Review</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Delivery Information (Customer view) */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Delivering to: <strong className="text-stone-800">{order.delivery_address}, {order.delivery_city}, {order.delivery_state}</strong></span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Direct-from-studio insured shipment</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalData.isOpen}
        onClose={() => setReviewModalData(prev => ({ ...prev, isOpen: false }))}
        creatorId={reviewModalData.creatorId}
        creatorName={reviewModalData.creatorName}
        productId={reviewModalData.productId}
        productTitle={reviewModalData.productTitle}
        orderId={reviewModalData.orderId}
        onReviewSubmitted={fetchMyOrders}
      />
    </div>
  );
};
