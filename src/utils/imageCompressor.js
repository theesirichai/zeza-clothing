/**
 * =========================================================================
 * 🖼️ Image Compressor Utility (Client-Side WebP Compression)
 * =========================================================================
 * ลดขนาดรูปถ่ายจากมือถือ (จาก 5MB-10MB เหลือ ~100KB-200KB)
 * โดยคงความคมชัดระดับ HD สำหรับหน้าจอมือถือและ Retina Display
 * แปลงเป็นฟอร์แมต WebP อัตโนมัติ เพื่อให้เว็บโหลดไวที่สุดและประหยัดพื้นที่ Firebase
 * =========================================================================
 */

export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1500,
    quality = 0.82,
    outputType = 'image/webp'
  } = options;

  return new Promise((resolve, reject) => {
    // ถ้าไม่ใช่ไฟล์รูปภาพให้ข้าม
    if (!file.type.startsWith('image/')) {
      return reject(new Error('ไฟล์ที่เลือกไม่ใช่รูปภาพ'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // คำนวณขนาดใหม่โดยคง Aspect Ratio ไว้
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // เปิดใช้ image smoothing คุณภาพสูงสุด
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // วาดภาพลง Canvas
        ctx.drawImage(img, 0, 0, width, height);

        // ตรวจสอบว่าเบราว์เซอร์รองรับ WebP หรือไม่
        const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        const finalType = supportsWebP ? outputType : 'image/jpeg';
        const extension = supportsWebP ? '.webp' : '.jpg';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('การบีบอัดรูปภาพล้มเหลว'));
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '') + extension;
            const compressedFile = new File([blob], cleanName, {
              type: finalType,
              lastModified: Date.now()
            });

            const previewUrl = URL.createObjectURL(blob);
            const originalSize = file.size;
            const compressedSize = blob.size;
            const savedPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

            resolve({
              file: compressedFile,
              previewUrl,
              dataUrl: canvas.toDataURL(finalType, quality),
              originalSize,
              compressedSize,
              savedPercent,
              width,
              height
            });
          },
          finalType,
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}

/**
 * ฟังก์ชันช่วยแปลงขนาดไฟล์เป็น KB/MB ให้อ่านง่าย
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
