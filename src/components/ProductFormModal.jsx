import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Check, AlertCircle, Loader2, Star, Layers, Tag } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { addProduct, updateProduct, deleteProduct } from '../services/productService';
import { compressImage, formatFileSize } from '../utils/imageCompressor';

const QUICK_SIZES = ['S', 'M', 'L', 'XL', '2XL', 'Free Size', 'Oversize'];

export default function ProductFormModal({ isOpen, onClose, initialData = null, onSuccess }) {
  const isEditing = Boolean(initialData);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'shirts',
    size: 'F',
    price: '',
    originalPrice: '',
    status: 'พร้อมส่ง',
    isUnique: true,
    tag: '',
    description: '',
    chest: '',
    length: '',
    waist: '',
    hips: '',
    shoulders: '',
    thigh: '',
    material: '',
    condition: '98% สภาพสวย ไม่มีตำหนิ'
  });

  const [photoList, setPhotoList] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Initialise form when opening
  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        category: initialData.category || 'shirts',
        size: initialData.size || initialData.details?.size || 'Free Size',
        price: initialData.price || '',
        originalPrice: initialData.originalPrice || '',
        status: initialData.status || 'พร้อมส่ง',
        isUnique: initialData.isUnique !== false,
        tag: initialData.tag || '',
        description: initialData.description || '',
        chest: initialData.details?.chest || '',
        length: initialData.details?.length || '',
        waist: initialData.details?.waist || '',
        hips: initialData.details?.hips || '',
        shoulders: initialData.details?.shoulders || '',
        thigh: initialData.details?.thigh || '',
        material: initialData.details?.material || '',
        condition: initialData.details?.condition || '98% สภาพสวย ไม่มีตำหนิ'
      });

      const existingImages = Array.isArray(initialData.images) && initialData.images.length > 0
        ? initialData.images
        : (initialData.image ? [initialData.image] : []);

      setPhotoList(
        existingImages.map((url, i) => ({
          id: `existing-${i}`,
          url,
          dataUrl: url,
          isNew: false
        }))
      );
    } else {
      setFormData({
        code: `ZZ-${String(Math.floor(Math.random() * 90) + 10)}`,
        name: '',
        category: 'shirts',
        size: 'Free Size',
        price: '',
        originalPrice: '',
        status: 'พร้อมส่ง',
        isUnique: true,
        tag: 'พร้อมส่ง ✨',
        description: '',
        chest: '',
        length: '',
        waist: '',
        hips: '',
        shoulders: '',
        thigh: '',
        material: 'Cotton 100%',
        condition: '98% สภาพนางฟ้า ไม่มีตำหนิ'
      });
      setPhotoList([]);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Handle Multi-file upload with instant client-side WebP compression
  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // จำกัดไม่เกิน 8 รูปต่อสินค้า เพื่อความรวดเร็วและปลอดภัย
    if (photoList.length + files.length > 8) {
      setError('สามารถอัปโหลดรูปได้สูงสุด 8 รูปต่อสินค้า');
      return;
    }

    setCompressing(true);
    setError('');

    try {
      const newItems = [];
      for (const file of files) {
        const compressed = await compressImage(file, {
          maxWidth: 720,
          maxHeight: 900,
          targetMaxBytes: 55 * 1024
        });

        newItems.push({
          id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          url: compressed.dataUrl,
          dataUrl: compressed.dataUrl,
          isNew: true,
          sizeBytes: compressed.compressedSize,
          sizeText: formatFileSize(compressed.compressedSize),
          savedPercent: compressed.savedPercent
        });
      }

      setPhotoList((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (id) => {
    setPhotoList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSetCover = (index) => {
    if (index === 0) return;
    setPhotoList((prev) => {
      const copy = [...prev];
      const [target] = copy.splice(index, 1);
      copy.unshift(target);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('กรุณาระบุชื่อสินค้า');
      return;
    }
    if (!formData.price) {
      setError('กรุณาระบุราคา');
      return;
    }
    if (photoList.length === 0) {
      setError('กรุณาอัปโหลดรูปภาพสินค้าอย่างน้อย 1 รูป');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        code: formData.code.trim() || 'ZZ-01',
        name: formData.name.trim(),
        category: formData.category,
        size: formData.size.trim() || 'Free Size',
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        status: formData.status,
        isUnique: formData.isUnique,
        tag: formData.tag.trim(),
        description: formData.description.trim(),
        details: {
          size: formData.size.trim() || 'Free Size',
          chest: formData.chest.trim(),
          length: formData.length.trim(),
          waist: formData.waist.trim(),
          hips: formData.hips.trim(),
          shoulders: formData.shoulders.trim(),
          thigh: formData.thigh.trim(),
          material: formData.material.trim(),
          condition: formData.condition.trim()
        }
      };

      const imagePayload = photoList.map((item) => item.dataUrl || item.url);

      if (isEditing) {
        await updateProduct(initialData.id, payload, imagePayload);
      } else {
        await addProduct(payload, imagePayload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('บันทึกข้อมูลไม่สำเร็จ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${formData.name}"?`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteProduct(initialData.id);
      onSuccess();
      onClose();
    } catch (err) {
      alert('ลบสินค้าไม่สำเร็จ: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F]">
              {isEditing ? '✏️ แก้ไขข้อมูลสินค้า' : '➕ เพิ่มสินค้าใหม่'}
            </h3>
            <p className="text-xs text-[#86868B]">
              หมวดหมู่ เสื้อ / กางเกง พร้อมระบุไซส์ (S, M, L, XL, Free Size)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Section 1: Multi-Photo Upload & Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>รูปถ่ายสินค้า ({photoList.length}/8 รูป)</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ⚡ บีบอัด HD โหลดไว (สูงสุด 8 รูป)
              </span>
            </div>

            {/* Hidden Multi-file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesSelected}
              accept="image/*,.heic,.heif,.jfif"
              multiple
              className="hidden"
            />

            {/* Photo List Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {photoList.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group shadow-2xs"
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                    {index === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-bold backdrop-blur-md">
                        <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                        รูปปก
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="px-2 py-0.5 rounded-full bg-white/90 hover:bg-white text-stone-800 text-[10px] font-semibold backdrop-blur-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="ตั้งเป็นรูปปกหลัก"
                      >
                        ตั้งเป็นรูปปก
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="w-6 h-6 rounded-full bg-rose-600/80 hover:bg-rose-700 text-white flex items-center justify-center transition-colors shadow-xs"
                      title="ลบรูปนี้"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Bottom Compression Tag */}
                  {photo.sizeText && (
                    <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono backdrop-blur-md">
                        {photo.sizeText} (-{photo.savedPercent}%)
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Add More Photos Card */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={compressing}
                className="aspect-[4/5] rounded-2xl border-2 border-dashed border-stone-300 hover:border-black/40 bg-stone-50/70 hover:bg-stone-100 flex flex-col items-center justify-center text-stone-500 hover:text-stone-800 transition-all p-3 text-center cursor-pointer disabled:opacity-50"
              >
                {compressing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                    <span className="text-[11px] font-semibold">กำลังบีบอัดรูป...</span>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-white shadow-2xs flex items-center justify-center mb-2 text-stone-700">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-stone-700">เพิ่มรูปภาพ</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">เลือกหลายรูปพร้อมกันได้</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Basic Info & Sizes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ชื่อสินค้า <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น เสื้อยืดวินเทจสกรีนลาย"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                รหัสสินค้า (Code)
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="เช่น ZZ-01"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-mono text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Category: เสื้อ / กางเกง */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                หมวดหมู่สินค้า <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
              >
                <option value="shirts">👕 เสื้อ</option>
                <option value="pants">👖 กางเกง</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                สถานะสินค้า
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
              >
                <option value="พร้อมส่ง">พร้อมส่ง (In Stock)</option>
                <option value="ติดจอง">ติดจอง (Reserved)</option>
                <option value="ขายแล้ว">ขายแล้ว (Sold Out)</option>
              </select>
            </div>

            {/* Size Section */}
            <div className="sm:col-span-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">
                🏷️ ขนาด / ไซส์ (Size) <span className="text-rose-500">*</span>
              </label>

              {/* Quick Size Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                {QUICK_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFormData({ ...formData, size: sz })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      formData.size === sz
                        ? 'bg-[#1D1D1F] text-white shadow-xs scale-105'
                        : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {/* Size Custom Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="พิมพ์ไซส์ เช่น S, M, L, XL, Free Size หรือ อก 42"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ราคาขาย (บาท) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="เช่น 290"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-bold text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ราคาเดิม (บาท - ถ้ามี)
              </label>
              <input
                type="number"
                min="0"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="เช่น 350"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ป้ายกำกับพิเศษ (Tag Badge)
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="เช่น Best Seller ⭐, วินเทจแท้, มือสองสภาพกริ๊บ"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Section 3: Measurements & Condition */}
          <div className="pt-2 border-t border-stone-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
              📐 สัดส่วนละเอียด (ถ้ามี)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-stone-500 block mb-1">รอบอก (Bust)</label>
                <input
                  type="text"
                  value={formData.chest}
                  onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                  placeholder="เช่น อก 42 นิ้ว"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-800"
                />
              </div>

              <div>
                <label className="text-stone-500 block mb-1">ความยาว (Length)</label>
                <input
                  type="text"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  placeholder="เช่น 27 นิ้ว"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-800"
                />
              </div>

              <div>
                <label className="text-stone-500 block mb-1">รอบเอว (Waist)</label>
                <input
                  type="text"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  placeholder="เช่น 24 - 32 นิ้ว"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-800"
                />
              </div>

              <div>
                <label className="text-stone-500 block mb-1">สะโพก (Hips)</label>
                <input
                  type="text"
                  value={formData.hips}
                  onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                  placeholder="เช่น สะโพก 38 นิ้ว"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-800"
                />
              </div>

              <div className="col-span-2">
                <label className="text-stone-500 block mb-1">เนื้อผ้า (Material)</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="เช่น Cotton 100% ผ้านุ่ม ไม่ย้วย"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-800"
                />
              </div>

              <div className="col-span-2">
                <label className="text-stone-500 block mb-1">สภาพสินค้า (Condition)</label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="เช่น 98% สภาพสวย ไม่มีตำหนิ"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              คำอธิบายสินค้า
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="เสื้อผ้าวินเทจคัดเกรด ใส่แมตช์ง่ายได้ทุกลุค..."
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || loading || compressing}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>ลบสินค้านี้</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={loading || deleting || compressing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึกและอัปโหลดรูป...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditing ? 'บันทึกการแก้ไข' : 'บันทึกสินค้าใหม่'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
