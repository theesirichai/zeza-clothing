import React from 'react';
import { Heart, ArrowUp, Sparkles, ShieldCheck, Truck, Lock } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import { STORE_INFO } from '../data/products';

export default function Footer({ onOpenLogin, isAdmin = false, storeSettings }) {
  const igUrl = storeSettings?.instagramUrl || STORE_INFO.instagramUrl;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-black/[0.08] bg-white/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-black/[0.06]">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-[#1D1D1F]">
                {STORE_INFO.name}
              </span>
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                {STORE_INFO.handle}
              </a>
            </div>
            <p className="mt-2 text-sm text-[#86868B] max-w-sm">
              {STORE_INFO.subTagline}. คัดสรรเสื้อผ้ามือสองและงานแฟชั่นสภาพนางฟ้า ถ่ายรูปจากงานจริงทุกชิ้น
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-800 transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>Instagram @zeza_brandn</span>
              </a>
            </div>
          </div>

          {/* Shopping Guide */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] mb-3">
              ขั้นตอนการสั่งซื้อ
            </h4>
            <ul className="text-xs text-[#6E6E73] space-y-2">
              <li>1. เลือกดูสินค้าและสัดส่วนที่ต้องการ</li>
              <li>2. กดปุ่ม "คัดลอกชื่อสินค้า"</li>
              <li>3. กดปุ่ม "ทัก DM สั่งซื้อใน Instagram"</li>
              <li>4. รอแอดมินสรุปยอดและแจ้งเลขบัญชี</li>
            </ul>
          </div>

          {/* Delivery & Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] mb-3">
              การจัดส่ง & ดูแล
            </h4>
            <ul className="text-xs text-[#6E6E73] space-y-2">
              <li className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-stone-700" />
                <span>ส่งของทุกวัน จันทร์ - เสาร์</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                <span>เสื้อผ้าซักรีดหอมสะอาดก่อนส่ง</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                <span>เช็กตำหนิก่อนจัดส่งทุกตัว</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#86868B] gap-4">
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} {STORE_INFO.name} ({STORE_INFO.handle}). All rights reserved.</p>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-700 transition-colors ml-2"
            >
              <Lock className="w-3 h-3" />
              <span>{isAdmin ? 'แผงควบคุมแอดมิน' : 'สำหรับแอดมิน'}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for your everyday style
            </span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 hover:text-black transition-colors ml-2"
            >
              <span>กลับสู่ด้านบน</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
