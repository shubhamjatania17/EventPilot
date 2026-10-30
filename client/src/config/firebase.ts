import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC-PUdpSjyFh7B94DGPB7xYOD6Y6UHmgyg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'eventpilot-vpwc5'}.firebaseapp.com`,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://eventpilot-vpwc5-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'eventpilot-vpwc5',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'eventpilot-vpwc5'}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '595329336691',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:595329336691:web:d14fc89d02eff067663106',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-DT241P00YG',
};

// Initialize Firebase Client App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Request email and profile scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Trigger official Firebase Google Popup
 * Returns the Firebase User ID token (JWT) to exchange with the EventPilot backend
 */
export async function signInWithGooglePopup(): Promise<{ idToken: string; user: any }> {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return {
    idToken,
    user: {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
    },
  };
}

export { signOut };
