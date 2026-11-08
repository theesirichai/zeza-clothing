import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';

/**
 * ติดตามสถานะการเข้าสู่ระบบแบบเรียลไทม์ผ่าน Firebase Authentication
 */
export function subscribeAuthState(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        email: user.email,
        uid: user.uid,
        isFirebase: true
      });
    } else {
      callback(null);
    }
  });
}

/**
 * เข้าสู่ระบบด้วย Email และ Password ผ่าน Firebase Auth
 */
export async function loginAdmin(email, password) {
  const cleanEmail = email.trim();

  if (!auth) {
    throw new Error('ไม่พบการเชื่อมต่อกับ Firebase Authentication กรุณาตรวจสอบการตั้งค่า');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    return {
      email: userCredential.user.email,
      uid: userCredential.user.uid,
      isFirebase: true
    };
  } catch (err) {
    console.error('Firebase Auth Error:', err);
    let errorMsg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      errorMsg = 'ไม่พบบัญชีผู้ใช้นี้ หรือรหัสผ่านไม่ถูกต้อง';
    } else if (err.code === 'auth/wrong-password') {
      errorMsg = 'รหัสผ่านไม่ถูกต้อง';
    } else if (err.code === 'auth/invalid-email') {
      errorMsg = 'รูปแบบอีเมลไม่ถูกต้อง';
    } else if (err.code === 'auth/too-many-requests') {
      errorMsg = 'มีการล็อกอินผิดหลายครั้ง กรุณารอสักครู่แล้วลองใหม่';
    }
    throw new Error(errorMsg);
  }
}

/**
 * ออกจากระบบ
 */
export async function logoutAdmin() {
  if (auth) {
    await firebaseSignOut(auth);
  }
}
