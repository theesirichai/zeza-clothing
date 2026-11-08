import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { compressImage } from '../utils/imageCompressor';

/**
 * ติดตามข้อมูลสินค้าแบบ Real-time จาก Cloud Firestore เท่านั้น
 */
export function subscribeProducts(onProductsChange, onError) {
  if (!db) {
    onProductsChange([]);
    return () => {};
  }

  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const images = Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : (data.image ? [data.image] : []);

          return {
            id: docSnap.id,
            ...data,
            images,
            image: images[0] || ''
          };
        });
        onProductsChange(items);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        if (onError) onError(err);
        onProductsChange([]);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error starting Firestore listener:', err);
    onProductsChange([]);
    return () => {};
  }
}

/**
 * บีบอัดรูปภาพให้อยู่ในขนาดปลอดภัยพิเศษ (~35KB-55KB ต่อรูป)
 */
export async function processImage(fileOrUrl) {
  if (!fileOrUrl) return null;

  // ถ้าเป็น dataUrl หรือ URL ภายนอกอยู่แล้ว
  if (typeof fileOrUrl === 'string') {
    // ถ้าเป็น base64 ขนาดใหญ่เกิน 80KB ให้บีบอัดลงมา
    if (fileOrUrl.startsWith('data:image/') && fileOrUrl.length > 100000) {
      try {
        const res = await fetch(fileOrUrl);
        const blob = await res.blob();
        const compressed = await compressImage(blob, {
          maxWidth: 720,
          maxHeight: 900,
          targetMaxBytes: 55 * 1024
        });
        return compressed.dataUrl;
      } catch (e) {
        return fileOrUrl;
      }
    }
    return fileOrUrl;
  }

  const compressionResult = await compressImage(fileOrUrl, {
    maxWidth: 720,
    maxHeight: 900,
    targetMaxBytes: 55 * 1024
  });

  return compressionResult.dataUrl;
}

/**
 * ตรวจสอบขนาดของ Payload เพื่อป้องกันไม่ให้เกินขีดจำกัด 1MB ของ Firestore
 */
function validatePayloadSize(payload) {
  const jsonStr = JSON.stringify(payload);
  const totalBytes = new Blob([jsonStr]).size;

  // เผื่อความปลอดภัยไว้ที่ 900KB (Firestore limit คือ 1,048,576 bytes)
  if (totalBytes > 900 * 1024) {
    const totalKB = Math.round(totalBytes / 1024);
    throw new Error(
      `ขนาดรวมของข้อมูลและรูปภาพ (${totalKB} KB) เกินโควต้าความจุของระบบ กรุณาลดจำนวนรูปหรือเลือกรูปอื่น`
    );
  }
}

/**
 * เพิ่มสินค้าใหม่ลง Cloud Firestore
 */
export async function addProduct(productData, imageList = []) {
  if (!db) throw new Error('ไม่พบการเชื่อมต่อกับ Firestore');

  const processedUrls = [];
  for (const item of imageList) {
    if (item) {
      const url = await processImage(item);
      if (url) processedUrls.push(url);
    }
  }

  const finalImages = processedUrls.length > 0
    ? processedUrls
    : (productData.images?.length > 0 ? productData.images : (productData.image ? [productData.image] : []));

  const newProduct = {
    ...productData,
    images: finalImages,
    image: finalImages[0] || '',
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
    status: productData.status || 'พร้อมส่ง',
    isUnique: productData.isUnique !== false,
    createdAt: serverTimestamp()
  };

  // ตรวจสอบขนาดก่อนส่ง
  validatePayloadSize(newProduct);

  const docRef = await addDoc(collection(db, 'products'), newProduct);
  return { id: docRef.id, ...newProduct };
}

/**
 * แก้ไขข้อมูลสินค้าใน Cloud Firestore
 */
export async function updateProduct(id, productData, imageList = null) {
  if (!db) throw new Error('ไม่พบการเชื่อมต่อกับ Firestore');

  let finalImages = productData.images;

  if (imageList && Array.isArray(imageList)) {
    const processedUrls = [];
    for (const item of imageList) {
      if (item) {
        const url = await processImage(item);
        if (url) processedUrls.push(url);
      }
    }
    if (processedUrls.length > 0) {
      finalImages = processedUrls;
    }
  }

  const updatedFields = {
    ...productData,
    ...(finalImages ? { images: finalImages, image: finalImages[0] || '' } : {}),
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
    updatedAt: serverTimestamp()
  };

  // ตรวจสอบขนาดก่อนส่ง
  validatePayloadSize(updatedFields);

  const docRef = doc(db, 'products', String(id));
  await updateDoc(docRef, updatedFields);
  return { id, ...updatedFields };
}

/**
 * ลบสินค้าออกจาก Cloud Firestore
 */
export async function deleteProduct(id) {
  if (!db) throw new Error('ไม่พบการเชื่อมต่อกับ Firestore');

  const docRef = doc(db, 'products', String(id));
  await deleteDoc(docRef);
  return true;
}
