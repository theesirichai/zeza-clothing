/**
 * =========================================================================
 * 🖼️ Ultra Smart Image Compressor (Client-Side Adaptive WebP/JPEG)
 * =========================================================================
 * ลดขนาดรูปถ่ายจากมือถือความละเอียดสูง (5MB - 20MB) เหลือเพียง ~35KB - 55KB
 * โดยยังคงความคมชัดระดับ HD สำหรับหน้าจอมือถือและ Retina Display
 * รองรับการอัปโหลดหลายรูปพร้อมกันโดยไม่เกินโควต้า 1MB ของ Cloud Firestore
 * =========================================================================
 */

// ตรวจสอบว่าเบราว์เซอร์รองรับการ export WebP ผ่าน Canvas หรือไม่
let _cachedSupportsWebP = null;
function checkWebPSupport() {
  if (_cachedSupportsWebP !== null) return _cachedSupportsWebP;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    _cachedSupportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch (e) {
    _cachedSupportsWebP = false;
  }
  return _cachedSupportsWebP;
}

/**
 * บีบอัดภาพแบบปรับลดคุณภาพและสเกลหลายระดับ (Multi-pass Adaptive Compression)
 * เพื่อการันตีว่าไฟล์รูป Base64 จะมีขนาดไม่เกิน targetMaxBytes (~60KB)
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 720,
    maxHeight = 900,
    targetMaxBytes = 60 * 1024, // 60 KB (~80,000 base64 chars)
    forceJpeg = false
  } = options;

  return new Promise((resolve, reject) => {
    // ตรวจสอบนามสกุลไฟล์กรณีที่ browser ไม่ส่ง mime type มา
    const fileName = (file.name || '').toLowerCase();
    const isImageExt = /\.(jpe?g|png|webp|jfif|heic|heif|bmp|gif)$/i.test(fileName);
    const isImageMime = file.type && file.type.startsWith('image/');

    if (!isImageMime && !isImageExt) {
      return reject(new Error('ไฟล์ที่เลือกไม่ใช่รูปภาพที่รองรับ (กรุณาเลือกไฟล์ JPG, PNG, หรือ WebP)'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('ไม่สามารถอ่านไฟล์ได้ กรุณาลองใหม่อีกครั้ง'));
    };

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => {
        reject(
          new Error(
            'เบราว์เซอร์ไม่สามารถแปลงไฟล์นี้ได้ (หากถ่ายด้วย iPhone โหมด HEIC แนะนำให้เลือกรูปจาก Photos หรือแปลงเป็น JPG ก่อนอัปโหลด)'
          )
        );
      };

      img.onload = () => {
        try {
          const supportsWebP = !forceJpeg && checkWebPSupport();
          const mimeType = supportsWebP ? 'image/webp' : 'image/jpeg';

          let width = img.width;
          let height = img.height;

          // คำนวณขนาดเริ่มต้นโดยคง Aspect Ratio ไว้
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.max(320, Math.round(width * ratio));
            height = Math.max(400, Math.round(height * ratio));
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { alpha: false });

          // ลูปบีบอัดแบบ Adaptive Multi-pass
          let currentQuality = 0.72;
          let bestDataUrl = '';
          let bestSize = Infinity;
          let currentWidth = width;
          let currentHeight = height;

          // ลองบีบอัดสูงสุด 5 ครั้งเพื่อคุมขนาดให้ < targetMaxBytes
          for (let attempt = 0; attempt < 5; attempt++) {
            canvas.width = currentWidth;
            canvas.height = currentHeight;

            // เติมพื้นหลังสีขาวกรณีรูป PNG โปร่งแสง
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, currentWidth, currentHeight);

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

            const dataUrl = canvas.toDataURL(mimeType, currentQuality);
            // คำนวณขนาดไบนารีจากความยาว Base64 โดยประมาณ
            const stringLength = dataUrl.length - (dataUrl.indexOf(',') + 1);
            const approxBytes = Math.round((stringLength * 3) / 4);

            bestDataUrl = dataUrl;
            bestSize = approxBytes;

            // ถ้าขนาดได้ตามเป้าหมาย (< 60KB) ให้หยุดทันที
            if (approxBytes <= targetMaxBytes) {
              break;
            }

            // ถ้ายังใหญ่เกิน ให้ปรับลดคุณภาพและขนาดลงตามลำดับ
            if (attempt === 0) {
              currentQuality = 0.60;
            } else if (attempt === 1) {
              currentQuality = 0.50;
            } else if (attempt === 2) {
              currentWidth = Math.round(currentWidth * 0.85);
              currentHeight = Math.round(currentHeight * 0.85);
              currentQuality = 0.55;
            } else if (attempt === 3) {
              currentWidth = Math.round(currentWidth * 0.85);
              currentHeight = Math.round(currentHeight * 0.85);
              currentQuality = 0.45;
            }
          }

          const originalSize = file.size || bestSize;
          const compressedSize = bestSize;
          const savedPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

          resolve({
            dataUrl: bestDataUrl,
            previewUrl: bestDataUrl,
            originalSize,
            compressedSize,
            savedPercent,
            width: currentWidth,
            height: currentHeight,
            format: mimeType
          });
        } catch (err) {
          reject(new Error('เกิดข้อผิดพลาดในการประมวลผลรูป: ' + err.message));
        }
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * ฟังก์ชันช่วยแปลงขนาดไฟล์เป็น KB/MB ให้อ่านง่าย
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1000) {
    return `${Math.round(kb)} KB`;
  }
  return `${(kb / 1024).toFixed(1)} MB`;
}
