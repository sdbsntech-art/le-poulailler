import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );
}

let app = null;
let messagingPromise = null;
let analyticsPromise = null;

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

/** Analytics uniquement dans le navigateur. */
export async function getFirebaseAnalytics() {
  if (typeof window === 'undefined' || !isFirebaseConfigured()) return null;
  if (!analyticsPromise) {
    analyticsPromise = isAnalyticsSupported().then((supported) => {
      if (!supported) return null;
      return getAnalytics(getFirebaseApp());
    });
  }
  return analyticsPromise;
}

/** Messaging uniquement dans le navigateur (pas SSR / pas Node). */
export async function getFirebaseMessaging() {
  if (typeof window === 'undefined' || !isFirebaseConfigured()) return null;
  if (!messagingPromise) {
    messagingPromise = isMessagingSupported().then((supported) => {
      if (!supported) return null;
      return getMessaging(getFirebaseApp());
    });
  }
  return messagingPromise;
}

export { firebaseConfig };
