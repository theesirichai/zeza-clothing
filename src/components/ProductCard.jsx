import React from 'react';
import { Eye, ChevronRight, Edit3, RefreshCw, Images } from 'lucide-react';

export default function ProductCard({
  product,
  onClick,
  isAdmin = false,
  onEdit = null,
  onQuickStatus = null
}) {
  const isAvailable = product.status === "พร้อมส่ง";
  const isReserved = product.status === "ติดจอง";

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const primaryImage = images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = images[1] || null;
  const productSize = product.size || product.details?.size || 'Free Size';

  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white rounded-3xl p-3.5 sm:p-4 border border-black/[0.06] shadow-apple-card hover:shadow-apple-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer group relative overflow-hidden"
    >
      {/* Admin Quick Action Controls */}
      {isAdmin && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-stone-900/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/20"
        >
          <button
            onClick={() => onEdit && onEdit(product)}
            className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors"
            title="แก้ไขข้อมูลสินค้านี้"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onQuickStatus && onQuickStatus(product)}
            className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 flex items-center justify-center transition-colors"
            title="สลับสถานะ (พร้อมส่ง ➔ ติดจอง ➔ ขายแล้ว)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Photo Frame (Flat-lay optimized with rounded-2xl & aspect-[4/5]) */}
      <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-stone-100 mb-3.5">
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ease-out ${
            secondaryImage ? 'group-hover:opacity-0' : ''
          }`}
        />

        {/* Secondary Image (Hover reveal) */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} - มุมที่ 2`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
          />
        )}

        {/* Status Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs ${
              isAvailable
                ? 'bg-emerald-500/90 text-white'
                : isReserved
                ? 'bg-amber-500/90 text-white'
                : 'bg-rose-500/90 text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {product.status}
          </span>
          {product.isUnique && (
            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
              ชิ้นเดียว 1/1
            </span>
          )}
        </div>

        {/* Multi-Photo Count Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
              <Images className="w-2.5 h-2.5 text-stone-300" />
              <span>{images.length} รูป</span>
            </span>
          </div>
        )}

        {/* Size Badge on Card Photo */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/95 text-[#1D1D1F] text-[11px] font-black backdrop-blur-md shadow-xs">
            {productSize}
          </span>
        </div>

        {/* Feature Tag */}
        {product.tag && !isAdmin && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-[#1D1D1F] backdrop-blur-md shadow-xs">
              {product.tag}
            </span>
          </div>
        )}

        {/* Hover quick action overlay pill */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1D1D1F] text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            ดูสัดส่วน & ทักสั่งซื้อ
          </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#86868B] mb-1 font-medium">
            <span className="font-semibold text-stone-500">{product.code}</span>
            <span className="font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
              ไซส์: {productSize}
            </span>
          </div>

          <h3 className="text-base font-bold text-[#1D1D1F] group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-[#86868B] mt-1 line-clamp-1 font-normal">
            {product.description || `เสื้อผ้าคัดเกรด ไซส์ ${productSize}`}
          </p>
        </div>

        {/* Price & CTA row */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-[#1D1D1F]">
              ฿{Number(product.price).toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#86868B] line-through">
                ฿{Number(product.originalPrice).toLocaleString()}
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
            <span>สั่งซื้อ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
