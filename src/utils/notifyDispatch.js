export async function demanderPermissionNotif() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function envoyerNotificationNavigateur(alerte) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  try {
    const n = new Notification(alerte.titre, {
      body: `${alerte.detail}\n⏰ ${alerte.heure}`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: alerte.id,
      requireInteraction: true,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}

export function dispatcherRappel(alerte, profil, ajouterMessageLog) {
  const canaux = [];

  if (profil.notifyNavigateur) {
    const ok = envoyerNotificationNavigateur(alerte);
    canaux.push(ok ? 'navigateur' : 'navigateur-bloqué');
  }

  ajouterMessageLog({
    alerteId: alerte.id,
    titre: alerte.titre,
    heure: alerte.heure,
    canaux: canaux.join(', ') || 'aucun',
  });

  return canaux;
}
