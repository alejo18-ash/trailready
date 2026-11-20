import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const KEY = 'trailready_gear';
const clean = (d) => JSON.parse(JSON.stringify(d));

// Gear belongs to the runner, not to a plan: it survives "start a new plan".
export async function loadGear(uid) {
  let local = [];
  try { local = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { local = []; }
  if (!uid) return local;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'gear', 'list'));
    if (snap.exists()) return snap.data().items || [];
    if (local.length) await setDoc(doc(db, 'users', uid, 'gear', 'list'), clean({ items: local }));
  } catch (e) { console.error('Gear load failed', e); }
  return local;
}

export async function saveGear(uid, items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  if (!uid) return;
  try { await setDoc(doc(db, 'users', uid, 'gear', 'list'), clean({ items })); }
  catch (e) { console.error('Gear save failed', e); }
}

// Public "my gear" page — only what the runner chose to publish.
export async function publishProfile(uid, data) {
  await setDoc(doc(db, 'profiles', uid), clean({ ...data, updatedAt: Date.now() }));
}
export async function unpublishProfile(uid) {
  await deleteDoc(doc(db, 'profiles', uid));
}
export async function loadPublicProfile(uid) {
  const snap = await getDoc(doc(db, 'profiles', uid));
  return snap.exists() ? snap.data() : null;
}
export async function isPublished(uid) {
  try { return (await getDoc(doc(db, 'profiles', uid))).exists(); } catch { return false; }
}

// Account deletion: remove gear and the public page.
export async function deleteAllGear(uid) {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  if (!uid) return;
  await Promise.allSettled([deleteDoc(doc(db, 'users', uid, 'gear', 'list')), deleteDoc(doc(db, 'profiles', uid)), deleteDoc(doc(db, 'users', uid, 'prefs', 'main'))]);
}

// ── Interests (race types the runner likes) ──────────────────
const INT_KEY = 'trailready_interests';
export async function loadInterests(uid) {
  let local = [];
  try { local = JSON.parse(localStorage.getItem(INT_KEY) || '[]'); } catch { local = []; }
  if (!uid) return local;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'prefs', 'main'));
    if (snap.exists()) return snap.data().interests || [];
    if (local.length) await setDoc(doc(db, 'users', uid, 'prefs', 'main'), { interests: local }, { merge: true });
  } catch (e) { console.error('Interests load failed', e); }
  return local;
}
export async function saveInterests(uid, interests) {
  try { localStorage.setItem(INT_KEY, JSON.stringify(interests)); } catch { /* ignore */ }
  if (!uid) return;
  try { await setDoc(doc(db, 'users', uid, 'prefs', 'main'), { interests }, { merge: true }); }
  catch (e) { console.error('Interests save failed', e); }
}
