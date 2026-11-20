import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const STORAGE_KEY = 'trailready_plan';
// Firestore rejects undefined values anywhere in a document.
const clean = (data) => JSON.parse(JSON.stringify(data));

export async function loadPlan(uid) {
  if (uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'plans', 'current'));
      if (snap.exists()) return snap.data();
      // First login on this device: upload the plan made without an account.
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        const data = JSON.parse(local);
        await setDoc(doc(db, 'users', uid, 'plans', 'current'), clean(data));
        return data;
      }
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
      await setDoc(doc(db, 'users', uid, 'plans', 'current'), clean(data));
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

// ── Saved plans (not active) ─────────────────────────────────
// Starting a new plan archives the current one instead of deleting it.
const SAVED_KEY = 'trailready_saved_plans';
const readLocalSaved = () => { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; } };
const writeLocalSaved = (list) => { try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch { /* ignore */ } };
const newPlanId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export async function listSavedPlans(uid) {
  if (uid) {
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'savedPlans'));
      const cloud = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Plans archived on this device before signing in move to the account.
      const local = readLocalSaved().filter(l => !cloud.some(c => c.id === l.id));
      for (const l of local) await setDoc(doc(db, 'users', uid, 'savedPlans', l.id), clean(l));
      if (local.length) writeLocalSaved([]);
      return [...cloud, ...local].sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
    } catch (e) { console.error('Saved plans load failed', e); }
  }
  return readLocalSaved().sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
}

export async function archivePlan(uid, state) {
  if (!state?.plan) return null;
  const item = { ...state, id: state.id || newPlanId(), archivedAt: Date.now() };
  if (uid) {
    try { await setDoc(doc(db, 'users', uid, 'savedPlans', item.id), clean(item)); return item; }
    catch (e) { console.error('Archive failed, keeping it on this device', e); }
  }
  writeLocalSaved([item, ...readLocalSaved().filter(p => p.id !== item.id)]);
  return item;
}

export async function deleteSavedPlan(uid, id) {
  writeLocalSaved(readLocalSaved().filter(p => p.id !== id));
  if (uid) { try { await deleteDoc(doc(db, 'users', uid, 'savedPlans', id)); } catch (e) { console.error('Delete saved plan failed', e); } }
}

export async function deleteAllSavedPlans(uid) {
  const list = await listSavedPlans(uid);
  await Promise.allSettled(list.map(p => deleteSavedPlan(uid, p.id)));
}
