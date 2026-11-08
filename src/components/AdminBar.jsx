import React from 'react';
import { Plus, LogOut, Settings, Store } from 'lucide-react';

export default function AdminBar({ user, onOpenAddModal, onOpenStatusModal, onLogout, storeSettings }) {
  const statusColor =
    storeSettings?.status === 'open'
      ? 'bg-emerald-400'
      : storeSettings?.status === 'busy'
      ? 'bg-amber-400'
      : storeSettings?.status === 'drop'
      ? 'bg-purple-400'
      : 'bg-rose-400';

  return (
    <aside aria-label="Admin Control Bar" className="sticky top-16 z-30 w-full bg-stone-900 text-white border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Admin Status & Store Status */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ผู้ดูแลระบบ
          </span>
          <span className="text-stone-300 hidden sm:inline truncate max-w-xs font-mono">
            {user?.email}
          </span>

          {/* Current Store Status Tag */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800 text-stone-200 border border-stone-700">
            <span className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span>สถานะ: {storeSettings?.statusText || 'เปิดรับออเดอร์ปกติ'}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Store Status Button */}
          <button
            onClick={onOpenStatusModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold border border-stone-700 transition-colors active:scale-95"
            title="ตั้งค่าสถานะร้านค้าและข้อความประกาศ"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>ตั้งสถานะร้าน</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสินค้าใหม่</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-900/60 text-stone-300 hover:text-rose-200 transition-colors"
            title="ออกจากระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
