import { db } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

const DEFAULT_SETTINGS = {
  status: 'open',
  statusText: 'เปิดรับออเดอร์ปกติ',
  statusNote: 'ทัก DM สอบถามและสั่งซื้อได้ตลอดค่ะ',
  promoBanner: '✨ สั่งซื้อครบ 2 ชิ้น ส่งฟรีทุกออเดอร์! ทัก DM Instagram ได้ตลอด 24 ชม.',
  instagramUrl: 'https://www.instagram.com/zeza_brandn?mdxt=ZDNlZDc0MzIxNw==',
  instagramDmUrl: 'https://www.instagram.com/zeza_brandn?mdxt=ZDNlZDc0MzIxNw=='
};

/**
 * ติดตามการตั้งค่าร้านค้าและสถานะร้านแบบ Real-time จาก Cloud Firestore
 */
export function subscribeStoreSettings(callback) {
  if (!db) {
    callback(DEFAULT_SETTINGS);
    return () => {};
  }

  try {
    const docRef = doc(db, 'settings', 'store');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({
            ...DEFAULT_SETTINGS,
            ...docSnap.data()
          });
        } else {
          callback(DEFAULT_SETTINGS);
        }
      },
      (err) => {
        console.warn('Store settings subscription notice:', err);
        callback(DEFAULT_SETTINGS);
      }
    );
  } catch (err) {
    console.error('Error listening to store settings:', err);
    callback(DEFAULT_SETTINGS);
    return () => {};
  }
}

/**
 * อัปเดตสถานะร้านและข้อความประกาศ
 */
export async function updateStoreSettings(newSettings) {
  if (!db) throw new Error('ไม่พบการเชื่อมต่อกับ Cloud Firestore');

  const docRef = doc(db, 'settings', 'store');
  await setDoc(
    docRef,
    {
      ...newSettings,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}
