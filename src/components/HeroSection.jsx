import React from 'react';
import { Sparkles, Truck, Camera, CheckCircle2 } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import { STORE_INFO } from '../data/products';

export default function HeroSection({ totalProducts, inStockCount, storeSettings }) {
  const igUrl = storeSettings?.instagramUrl || STORE_INFO.instagramUrl;
  const statusType = storeSettings?.status || 'open';
  const statusText = storeSettings?.statusText || 'เปิดรับออเดอร์ปกติ';
  const statusNote = storeSettings?.statusNote || 'ทัก DM สอบถามและสั่งซื้อได้ตลอดค่ะ';

  const statusColorMap = {
    open: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200'
    },
    busy: {
      dot: 'bg-amber-500',
      text: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200'
    },
    drop: {
      dot: 'bg-purple-500',
      text: 'text-purple-700',
      bg: 'bg-purple-50 border-purple-200'
    },
    closed: {
      dot: 'bg-rose-500',
      text: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200'
    }
  };

  const currentTheme = statusColorMap[statusType] || statusColorMap.open;

  return (
    <section className="pt-8 sm:pt-14 pb-8 sm:pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 border-b border-black/[0.06]">
        {/* Apple Store Style Headline */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.06] shadow-xs text-xs font-semibold text-[#1D1D1F] mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>พร้อมส่ง {inStockCount} รายการ (ชิ้นเดียวในโลก 1/1)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            <span className="text-[#1D1D1F]">ZEZA CLOTHING.</span>{' '}
            <span className="text-[#86868B]">your everyday fashion store</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#6E6E73] font-normal leading-relaxed max-w-2xl">
            เสื้อผ้าคัดเกรดเน้นคุณภาพ สไตล์เกาหลี วินเทจ และสตรีทแวร์ ถ่ายจากสินค้าจริงทุกตัว
            ชอบตัวไหนกดดูสัดส่วนแล้วทัก <span className="font-semibold text-[#1D1D1F]">DM Instagram</span> สั่งซื้อได้ทันที
          </p>

          {/* Value props */}
          <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#48484A]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-black/5 shadow-2xs">
              <Camera className="w-3.5 h-3.5 text-stone-700" />
              <span>ภาพถ่ายจริง Flat-lay 100%</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-black/5 shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-stone-700" />
              <span>จัดส่งไว ส่งของทุกวัน</span>
            </div>
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-black/5 shadow-2xs text-stone-800 transition-colors"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>สั่งซื้อทาง DM @zeza_brandn</span>
            </a>
          </div>
        </div>

        {/* Store Profile Card with Perfectly Sized Logo & Status */}
        <div className="bg-white rounded-3xl p-5 border border-black/[0.06] shadow-apple-card lg:w-80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black border border-black/10 overflow-hidden shadow-xs flex-shrink-0 flex items-center justify-center">
              <img
                src="/zeza-logo.svg"
                alt="ZEZA CLOTHING"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-sm text-[#1D1D1F] truncate">ZEZA CLOTHING</p>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              </div>
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#86868B] hover:text-rose-600 truncate block transition-colors"
              >
                {STORE_INFO.handle}
              </a>
            </div>
          </div>

          {/* Dynamic Store Status Bar */}
          <div className="mt-4 pt-3 border-t border-black/[0.06]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#86868B]">สถานะร้าน</span>
              <span className={`font-bold flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border ${currentTheme.bg} ${currentTheme.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dot} animate-pulse`} />
                {statusText}
              </span>
            </div>
            {statusNote && (
              <p className="text-[11px] text-stone-500 text-right mt-1 truncate">
                {statusNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
