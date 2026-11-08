import React from 'react';
import { Sparkles, ExternalLink, Lock, ShieldCheck } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import { STORE_INFO } from '../data/products';

export default function Navbar({ onOpenLogin, isAdmin = false, storeSettings }) {
  const promoBanner = storeSettings?.promoBanner || STORE_INFO.promoBanner;
  const igUrl = 'https://www.instagram.com/zeza_brandn?mdxt=ZDNlZDc0MzIxNw==';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#F5F5F7]/85 border-b border-black/[0.06] transition-all">
      {/* Top micro announcement banner */}
      <div className="bg-[#1D1D1F] text-white text-[12px] sm:text-[13px] py-2 px-4 text-center font-medium tracking-wide">
        <span className="inline-flex items-center gap-1.5 opacity-90">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          {promoBanner}
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity with Circular Logo 04 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black border border-white/20 overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
            <img
              src="/zeza-logo.svg"
              alt="ZEZA Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-[#1D1D1F]">
                {STORE_INFO.name}
              </span>
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 transition-colors"
              >
                <InstagramIcon className="w-3 h-3 text-rose-500" />
                {STORE_INFO.handle}
              </a>
            </div>
            <p className="text-[11px] text-[#86868B] font-medium tracking-wider uppercase -mt-0.5">
              {STORE_INFO.tagline}
            </p>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          {/* Admin Login Trigger Button */}
          <button
            onClick={onOpenLogin}
            className={`p-2 rounded-full transition-all ${
              isAdmin
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'text-stone-400 hover:text-stone-800 hover:bg-stone-200/60'
            }`}
            title={isAdmin ? 'คุณอยู่ในโหมดแอดมิน' : 'เข้าสู่ระบบแอดมินร้าน'}
            aria-label="แอดมิน"
          >
            {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
          </button>

          {/* Instagram Profile & DM Button */}
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#1D1D1F] text-white hover:bg-black active:scale-95 transition-all shadow-sm hover:shadow-md"
          >
            <InstagramIcon className="w-4 h-4 text-rose-400" />
            <span className="hidden xs:inline">ทัก DM ร้าน</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </header>
  );
}
