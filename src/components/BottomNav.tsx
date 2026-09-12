import React from 'react';
import { ShoppingBag, Compass, Store, User, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string, data?: any) => void;
  onOpenAuth: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  setCurrentView,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const { totalCount, openCart } = useCart();

  const isHome = currentView === 'home';
  const isCreators = currentView === 'explore' || currentView === 'creator';
  const isDashboard = currentView === 'dashboard';
  const isAccount = currentView === 'account';

  return (
    <nav
      id="bottom-app-navigation"
      aria-label="Main Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2 sm:py-2.5 shadow-2xl transition-all"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Products Switcher */}
        <button
          id="bottom-nav-products"
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            isHome
              ? 'text-amber-900 font-bold scale-105'
              : 'text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-colors ${
              isHome ? 'bg-amber-100/90 text-amber-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-semibold">Products</span>
        </button>

        {/* 2. Creators Switcher */}
        <button
          id="bottom-nav-creators"
          onClick={() => setCurrentView('explore')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            isCreators
              ? 'text-amber-900 font-bold scale-105'
              : 'text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-colors ${
              isCreators ? 'bg-amber-100/90 text-amber-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-semibold">Creators</span>
        </button>

        {/* 3. Cart Trigger with Live Badge */}
        <button
          id="bottom-nav-cart"
          onClick={openCart}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-stone-500 hover:text-stone-900 transition-all cursor-pointer relative"
        >
          <div className="relative p-1 rounded-xl">
            <Store className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-800 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {totalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Cart</span>
        </button>

        {/* 4. Seller Studio / Dashboard */}
        <button
          id="bottom-nav-dashboard"
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            isDashboard
              ? 'text-amber-900 font-bold scale-105'
              : 'text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              isDashboard ? 'bg-amber-100/80 text-amber-900' : 'text-stone-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Studio</span>
        </button>

        {/* 5. Account / Instagram & Orders */}
        <button
          id="bottom-nav-account"
          onClick={() => {
            if (user) {
              setCurrentView('account');
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            isAccount
              ? 'text-amber-900 font-bold scale-105'
              : 'text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              isAccount ? 'bg-amber-100/80 text-amber-900' : 'text-stone-500'
            }`}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">
            {user ? 'Account' : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
};
