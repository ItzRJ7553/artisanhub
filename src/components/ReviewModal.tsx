import React, { useState } from 'react';
import { X, Star, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.ts';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  productId?: string;
  productTitle?: string;
  orderId?: string;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  productId,
  productTitle,
  orderId,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setError('Please write a brief review of your experience.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.submitReview({
        creator_id: creatorId,
        product_id: productId,
        order_id: orderId,
        rating,
        review_text: reviewText,
      });

      onReviewSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 py-5 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Support Independent Artisans</span>
          </div>
          <h2 className="text-xl font-display font-bold text-stone-900">
            Review for {creatorName}
          </h2>
          {productTitle && (
            <p className="text-xs text-stone-600 mt-0.5">
              Product: <span className="font-semibold text-stone-900">{productTitle}</span>
            </p>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-stone-300 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-stone-700 ml-2">
                  {rating === 5 && 'Outstanding handmade craft (5/5)'}
                  {rating === 4 && 'Great quality & experience (4/5)'}
                  {rating === 3 && 'Average (3/5)'}
                  {rating === 2 && 'Disappointed (2/5)'}
                  {rating === 1 && 'Unsatisfactory (1/5)'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Written Review & Craft Details *
              </label>
              <textarea
                rows={4}
                required
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share your thoughts on the craftsmanship, finish, materials, packaging, and communication..."
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
              />
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified review factor will be factored into the platform ranking system.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? 'Submitting Review...' : 'Post Customer Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
