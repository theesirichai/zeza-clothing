import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, ChevronLeft, ChevronRight, Images, Tag } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';

const IG_URL = "https://www.instagram.com/zeza_brandn?mdxt=ZDNlZDc0MzIxNw==";

export default function ProductModal({ product, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, activeImageIndex]);

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!product) return null;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const productSize = product.size || product.details?.size || 'Free Size';
  const orderText = `[${product.code}] ${product.name} (ไซส์ ${productSize} / ราคา ฿${product.price})`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(orderText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = orderText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const isAvailable = product.status === "พร้อมส่ง";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-[28px] sm:rounded-4xl shadow-2xl border border-black/10 overflow-hidden z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-100/90 hover:bg-stone-200 active:scale-95 text-[#1D1D1F] flex items-center justify-center transition-all backdrop-blur-md shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[88vh] overflow-y-auto">
          {/* Left Column: Multi-Image Gallery Presentation */}
          <div className="md:col-span-6 bg-stone-100 p-4 sm:p-6 flex flex-col justify-between items-center relative">
            <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-stone-200 shadow-xs relative group select-none">
              <img
                src={images[activeImageIndex] || product.image}
                alt={`${product.name} - รูปที่ ${activeImageIndex + 1}`}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {/* Navigation Arrows for multi-photo */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
                    title="รูปก่อนหน้า"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
                    title="รูปถัดไป"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Photo Counter Pill */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold tracking-wider flex items-center gap-1">
                    <Images className="w-3 h-3 text-stone-300" />
                    <span>{activeImageIndex + 1} / {images.length}</span>
                  </div>
                </>
              )}

              {/* Product Code Badge */}
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-mono font-bold tracking-wider">
                CODE: {product.code}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="w-full mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-black scale-105 shadow-xs'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            <p className="mt-3 text-[11px] text-stone-500 text-center font-medium">
              📸 ภาพถ่ายจริง Flat-lay & Zoom เนื้อผ้า
            </p>
          </div>

          {/* Right Column: Details & Order CTA */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Top Meta */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {product.status} (1/1 มีชิ้นเดียว)
                </span>

                {/* Size Badge */}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-[#1D1D1F] text-white">
                  ไซส์: {productSize}
                </span>

                {product.tag && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                    {product.tag}
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight leading-snug">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="text-3xl font-black text-[#1D1D1F]">
                  ฿{Number(product.price).toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#86868B] line-through">
                    ฿{Number(product.originalPrice).toLocaleString()}
                  </span>
                )}
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  ส่งฟรีเมื่อสั่ง 2 ชิ้น
                </span>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-[#6E6E73] leading-relaxed">
                {product.description || `เสื้อผ้าคัดเกรดเน้นคุณภาพ ไซส์ ${productSize} สภาพดีพร้อมใส่`}
              </p>

              {/* Size & Specifications Table */}
              <div className="mt-5 bg-stone-50 rounded-2xl p-4 border border-stone-200/70">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2.5 flex items-center justify-between">
                  <span>รายละเอียดไซส์ & สัดส่วน</span>
                  <span className="font-extrabold text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                    ไซส์ {productSize}
                  </span>
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {product.details?.chest && (
                    <div className="p-2 rounded-xl bg-white border border-stone-100">
                      <span className="text-stone-400 block text-[10px]">รอบอก (Bust)</span>
                      <span className="font-semibold text-stone-800">{product.details.chest}</span>
                    </div>
                  )}
                  {product.details?.waist && (
                    <div className="p-2 rounded-xl bg-white border border-stone-100">
                      <span className="text-stone-400 block text-[10px]">รอบเอว (Waist)</span>
                      <span className="font-semibold text-stone-800">{product.details.waist}</span>
                    </div>
                  )}
                  {product.details?.hips && (
                    <div className="p-2 rounded-xl bg-white border border-stone-100">
                      <span className="text-stone-400 block text-[10px]">สะโพก (Hips)</span>
                      <span className="font-semibold text-stone-800">{product.details.hips}</span>
                    </div>
                  )}
                  {product.details?.length && (
                    <div className="p-2 rounded-xl bg-white border border-stone-100">
                      <span className="text-stone-400 block text-[10px]">ความยาว (Length)</span>
                      <span className="font-semibold text-stone-800">{product.details.length}</span>
                    </div>
                  )}
                  {product.details?.shoulders && (
                    <div className="p-2 rounded-xl bg-white border border-stone-100">
                      <span className="text-stone-400 block text-[10px]">ไหล่ (Shoulders)</span>
                      <span className="font-semibold text-stone-800">{product.details.shoulders}</span>
                    </div>
                  )}
                  {product.details?.thigh && (
                    <div className="p-2 rounded-xl bg-white border border-stone-100">
                      <span className="text-stone-400 block text-[10px]">รอบขา (Thigh)</span>
                      <span className="font-semibold text-stone-800">{product.details.thigh}</span>
                    </div>
                  )}
                  {product.details?.material && (
                    <div className="p-2 rounded-xl bg-white border border-stone-100 col-span-2">
                      <span className="text-stone-400 block text-[10px]">เนื้อผ้า (Material)</span>
                      <span className="font-medium text-stone-800">{product.details.material}</span>
                    </div>
                  )}
                  {product.details?.condition && (
                    <div className="p-2 rounded-xl bg-white border border-stone-100 col-span-2">
                      <span className="text-stone-400 block text-[10px]">สภาพสินค้า (Condition)</span>
                      <span className="font-medium text-emerald-700">{product.details.condition}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DM to Order Actions */}
            <div className="mt-6 pt-5 border-t border-stone-200">
              {/* Copy Product Name & Size Button */}
              <div className="mb-3">
                <button
                  onClick={handleCopy}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300 shadow-2xs active:scale-[0.99]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>คัดลอกชื่อสินค้าและไซส์ {productSize} แล้ว! (ส่งใน DM ได้ทันที)</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-stone-500" />
                      <span>กดคัดลอก: {product.code} (ไซส์ {productSize})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Instagram Profile Link */}
              <a
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-sm font-bold bg-[#1D1D1F] hover:bg-black text-white shadow-md hover:shadow-xl active:scale-[0.99] transition-all"
              >
                <InstagramIcon className="w-4 h-4 text-rose-400" />
                <span>ทัก DM สั่งซื้อใน Instagram @zeza_brandn</span>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </a>

              {/* Friendly Tip */}
              <p className="mt-3 text-[11px] text-stone-500 text-center leading-normal">
                💬 ข้อความที่คัดลอกจะมีรหัสสินค้าและไซส์ติดไปด้วย แอดมินเช็กของให้ได้ทันทีค่ะ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
