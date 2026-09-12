import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Store,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { StoreCategory } from '../types.ts';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string, data?: any) => void;
  onOpenAuth: () => void;
  onOpenCreatorReg: () => void;
  onOpenRankingExplainer?: () => void;
  onOpenCloudflareGuide?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenAuth,
  onOpenCreatorReg,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, logout } = useAuth();
  const { totalCount, openCart } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (currentView !== 'home' && currentView !== 'explore') {
      setCurrentView('home');
    }
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-amber-50 shadow-md group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-stone-900 block leading-tight">
                Artisan<span className="text-amber-800">Hub</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-stone-500 font-semibold block">
                Creator Marketplace
              </span>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl mx-3 hidden md:flex items-center"
          >
            <div className="relative w-full flex items-center">
              <div className="absolute left-3.5 text-stone-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Search products, handmade crafts, artisan studios, ceramics..."
                className="w-full pl-10 pr-20 py-2.5 bg-stone-100/90 hover:bg-stone-100 focus:bg-white text-sm text-stone-900 rounded-full border border-stone-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden transition-all shadow-inner"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-16 p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action Links & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Explore Creators Link */}
            <button
              onClick={() => setCurrentView('explore')}
              className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer hidden md:block shrink-0 ${
                currentView === 'explore'
                  ? 'text-amber-900 bg-amber-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Creators
            </button>

            {/* Creator Studio / Sell Handmade Link */}
            {user?.creator_profile ? (
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer shadow-xs shrink-0 ${
                  currentView === 'dashboard'
                    ? 'bg-amber-900 text-white'
                    : 'bg-amber-800 hover:bg-amber-900 text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Creator Studio</span>
              </button>
            ) : (
              <button
                onClick={onOpenCreatorReg}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer shadow-xs shrink-0 bg-stone-100 hover:bg-amber-50 text-stone-800 hover:text-amber-900 border border-stone-200"
              >
                <Store className="w-3.5 h-3.5 text-amber-700" />
                <span>Sell Handmade</span>
              </button>
            )}

            {/* Shopping Cart Trigger */}
            <button
              onClick={openCart}
              className="relative p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer shrink-0"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute top-0 right-0 w-4.5 h-4.5 rounded-full bg-amber-800 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user.full_name}`}
                    alt={user.full_name}
                    className="w-7 h-7 rounded-full object-cover bg-stone-200"
                  />
                  <ChevronDown className="w-3 h-3 text-stone-500 hidden sm:block mr-1" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      {user.creator_profile && (
                        <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                          {user.creator_profile.store_name}
                        </span>
                      )}
                    </div>

                    {user.creator_profile ? (
                      <>
                        <button
                          onClick={() => {
                            setCurrentView('dashboard');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 cursor-pointer font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-amber-700" />
                          <span>Creator Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentView('creator', user.creator_profile?.slug);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Store className="w-4 h-4 text-stone-500" />
                          <span>View My Public Store</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          onOpenCreatorReg();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100/80 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <Store className="w-4 h-4 text-amber-700" />
                        <span>Register Creator Store</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCurrentView('account');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-stone-500" />
                      <span>My Orders & Purchases</span>
                    </button>

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-full transition-all cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-stone-700 hover:bg-stone-100 rounded-lg sm:hidden cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar (always accessible below header on mobile) */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search products, handmade items, studios..."
              className="w-full pl-9.5 pr-20 py-2 text-xs bg-stone-100/90 focus:bg-white text-stone-900 rounded-full border border-stone-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-hidden transition-all shadow-inner"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-14 p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-stone-100 text-[11px] font-semibold rounded-full cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search products & creators..."
              className="w-full pl-9 pr-4 py-2 bg-stone-100 rounded-lg text-sm border border-stone-200 focus:outline-none"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex flex-col gap-1 text-sm pt-2">
            <button
              onClick={() => {
                setCurrentView('home');
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-3.5 py-2.5 font-medium text-stone-800 hover:bg-stone-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
            >
              <Package className="w-4 h-4 text-amber-800" />
              <span>Shop All Products</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('explore');
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-3.5 py-2.5 font-medium text-stone-800 hover:bg-stone-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
            >
              <Store className="w-4 h-4 text-amber-800" />
              <span>Explore Creators Directory</span>
            </button>

            {user?.creator_profile ? (
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-3.5 py-2.5 font-semibold text-amber-950 bg-amber-50 hover:bg-amber-100 rounded-xl flex items-center gap-2.5 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-800" />
                <span>Creator Studio Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenCreatorReg();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-3.5 py-2.5 font-semibold text-amber-950 bg-amber-50 hover:bg-amber-100 rounded-xl flex items-center gap-2.5 cursor-pointer"
              >
                <Store className="w-4 h-4 text-amber-800" />
                <span>Sell on ArtisanHub</span>
              </button>
            )}

            <div className="border-t border-stone-100 my-1"></div>

            {user ? (
              <>
                <button
                  onClick={() => {
                    setCurrentView('account');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left px-3.5 py-2.5 font-medium text-stone-700 hover:bg-stone-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
                >
                  <User className="w-4 h-4 text-stone-500" />
                  <span>My Account & Orders</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 cursor-pointer text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-3.5 py-2.5 font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl flex items-center gap-2.5 cursor-pointer"
              >
                <User className="w-4 h-4 text-stone-600" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
