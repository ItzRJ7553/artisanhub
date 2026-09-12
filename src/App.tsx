import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { CreatorRegistrationModal } from './components/CreatorRegistrationModal.tsx';

import { HomeView } from './views/HomeView.tsx';
import { CreatorStoreView } from './views/CreatorStoreView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { CreatorDashboardView } from './views/CreatorDashboardView.tsx';
import { CustomerAccountView } from './views/CustomerAccountView.tsx';
import { ExploreCreatorsView } from './views/ExploreCreatorsView.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { StoreCategory } from './types.ts';
import { CheckCircle2 } from 'lucide-react';

function MarketplaceApp() {
  const { user } = useAuth();
  const { isCartOpen } = useCart();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCreatorSlug, setSelectedCreatorSlug] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<'customer' | 'creator'>('customer');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCreatorRegModalOpen, setIsCreatorRegModalOpen] = useState(false);

  // Toast alert
  const [orderToast, setOrderToast] = useState<{ show: boolean; count: number }>({
    show: false,
    count: 0,
  });

  const navigateTo = (view: string, data?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'creator' && typeof data === 'string') {
      setSelectedCreatorSlug(data);
      setCurrentView('creator');
    } else if (view === 'product' && typeof data === 'string') {
      setSelectedProductId(data);
      setCurrentView('product');
    } else {
      setCurrentView(view);
    }
  };

  const handleOrderCompleted = (orders: any[]) => {
    setOrderToast({ show: true, count: orders.length });
    setTimeout(() => setOrderToast({ show: false, count: 0 }), 6000);
    navigateTo('account');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-800 selection:text-white font-sans antialiased pb-16 sm:pb-0">
      {/* Toast alert */}
      {orderToast.show && (
        <div className="fixed bottom-20 right-6 sm:bottom-6 z-50 bg-stone-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-stone-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block text-sm">Order Placed Successfully!</span>
            <span className="text-stone-400">
              {orderToast.count} order slips sent directly to creator studios for fulfillment.
            </span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={navigateTo}
        onOpenAuth={() => {
          setAuthModalTab('login');
          setAuthModalRole('customer');
          setIsAuthModalOpen(true);
        }}
        onOpenCreatorReg={() => {
          if (!user) {
            setAuthModalTab('register');
            setAuthModalRole('creator');
            setIsAuthModalOpen(true);
          } else {
            setIsCreatorRegModalOpen(true);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Views Switcher */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onViewCreator={slug => navigateTo('creator', slug)}
            onViewProduct={id => navigateTo('product', id)}
            onExploreCreators={() => navigateTo('explore')}
            onOpenCreatorReg={() => {
              if (!user) {
                setAuthModalTab('register');
                setAuthModalRole('creator');
                setIsAuthModalOpen(true);
              } else {
                setIsCreatorRegModalOpen(true);
              }
            }}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        )}

        {currentView === 'creator' && selectedCreatorSlug && (
          <CreatorStoreView
            slug={selectedCreatorSlug}
            onBack={() => navigateTo('home')}
            onViewProduct={id => navigateTo('product', id)}
            onOpenAuth={() => {
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {currentView === 'product' && selectedProductId && (
          <ProductDetailView
            productId={selectedProductId}
            onBack={() => navigateTo('home')}
            onViewCreator={slug => navigateTo('creator', slug)}
            onViewProduct={id => navigateTo('product', id)}
          />
        )}

        {currentView === 'dashboard' && (
          <CreatorDashboardView
            onViewStore={slug => navigateTo('creator', slug)}
            onOpenAuth={() => {
              setAuthModalTab('login');
              setAuthModalRole('creator');
              setIsAuthModalOpen(true);
            }}
            onOpenCreatorReg={() => {
              if (!user) {
                setAuthModalTab('register');
                setAuthModalRole('creator');
                setIsAuthModalOpen(true);
              } else {
                setIsCreatorRegModalOpen(true);
              }
            }}
          />
        )}

        {currentView === 'account' && (
          <CustomerAccountView
            onViewProduct={id => navigateTo('product', id)}
            onViewCreator={slug => navigateTo('creator', slug)}
            onStartShopping={() => navigateTo('home')}
          />
        )}

        {currentView === 'explore' && (
          <ExploreCreatorsView
            onViewCreator={slug => navigateTo('creator', slug)}
            onOpenCreatorReg={() => {
              if (!user) {
                setAuthModalTab('register');
                setAuthModalRole('creator');
                setIsAuthModalOpen(true);
              } else {
                setIsCreatorRegModalOpen(true);
              }
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onCategorySelect={cat => {
          setSearchQuery(cat);
          navigateTo('home');
        }}
        onOpenCreatorReg={() => {
          if (!user) {
            setAuthModalTab('register');
            setAuthModalRole('creator');
            setIsAuthModalOpen(true);
          } else {
            setIsCreatorRegModalOpen(true);
          }
        }}
        onExploreClick={() => navigateTo('explore')}
      />

      {/* Bottom Switcher & Navigation (Fixed at bottom) */}
      <BottomNav
        currentView={currentView}
        setCurrentView={navigateTo}
        onOpenAuth={() => {
          setAuthModalTab('login');
          setAuthModalRole('customer');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Modals & Slide-overs */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        initialRole={authModalRole}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />

      <CartDrawer
        onCheckout={() => setIsCheckoutModalOpen(true)}
        onViewCreator={slug => navigateTo('creator', slug)}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      <CreatorRegistrationModal
        isOpen={isCreatorRegModalOpen}
        onClose={() => setIsCreatorRegModalOpen(false)}
        onSuccess={slug => {
          navigateTo('creator', slug);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MarketplaceApp />
      </CartProvider>
    </AuthProvider>
  );
}
