export async function demanderPermissionNotif() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function envoyerNotificationNavigateur(alerte, extra = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  try {
    const repeat = extra.repeatLabel ? `\n🔔 ${extra.repeatLabel}` : '';
    const n = new Notification(`📬 ${alerte.titre}`, {
      body: `${alerte.detail}${repeat}\n⏰ ${alerte.slotHeure || alerte.heure}`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `${alerte.id}-${alerte.repeatIndex ?? 0}`,
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

export function dispatcherRappel(alerte, profil, ajouterMessageLog, options = {}) {
  const canaux = [];

  if (options.canalSite !== false) {
    canaux.push('site');
  }

  if (profil.sonRappel) {
    canaux.push('son');
  }

  if (profil.notifyNavigateur) {
    const ok = envoyerNotificationNavigateur(alerte, options);
    canaux.push(ok ? 'navigateur' : 'navigateur-bloqué');
  }

  ajouterMessageLog({
    alerteId: alerte.id,
    titre: alerte.titre,
    heure: alerte.slotHeure || alerte.heure,
    canaux: canaux.join(', ') || 'aucun',
    repeatLabel: options.repeatLabel || null,
  });

  return canaux;
}
