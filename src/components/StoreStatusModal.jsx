import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Loader2, Store, Megaphone, Bell, Image as ImageIcon, Upload } from 'lucide-react';
import { updateStoreSettings } from '../services/storeService';
import { compressImage } from '../utils/imageCompressor';

const STATUS_PRESETS = [
  {
    id: 'open',
    label: 'เปิดรับออเดอร์ปกติ',
    badgeClass: 'bg-emerald-500',
    colorText: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    defaultNote: 'ทัก DM สอบถามและสั่งซื้อได้ตลอดค่ะ แอดมินตอบไว'
  },
  {
    id: 'busy',
    label: 'ตอบช้าเล็กน้อย / กำลังแพ็กของ',
    badgeClass: 'bg-amber-500',
    colorText: 'text-amber-700 bg-amber-50 border-amber-200',
    defaultNote: 'กำลังเร่งแพ็กของส่งรอบวันนี้ ทัก DM ทิ้งไว้ได้เลยนะคะ'
  },
  {
    id: 'drop',
    label: 'เปิดรอบใหม่เร็วๆ นี้ / กำลังลงของ',
    badgeClass: 'bg-purple-500',
    colorText: 'text-purple-700 bg-purple-50 border-purple-200',
    defaultNote: 'เตรียมพบกับคอลเลกชันใหม่เร็วๆ นี้ ติดตามได้ทาง IG'
  },
  {
    id: 'closed',
    label: 'พักร้านชั่วคราว / ปิดรอบ',
    badgeClass: 'bg-rose-500',
    colorText: 'text-rose-700 bg-rose-50 border-rose-200',
    defaultNote: 'ปิดรับยอดชั่วคราว รอบหน้าเจอกันใหม่นะคะ'
  }
];

export default function StoreStatusModal({ isOpen, onClose, currentSettings, onSaved }) {
  const fileInputRef = useRef(null);
  const [selectedStatus, setSelectedStatus] = useState('open');
  const [statusNote, setStatusNote] = useState('');
  const [promoBanner, setPromoBanner] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [compressingLogo, setCompressingLogo] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setSelectedStatus(currentSettings.status || 'open');
      setStatusNote(currentSettings.statusNote || 'ทัก DM สอบถามและสั่งซื้อได้ตลอดค่ะ');
      setPromoBanner(currentSettings.promoBanner || '✨ สั่งซื้อครบ 2 ชิ้น ส่งฟรีทุกออเดอร์! ทัก DM Instagram ได้ตลอด 24 ชม.');
      setLogoUrl(currentSettings.logoUrl || '');
      setInstagramUrl(currentSettings.instagramUrl || 'https://www.instagram.com/zeza_brandn?mdxt=ZDNlZDc0MzIxNw==');
    }
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setSelectedStatus(preset.id);
    if (!statusNote || statusNote.trim() === '') {
      setStatusNote(preset.defaultNote);
    }
  };

  const handleLogoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressingLogo(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85
      });
      setLogoUrl(compressed.dataUrl);
    } catch (err) {
      alert('บีบอัดรูปโลโก้ไม่สำเร็จ: ' + err.message);
    } finally {
      setCompressingLogo(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const preset = STATUS_PRESETS.find((p) => p.id === selectedStatus) || STATUS_PRESETS[0];
      const payload = {
        status: selectedStatus,
        statusText: preset.label,
        statusNote: statusNote.trim(),
        promoBanner: promoBanner.trim(),
        logoUrl: logoUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        instagramDmUrl: 'https://ig.me/m/zeza_brandn'
      };

      await updateStoreSettings(payload);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        if (onSaved) onSaved(payload);
        onClose();
      }, 700);
    } catch (err) {
      alert('บันทึกการตั้งค่าไม่สำเร็จ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F]">
                ตั้งค่าร้านค้า & สถานะ (Store Settings)
              </h3>
              <p className="text-xs text-[#86868B]">
                ตั้งค่าโลโก้ร้าน, สถานะร้าน, และลิงก์ Instagram
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Logo Upload Section */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
              <span>โลโก้ร้านค้า (Store Logo)</span>
            </label>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 overflow-hidden flex items-center justify-center shadow-xs flex-shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-xl text-stone-700">Z</span>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFile}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={compressingLogo}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{compressingLogo ? 'กำลังบีบอัด...' : 'อัปโหลดรูปโลโก้จากเครื่อง'}</span>
                </button>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="หรือวางลิงก์รูปโลโก้ (URL)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-xs text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Status Selection Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              สถานะร้านค้า (Store Status)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STATUS_PRESETS.map((preset) => {
                const isSelected = selectedStatus === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      isSelected
                        ? 'border-black bg-stone-900 text-white shadow-sm scale-[1.01]'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${preset.badgeClass} ${
                        isSelected ? 'ring-2 ring-white/40' : ''
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold">{preset.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Note Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-stone-500" />
              <span>หมายเหตุสถานะ (แสดงใต้ป้ายสถานะหน้าร้าน)</span>
            </label>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="เช่น ตัดรอบส่ง 14:00 น. น้า หรือ ทัก DM ทิ้งไว้ได้เลยนะคะ"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Top Announcement Banner Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-stone-500" />
              <span>ข้อความแถบประกาศด้านบนสุด (Announcement Bar)</span>
            </label>
            <textarea
              rows={2}
              value={promoBanner}
              onChange={(e) => setPromoBanner(e.target.value)}
              placeholder="เช่น ✨ สั่งซื้อครบ 2 ชิ้น ส่งฟรีทุกออเดอร์! ทัก DM Instagram ได้ตลอด 24 ชม."
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Instagram Profile URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              ลิงก์ Instagram Profile
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/zeza_brandn?mdxt=ZDNlZDc0MzIxNw=="
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={loading || savedSuccess}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>บันทึกสำเร็จแล้ว!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>บันทึกการตั้งค่า</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
