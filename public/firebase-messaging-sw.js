/* Service worker FCM — charge la config générée depuis .env (scripts/generate-firebase-sw.mjs) */
importScripts('/firebase-sw-config.js');
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js');

if (self.__FIREBASE_SW_CONFIG__?.apiKey) {
  firebase.initializeApp(self.__FIREBASE_SW_CONFIG__);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || 'Le Poulailler';
    const body =
      payload.notification?.body ||
      payload.data?.body ||
      'Nouveau rappel pour votre élevage';

    self.registration.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: payload.data || {},
      tag: payload.data?.alerteId || 'le-poulailler-rappel',
    });
  });

  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/?tab=alertes';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  });
}
