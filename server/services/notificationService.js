import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStore, updateStore } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cachedFcmAccessToken = null;
let cachedFcmAccessTokenExpiry = 0;

function getFirebaseServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return JSON.parse(json);
    } catch {
      console.error('[FCM] FIREBASE_SERVICE_ACCOUNT_JSON invalide.');
    }
  }
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      const localPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(localPath)) {
        return JSON.parse(fs.readFileSync(localPath, 'utf8'));
      }
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error('[FCM] Impossible de lire FIREBASE_SERVICE_ACCOUNT_PATH :', err.message);
    }
  }
  return null;
}

async function getFcmAccessToken() {
  const sa = getFirebaseServiceAccount();
  if (!sa?.client_email || !sa?.private_key) return null;

  const now = Math.floor(Date.now() / 1000);
  if (cachedFcmAccessToken && cachedFcmAccessTokenExpiry > now + 60) {
    return cachedFcmAccessToken;
  }

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url');

  const signInput = `${header}.${claim}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(signInput)
    .sign(sa.private_key.replace(/\\n/g, '\n'))
    .toString('base64url');

  const jwt = `${signInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error('[FCM] Échec OAuth :', tokenData);
    return null;
  }

  cachedFcmAccessToken = tokenData.access_token;
  cachedFcmAccessTokenExpiry = now + (tokenData.expires_in || 3600);
  return cachedFcmAccessToken;
}

/**
 * Envoie une notification FCM (Web / Android / iOS) via HTTP v1 ou clé serveur legacy.
 */
export async function sendFcmPushNotification(token, title, body, data = {}) {
  if (!token) {
    console.warn('[FCM] Token manquant.');
    return null;
  }

  const accessToken = await getFcmAccessToken();
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    (() => {
      try {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}').project_id;
      } catch {
        return null;
      }
    })();

  if (accessToken && projectId) {
    try {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body },
              data: Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, String(v ?? '')])
              ),
              webpush: {
                fcmOptions: { link: data.url || '/?tab=alertes' },
              },
            },
          }),
        }
      );
      const resData = await response.json();
      if (!response.ok) {
        console.error(`[FCM] Erreur HTTP v1 pour ${token.slice(0, 12)}… :`, resData);
        return null;
      }
      console.log(`[FCM] Notification envoyée (HTTP v1) à ${token.slice(0, 12)}…`);
      return resData;
    } catch (error) {
      console.error('[FCM] Erreur HTTP v1 :', error);
    }
  }

  const serverKey = process.env.FIREBASE_SERVER_KEY;
  if (serverKey) {
    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          Authorization: `key=${serverKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          notification: { title, body },
          data,
          priority: 'high',
        }),
      });
      const resData = await response.json();
      console.log(`[FCM] Notification envoyée (legacy) à ${token.slice(0, 12)}… :`, resData);
      return resData;
    } catch (error) {
      console.error('[FCM] Erreur legacy :', error);
    }
  }

  console.warn(
    '[FCM] Aucune credential serveur (FIREBASE_SERVICE_ACCOUNT_JSON ou FIREBASE_SERVER_KEY). Push non envoyé.'
  );
  return null;
}

/** Envoie à tous les tokens FCM d'un utilisateur. */
export async function sendFcmToUserTokens(tokens, title, body, data = {}) {
  if (!Array.isArray(tokens) || tokens.length === 0) return [];
  const unique = [...new Set(tokens.filter(Boolean))];
  return Promise.all(unique.map((t) => sendFcmPushNotification(t, title, body, data)));
}

/**
 * Envoie une notification Push native via l'API d'Expo
 * @param {string} token - Le token Expo Push (ex: ExponentPushToken[xxx])
 * @param {string} title - Le titre de la notification
 * @param {string} body - Le corps du message
 * @param {object} data - Données supplémentaires optionnelles
 */
export async function sendExpoPushNotification(token, title, body, data = {}) {
  if (!token || !token.startsWith('ExponentPushToken')) {
    console.warn(`[Push] Token Expo invalide ou manquant : ${token}`);
    return null;
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        priority: 'high',
      }),
    });

    const resData = await response.json();
    console.log(`[Push] Notification envoyée à ${token}. Réponse d'Expo :`, JSON.stringify(resData));
    return resData;
  } catch (error) {
    console.error(`[Push] Erreur lors de l'envoi de la notification push à ${token} :`, error);
    return null;
  }
}

/**
 * Simule l'envoi d'un e-mail (Mock logger)
 * Le client pourra remplacer cette logique par Firebase ou un autre service SMTP.
 * @param {string} to - Destinataire
 * @param {string} subject - Sujet de l'e-mail
 * @param {string} text - Contenu brut du mail
 * @param {string} html - Contenu HTML du mail
 */
export async function sendEmail(to, subject, text, html) {
  const from = 'Le Poulailler <noreply@lepoulailler.com>';
  
  console.log('\n================== [MOCK EMAIL SENT] ==================');
  console.log(`Date : ${new Date().toISOString()}`);
  console.log(`De : ${from}`);
  console.log(`À : ${to}`);
  console.log(`Sujet : ${subject}`);
  console.log('------------------ [Contenu Texte] ------------------');
  console.log(text);
  console.log('=======================================================\n');
  
  return { mock: true, to, subject, timestamp: new Date().toISOString() };
}

/**
 * Planificateur de notifications en arrière-plan.
 * S'exécute toutes les minutes, calcule l'âge des lots de volailles,
 * et envoie des pushs ou e-mails si des alertes (repas, eau, jalons) sont dues.
 */
export function startNotificationScheduler() {
  console.log('[Scheduler] Planificateur de notifications démarré.');

  // Exécution toutes les 60 secondes
  setInterval(async () => {
    try {
      const store = getStore();
      const now = new Date();

      // Nettoyer les anciennes alertes envoyées (plus de 7 jours) pour ne pas encombrer le store.json
      let needCleanup = false;
      const cleanStore = { ...store };
      if (cleanStore.sentNotifications) {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        Object.entries(cleanStore.sentNotifications).forEach(([key, timestamp]) => {
          if (timestamp < oneWeekAgo) {
            delete cleanStore.sentNotifications[key];
            needCleanup = true;
          }
        });
      }
      if (needCleanup) {
        updateStore((s) => {
          s.sentNotifications = cleanStore.sentNotifications;
          return s;
        });
      }

      // Parcourir les utilisateurs du système
      for (const user of store.users) {
        const prefs = store.notificationPrefs[user.id];
        // Si aucune préférence ou aucun canal activé, on passe
        if (!prefs || (!prefs.email_alerts && !prefs.push_alerts)) {
          continue;
        }

        const data = store.userData[user.id];
        if (!data || !Array.isArray(data.lots_json) || data.lots_json.length === 0) {
          continue;
        }

        const userTimezone = prefs.timezone || 'UTC';
        
        // Obtenir la date et l'heure courante dans le fuseau horaire de l'utilisateur
        const localDateStr = now.toLocaleDateString('en-CA', { timeZone: userTimezone }); // Format YYYY-MM-DD
        const localTimeStr = now.toLocaleTimeString('fr-FR', { timeZone: userTimezone, hour: '2-digit', minute: '2-digit', hour12: false }); // Format HH:MM

        const [currH, currM] = localTimeStr.split(':').map(Number);
        const currentMinutes = currH * 60 + currM;

        for (const lot of data.lots_json) {
          // Effectif = achetés - décès - ventes
          const effectif = lot.nombreVolailles - (lot.deces || 0) - (lot.ventes || 0);
          if (effectif <= 0) continue; // Lot clôturé

          // Calculer l'âge du lot en jours de calendrier dans le fuseau de l'utilisateur (sans décalage lié à l'heure locale du serveur)
          const dAchat = new Date(`${lot.dateAchat}T00:00:00Z`);
          const dLocal = new Date(`${localDateStr}T00:00:00Z`);
          const ageJours = Math.max(0, Math.round((dLocal - dAchat) / (1000 * 60 * 60 * 24)));

          const profil = data.profil_json || {};
          const horairesRepas = profil.horairesRepas || ['07:00', '12:00', '17:00'];
          const horairesEau = profil.horairesEau || ['07:00', '12:00', '17:00'];

          // Construire la liste des alertes théoriques pour ce lot aujourd'hui
          const alerts = [];

          // Alertes Repas
          horairesRepas.forEach((heure, idx) => {
            alerts.push({
              id: `${lot.id}-repas-${heure}`,
              type: 'repas',
              heure,
              titre: `Repas ${idx + 1} — ${lot.libelle || 'Lot'}`,
              detail: `Horaire de distribution de nourriture (${heure}) pour vos ${effectif} sujets.`,
            });
          });

          // Alertes Abreuvoir (Eau)
          horairesEau.forEach((heure, idx) => {
            alerts.push({
              id: `${lot.id}-eau-${heure}`,
              type: 'eau',
              heure,
              titre: `Contrôle Eau ${idx + 1} — ${lot.libelle || 'Lot'}`,
              detail: `Vérification des abreuvoirs (${heure}) pour vos ${effectif} sujets.`,
            });
          });

          // Alertes Jalons d'âge (15j, 30j, 45j) à 07:00
          [15, 30, 45].forEach((jalon) => {
            if (ageJours === jalon) {
              let jalonText = '';
              if (jalon === 15) jalonText = 'Passage en phase croissance (alimentation croissance)';
              else if (jalon === 30) jalonText = 'Passage en phase finition (alimentation finition)';
              else if (jalon === 45) jalonText = 'Lot prêt à la vente (phase de commercialisation)';

              alerts.push({
                id: `${lot.id}-jalon-${jalon}`,
                type: 'jalon',
                heure: '07:00',
                titre: `Jalon J${jalon} — ${lot.libelle || 'Lot'}`,
                detail: jalonText,
              });
            }
          });

          // Analyser chaque alerte
          for (const alerte of alerts) {
            const [alH, alM] = alerte.heure.split(':').map(Number);
            const alertMinutes = alH * 60 + alM;

            // L'alerte est due si l'heure courante de l'utilisateur a dépassé l'heure de l'alerte,
            // et si l'alerte n'est pas trop ancienne (dans les 30 dernières minutes) pour éviter
            // l'envoi d'alertes en retard suite à un redémarrage serveur
            if (currentMinutes >= alertMinutes && currentMinutes < alertMinutes + 30) {
              const sentKey = `${user.id}-${alerte.id}-${localDateStr}`;

              // Si déjà envoyé aujourd'hui, on saute
              if (store.sentNotifications?.[sentKey]) {
                continue;
              }

              console.log(`[Scheduler] Alerte détectée en tâche de fond pour l'utilisateur ${user.id} : ${alerte.titre}`);

              // Envoi Push (Expo mobile + FCM web/appareils)
              if (prefs.push_alerts) {
                if (prefs.expo_push_token) {
                  sendExpoPushNotification(
                    prefs.expo_push_token,
                    `🐔 ${alerte.titre}`,
                    alerte.detail,
                    { alerteId: alerte.id, type: alerte.type }
                  ).catch((err) => console.error('[Scheduler] Erreur push Expo :', err));
                }
                const fcmTokens = prefs.fcm_tokens || [];
                if (fcmTokens.length > 0) {
                  sendFcmToUserTokens(
                    fcmTokens,
                    `🐔 ${alerte.titre}`,
                    alerte.detail,
                    { alerteId: alerte.id, type: alerte.type, url: '/?tab=alertes' }
                  ).catch((err) => console.error('[Scheduler] Erreur push FCM :', err));
                }
              }

              // Envoi Email simulé
              if (prefs.email_alerts && user.email) {
                sendEmail(
                  user.email,
                  `🐔 Le Poulailler : ${alerte.titre}`,
                  `Bonjour ${user.nom || ''},\n\nVoici votre rappel :\n- Alerte : ${alerte.titre}\n- Détails : ${alerte.detail}\n- Heure prévue : ${alerte.heure}\n\nBonne journée,\nL'équipe Le Poulailler`,
                  `<div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #d4af5f;">🐔 Le Poulailler</h2>
                    <p>Bonjour <strong>${user.nom || ''}</strong>,</p>
                    <p>Voici votre rappel automatique :</p>
                    <div style="background: #fdfaf2; padding: 15px; border-left: 4px solid #d4af5f; margin: 15px 0;">
                      <p style="margin: 0; font-size: 1.1em; font-weight: bold;">${alerte.titre}</p>
                      <p style="margin: 5px 0 0 0; color: #666;">${alerte.detail}</p>
                      <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #999;">Horaire prévu : ${alerte.heure}</p>
                    </div>
                    <p>Bonne journée !</p>
                  </div>`
                ).catch(err => console.error('[Scheduler] Erreur email en tâche de fond :', err));
              }

              // Enregistrer l'envoi
              updateStore((s) => {
                if (!s.sentNotifications) s.sentNotifications = {};
                s.sentNotifications[sentKey] = new Date().toISOString();
                return s;
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('[Scheduler] Erreur critique dans la boucle de vérification :', err);
    }
  }, 60 * 1000);
}
