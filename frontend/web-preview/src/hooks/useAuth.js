import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  async function loginWithGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Google login failed', e);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout failed', e);
    }
  }

  return { user, authLoading, loginWithGoogle, logout };
}
