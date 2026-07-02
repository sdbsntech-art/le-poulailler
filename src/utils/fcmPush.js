import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging, isFirebaseConfigured } from '../firebase';
import { apiRegisterFcmToken } from './api';

const DEVICE_ID_KEY = 'le-poulailler-device-id';
const FCM_TOKEN_KEY = 'le-poulailler-fcm-token';

function getOrCreateDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `web-${crypto.randomUUID?.() || Date.now()}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getStoredFcmToken() {
  return localStorage.getItem(FCM_TOKEN_KEY);
}

export function isFcmAvailable() {
  return (
    isFirebaseConfigured() &&
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  );
}

export async function registerFcmServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/firebase-cloud-messaging-push-scope/',
  });
  await navigator.serviceWorker.ready;
  return registration;
}

/**
 * Demande la permission, obtient le token FCM et l'enregistre sur le serveur.
 * @returns {{ status: 'granted'|'denied'|'unsupported'|'no-vapid'|'error', token?: string, error?: string }}
 */
export async function enableWebPush(authToken) {
  if (!isFcmAvailable()) {
    return { status: 'unsupported' };
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn('[FCM] VITE_FIREBASE_VAPID_KEY manquante — notifications navigateur uniquement.');
    return { status: 'no-vapid' };
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    return { status: 'denied' };
  }

  try {
    const registration = await registerFcmServiceWorker();
    const messaging = await getFirebaseMessaging();
    if (!messaging || !registration) {
      return { status: 'unsupported' };
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      return { status: 'error', error: 'Token FCM non obtenu' };
    }

    localStorage.setItem(FCM_TOKEN_KEY, token);

    if (authToken) {
      await apiRegisterFcmToken(authToken, token, getOrCreateDeviceId());
    }

    return { status: 'granted', token };
  } catch (err) {
    console.error('[FCM] Erreur activation push :', err);
    return { status: 'error', error: err.message || 'Erreur FCM' };
  }
}

let foregroundListenerAttached = false;

/** Affiche les messages FCM reçus quand l'app est au premier plan. */
export async function listenForForegroundMessages(onPayload) {
  if (foregroundListenerAttached) return;
  const messaging = await getFirebaseMessaging();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || payload.data?.title || 'Le Poulailler';
    const body = payload.notification?.body || payload.data?.body || '';

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: payload.data?.alerteId || 'fcm-foreground',
        });
      } catch {
        /* ignore */
      }
    }

    onPayload?.(payload);
  });

  foregroundListenerAttached = true;
}
