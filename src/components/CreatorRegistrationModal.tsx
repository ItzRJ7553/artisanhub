import React, { useState } from 'react';
import { X, Store, ArrowRight, CheckCircle2, MapPin, Truck, AlertCircle, Sparkles, Image as ImageIcon, Instagram } from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { StoreCategory } from '../types.ts';
import { ImageUploadInput } from './ImageUploadInput.tsx';

interface CreatorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (creatorSlug: string) => void;
}

const CATEGORY_OPTIONS: StoreCategory[] = [
  'Ceramics & Pottery',
  'Botanical Skincare',
  'Textiles & Knits',
  'Woodcraft & Carvings',
  'Candles & Scents',
  'Leather Goods',
  'Art & Prints',
  'Jewelry & Metals',
];

export const CreatorRegistrationModal: React.FC<CreatorRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, reloadUser } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<StoreCategory>('Ceramics & Pottery');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80');

  const [phone, setPhone] = useState('+91 98765 43210');
  const [storeAddress, setStoreAddress] = useState('12, Amer Road, Heritage Art District');
  const [city, setCity] = useState('Jaipur');
  const [state, setState] = useState('Rajasthan');
  const [postalCode, setPostalCode] = useState('302001');
  const [shippingPolicy, setShippingPolicy] = useState('All-India courier dispatch within 2-4 business days. Safe, eco-friendly protective packaging guaranteed.');
  const [returnPolicy, setReturnPolicy] = useState('15-day return policy for unused items in original packaging.');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    if (!slug || slug === storeName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.registerCreator({
        store_name: storeName,
        slug,
        category,
        headline,
        bio,
        instagram_handle: instagramHandle,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        phone,
        store_address: storeAddress,
        city,
        state,
        postal_code: postalCode,
        shipping_policy: shippingPolicy,
        return_policy: returnPolicy,
      });

      await reloadUser();
      onClose();
      onSuccess(res.creator.slug);
    } catch (err: any) {
      setError(err.message || 'Failed to register creator store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden relative max-h-[92vh] flex flex-col">
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
            <Store className="w-5 h-5" />
            <span className="font-display font-bold text-sm">Creator Onboarding</span>
          </div>
          <h2 className="text-xl font-display font-bold text-stone-900">
            Open Your Independent Maker Store
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Sell directly to thousands of patrons with your own branded storefront and order management tools.
          </p>

          {/* Stepper */}
          <div className="flex items-center justify-between mt-4 max-w-sm">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-amber-900 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                1
              </span>
              <span className="text-xs font-semibold text-stone-800">Store Profile</span>
            </div>
            <div className="w-8 h-0.5 bg-stone-200" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-amber-900 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                2
              </span>
              <span className="text-xs font-semibold text-stone-800">Studio Location</span>
            </div>
            <div className="w-8 h-0.5 bg-stone-200" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-amber-900 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                3
              </span>
              <span className="text-xs font-semibold text-stone-800">Shipping</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Store Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Store / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={e => handleStoreNameChange(e.target.value)}
                  placeholder="e.g. Clay & Timber Studio"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Public Storefront URL *
                </label>
                <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-500">
                  <span className="text-stone-400 select-none">artisanhub.com/creator/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-store-name"
                    className="flex-1 bg-transparent font-semibold text-stone-900 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Primary Craft Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as StoreCategory)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tagline / Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="e.g. Small-batch wheel-thrown pottery for mindful mornings"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Instagram Account / Handle
                </label>
                <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-500 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-400/20">
                  <Instagram className="w-4 h-4 text-rose-600 mr-1.5" />
                  <span className="text-stone-400 select-none mr-0.5">@</span>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={e => setInstagramHandle(e.target.value.replace('@', ''))}
                    placeholder="yourstudio_crafts"
                    className="flex-1 bg-transparent font-medium text-stone-900 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Studio Story / About Section
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell patrons about your craft techniques, materials, and passion..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>

              <div className="space-y-4 pt-1">
                <ImageUploadInput
                  label="Studio Logo / Profile Photo"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  aspectRatio="square"
                  helperText="Upload your studio mark, portrait, or artisan seal."
                  presetOptions={[
                    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                  ]}
                />

                <ImageUploadInput
                  label="Storefront Banner Image"
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  aspectRatio="banner"
                  helperText="Showcase your workshop, tools, raw materials, or artisan table."
                  presetOptions={[
                    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
                  ]}
                />
              </div>

              <button
                type="button"
                disabled={!storeName || !slug}
                onClick={() => setStep(2)}
                className="w-full mt-4 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Continue to Studio Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Location & Contact */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Creator Contact Phone * (for order fulfillment & support)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Studio / Workshop Street Address
                </label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={e => setStoreAddress(e.target.value)}
                  placeholder="e.g. 12 Amer Road, Near Jal Mahal"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Jaipur"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="e.g. Rajasthan"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    placeholder="e.g. 302001"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!city || !state}
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>Continue to Shipping Policies</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Shipping & Policies */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Delivery & Shipping Policy *
                </label>
                <textarea
                  rows={3}
                  required
                  value={shippingPolicy}
                  onChange={e => setShippingPolicy(e.target.value)}
                  placeholder="Explain turnaround times, packaging, and carrier methods..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Return & Exchange Policy *
                </label>
                <textarea
                  rows={2}
                  required
                  value={returnPolicy}
                  onChange={e => setReturnPolicy(e.target.value)}
                  placeholder="e.g. 30-day return policy for unused items..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Instant Store Activation</span>
                  <p className="text-stone-600 mt-0.5 leading-relaxed text-[11px]">
                    Once submitted, your store page will be immediately live at <strong className="text-stone-900">/creator/{slug}</strong> and you will have full access to your private Seller Dashboard!
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-amber-900 hover:bg-amber-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Store className="w-4 h-4" />
                      <span>Launch My Creator Storefront</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
