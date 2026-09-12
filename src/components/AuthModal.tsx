import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Store, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  initialRole?: 'customer' | 'creator';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  initialRole = 'customer',
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [role, setRole] = useState<'customer' | 'creator'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      if (initialRole) setRole(initialRole);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTab, initialRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        onClose();
        if (onSuccess) onSuccess();
      } else if (tab === 'register') {
        await register({
          email,
          password,
          full_name: fullName,
          role,
        });
        onClose();
        if (onSuccess) onSuccess();
      } else if (tab === 'forgot') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, new_password: password }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Password reset failed');
        setSuccessMsg('Password updated successfully! You can now log in.');
        setTab('login');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 bg-stone-50 border-b border-stone-100">
          <div className="flex items-center gap-2 text-amber-800 mb-1">
            <Store className="w-5 h-5" />
            <span className="font-display font-bold text-sm">ArtisanHub Authentication</span>
          </div>
          <h2 className="text-xl font-display font-bold text-stone-900">
            {tab === 'login' && 'Welcome Back'}
            {tab === 'register' && 'Create Your Account'}
            {tab === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {tab === 'login' && 'Log in to manage your orders, reviews, or seller dashboard.'}
            {tab === 'register' && 'Join as a patron of independent crafts or start selling today.'}
            {tab === 'forgot' && 'Enter your account email and new password.'}
          </p>

          {/* Tab Switcher */}
          {tab !== 'forgot' && (
            <div className="flex bg-stone-200/70 p-1 rounded-xl mt-4">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tab === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tab === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Account Purpose
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        role === 'customer'
                          ? 'border-amber-800 bg-amber-50 text-amber-950 font-bold'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="block font-semibold">🛒 Buyer / Patron</span>
                      <span className="text-[10px] text-stone-500 font-normal">Discover & shop handmade</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('creator')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        role === 'creator'
                          ? 'border-amber-800 bg-amber-50 text-amber-950 font-bold'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="block font-semibold">🎨 Creator / Seller</span>
                      <span className="text-[10px] text-stone-500 font-normal">Create own store & sell</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  {tab === 'forgot' ? 'New Password' : 'Password'}
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] text-amber-800 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>
                    {tab === 'login' && 'Sign In to Account'}
                    {tab === 'register' && 'Complete Registration'}
                    {tab === 'forgot' && 'Reset & Update Password'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
