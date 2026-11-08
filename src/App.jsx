import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import AdminBar from './components/AdminBar';
import AdminLoginModal from './components/AdminLoginModal';
import ProductFormModal from './components/ProductFormModal';
import StoreStatusModal from './components/StoreStatusModal';
import Footer from './components/Footer';

import { CATEGORIES } from './data/products';
import { subscribeProducts, updateProduct } from './services/productService';
import { subscribeAuthState, logoutAdmin } from './services/authService';
import { subscribeStoreSettings } from './services/storeService';

import { Search, ArrowUpDown, ShoppingBag, X, Plus } from 'lucide-react';

export default function App() {
  // Products state (Pure Firestore data)
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Store Settings & Status state (Pure Firestore data)
  const [storeSettings, setStoreSettings] = useState(null);

  // Auth / Admin state
  const [adminUser, setAdminUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Catalog filters & UI state
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Subscribe to real-time products from Cloud Firestore
  useEffect(() => {
    const unsubscribe = subscribeProducts((items) => {
      setProducts(items);
      setLoadingProducts(false);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Subscribe to real-time store settings & status
  useEffect(() => {
    const unsubscribe = subscribeStoreSettings((settings) => {
      setStoreSettings(settings);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = subscribeAuthState((user) => {
      setAdminUser(user);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          item.name?.toLowerCase().includes(query) ||
          item.code?.toLowerCase().includes(query) ||
          item.size?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          (item.tag && item.tag.toLowerCase().includes(query));

        const matchesAvailable = !onlyAvailable || item.status === 'พร้อมส่ง';
        return matchesCategory && matchesSearch && matchesAvailable;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        return (b.createdAt || 0) > (a.createdAt || 0) ? 1 : -1;
      });
  }, [products, activeCategory, searchQuery, sortBy, onlyAvailable]);

  // Helper count for category tabs
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return products.length;
    return products.filter((p) => p.category === categoryId).length;
  };

  const inStockCount = products.filter((p) => p.status === 'พร้อมส่ง').length;

  // Admin Quick Action: Toggle Status
  const handleQuickStatus = async (product) => {
    const nextStatus =
      product.status === 'พร้อมส่ง'
        ? 'ติดจอง'
        : product.status === 'ติดจอง'
        ? 'ขายแล้ว'
        : 'พร้อมส่ง';
    try {
      await updateProduct(product.id, { status: nextStatus });
    } catch (err) {
      alert('เปลี่ยนสถานะไม่สำเร็จ: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col selection:bg-black selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenLogin={() => setIsLoginModalOpen(true)}
        isAdmin={Boolean(adminUser)}
        storeSettings={storeSettings}
      />

      {/* Admin Action Bar (shown when logged in) */}
      {adminUser && (
        <AdminBar
          user={adminUser}
          storeSettings={storeSettings}
          onOpenAddModal={() => {
            setEditingProduct(null);
            setIsFormModalOpen(true);
          }}
          onOpenStatusModal={() => setIsStatusModalOpen(true)}
          onLogout={logoutAdmin}
        />
      )}

      {/* Hero Header (Apple Store Style) */}
      <HeroSection
        totalProducts={products.length}
        inStockCount={inStockCount}
        storeSettings={storeSettings}
      />

      {/* Category Navigation Bar */}
      <CategoryBar
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        getCategoryCount={getCategoryCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        {/* Search, Filter & Sort Controls */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 mb-8 border border-black/[0.06] shadow-apple-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาเสื้อผ้า เช่น เสื้อยืด, กางเกง, ไซส์ L, รหัส ZZ-01..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/70 focus:bg-white text-xs sm:text-sm text-[#1D1D1F] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Available Only */}
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                onlyAvailable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              เฉพาะพร้อมส่ง ✨
            </button>

            {/* Sort Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 transition-all cursor-pointer"
              >
                <option value="default">เรียงตาม: ล่าสุด</option>
                <option value="price-asc">ราคา: ต่ำ ➔ สูง</option>
                <option value="price-desc">ราคา: สูง ➔ ต่ำ</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-stone-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Catalog Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
              {CATEGORIES.find((c) => c.id === activeCategory)?.name || 'รายการสินค้า'}
            </h3>
            <span className="text-xs text-[#86868B] font-medium">
              ({filteredProducts.length} รายการ)
            </span>
          </div>

          {(searchQuery || activeCategory !== 'all' || onlyAvailable) && (
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setOnlyAvailable(false);
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 border border-black/5 animate-pulse">
                <div className="aspect-[4/5] rounded-2xl bg-stone-200 mb-3" />
                <div className="h-4 bg-stone-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Product Cards Grid with Smooth Fade Animation */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 transition-all duration-300 ease-out">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={setSelectedProduct}
                isAdmin={Boolean(adminUser)}
                onEdit={(item) => {
                  setEditingProduct(item);
                  setIsFormModalOpen(true);
                }}
                onQuickStatus={handleQuickStatus}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-black/[0.05] shadow-apple-card my-12">
            <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            {adminUser ? (
              <>
                <h4 className="text-base font-bold text-[#1D1D1F]">ยังไม่มีสินค้าในร้าน</h4>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  กดปุ่มด้านล่างเพื่อเริ่มลงสินค้าตัวแรกของคุณได้เลยครับ
                </p>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsFormModalOpen(true);
                  }}
                  className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-500 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มสินค้าใหม่ตัวแรก</span>
                </button>
              </>
            ) : (
              <>
                <h4 className="text-base font-bold text-[#1D1D1F]">
                  {searchQuery ? 'ไม่พบสินค้าที่ตรงกับการค้นหา' : 'เร็วๆ นี้ ทางร้านกำลังเตรียมลงสินค้าใหม่'}
                </h4>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  {searchQuery ? 'ลองพิมพ์คำค้นหาอื่นดูนะคะ' : 'ติดตามอัปเดตสินค้าคอลเลกชันใหม่ได้ที่ Instagram @zeza_brandn'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setSearchQuery('');
                      setOnlyAvailable(false);
                    }}
                    className="mt-5 px-4 py-2 bg-[#1D1D1F] text-white text-xs font-semibold rounded-full hover:bg-black transition-colors"
                  >
                    ดูสินค้าทั้งหมด
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Customer Detail & DM-to-Order Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => {
          setAdminUser(user);
        }}
      />

      {/* Admin Product Add / Edit Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        initialData={editingProduct}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          // Products refresh automatically from Firestore
        }}
      />

      {/* Store Status Settings Modal */}
      <StoreStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentSettings={storeSettings}
        onSaved={(updated) => {
          setStoreSettings(updated);
        }}
      />

      {/* Footer */}
      <Footer
        onOpenLogin={() => setIsLoginModalOpen(true)}
        isAdmin={Boolean(adminUser)}
        storeSettings={storeSettings}
      />
    </div>
  );
}
