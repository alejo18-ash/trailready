import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const STORAGE_KEY = 'trailready_plan';

export async function loadPlan(uid) {
  if (uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'plans', 'current'));
      if (snap.exists()) return snap.data();
    } catch (e) {
      console.error('Firestore load failed, falling back to localStorage', e);
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function savePlan(uid, data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (uid) {
    try {
      await setDoc(doc(db, 'users', uid, 'plans', 'current'), data);
    } catch (e) {
      console.error('Firestore save failed', e);
    }
  }
}

export async function clearPlan(uid) {
  localStorage.removeItem(STORAGE_KEY);
  if (uid) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'plans', 'current'));
    } catch (e) {
      console.error('Firestore delete failed', e);
    }
  }
}
