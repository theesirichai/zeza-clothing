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
 * บีบอัดรูปภาพให้เบาที่สุด (~50-80KB ต่อรูป) ด้วย WebP
 */
export async function processImage(fileOrUrl) {
  if (!fileOrUrl) return null;

  if (typeof fileOrUrl === 'string') {
    return fileOrUrl;
  }

  const compressionResult = await compressImage(fileOrUrl, {
    maxWidth: 960,
    maxHeight: 1200,
    quality: 0.78
  });

  return compressionResult.dataUrl;
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
