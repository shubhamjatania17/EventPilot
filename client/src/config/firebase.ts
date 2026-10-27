import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyEventPilotWebDemoApiKey2026',
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'eventpilot-vpwc5'}.firebaseapp.com`,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://eventpilot-vpwc5-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'eventpilot-vpwc5',
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'eventpilot-vpwc5'}.appspot.com`,
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
