import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCaVTW1xwQ1uPeevJyXQjbIgN_wLrojoEg",
  // On production, auth runs on our own domain (proxied to Firebase by vercel.json).
  // Safari blocks the cross-site storage that signInWithRedirect needs otherwise.
  authDomain: typeof window !== 'undefined' && window.location.hostname === 'trailready.vercel.app'
    ? 'trailready.vercel.app'
    : 'olympus-app-9de55.firebaseapp.com',
  projectId: "olympus-app-9de55",
  storageBucket: "olympus-app-9de55.firebasestorage.app",
  messagingSenderId: "733043158051",
  appId: "1:733043158051:web:e193cdec2a528591bd1596"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
