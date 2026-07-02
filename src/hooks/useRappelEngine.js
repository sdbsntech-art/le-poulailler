import { useEffect } from 'react';
import { buildToutesAlertes, enrichirStatutAlertes, getAlertesActivesMaintenant } from '../utils/scheduler';
import { jouerSonRappel } from '../utils/alertSound';
import { dispatcherRappel } from '../utils/notifyDispatch';
import { apiTriggerNotification } from '../utils/api';

const DISPATCHED_KEY = 'le-poulailler-dispatched';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDispatchedToday() {
  try {
    const raw = sessionStorage.getItem(DISPATCHED_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data[todayKey()] || [];
  } catch {
    return [];
  }
}

function markDispatched(key) {
  try {
    const raw = sessionStorage.getItem(DISPATCHED_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const list = data[todayKey()] || [];
    if (!list.includes(key)) {
      data[todayKey()] = [...list, key];
      sessionStorage.setItem(DISPATCHED_KEY, JSON.stringify(data));
    }
  } catch {
    /* ignore */
  }
}

function slotDispatchKey(alerte) {
  const idx = alerte.repeatIndex ?? 0;
  return `${alerte.id}-slot-${idx}-${todayKey()}`;
}

/** Rappels automatiques : site + son (+ navigateur si compte connecté). */
export function useRappelEngine(lots, profil, options) {
  const { completedIds, ajouterMessageLog, enabled = true, browserAlerts = false } = options;

  useEffect(() => {
    if (!enabled || !profil.rappelsConfigures) return;

    function tick() {
      const now = new Date();
      const alertes = enrichirStatutAlertes(
        buildToutesAlertes(lots, {
          horairesRepas: profil.horairesRepas,
          horairesEau: profil.horairesEau,
          now,
        }),
        completedIds,
        now,
        profil
      );

      const actives = getAlertesActivesMaintenant(alertes);
      const dispatched = getDispatchedToday();
      let sonJoue = false;

      for (const a of actives) {
        const key = slotDispatchKey(a);
        if (dispatched.includes(key)) continue;

        if (profil.sonRappel && !sonJoue) {
          jouerSonRappel();
          sonJoue = true;
        }

        if (browserAlerts) {
          dispatcherRappel(
            a,
            { ...profil, notifyNavigateur: true },
            ajouterMessageLog,
            {
              repeatLabel: a.repeatIndex != null ? `Rappel ${a.repeatIndex + 1}/${a.repeatTotal}` : null,
            }
          );
        } else {
          ajouterMessageLog({
            alerteId: a.id,
            titre: a.titre,
            heure: a.slotHeure || a.heure,
            canaux: profil.sonRappel ? 'site+son' : 'site',
            repeatLabel: a.repeatIndex != null ? `Rappel ${a.repeatIndex + 1}/${a.repeatTotal}` : null,
          });
        }

        // Déclencher les notifications e-mail / push sur le serveur si configuré
        if (options.token && (options.notificationPrefs?.pushAlerts || options.notificationPrefs?.emailAlerts)) {
          apiTriggerNotification(options.token, {
            alerteId: a.id,
            titre: a.titre,
            detail: a.detail,
            heure: a.slotHeure || a.heure,
            type: a.type
          }).catch(err => console.error('[useRappelEngine] Erreur déclenchement notif serveur :', err));
        }

        markDispatched(key);
      }
    }

    tick();
    const id = setInterval(tick, 15 * 1000);
    return () => clearInterval(id);
  }, [lots, profil, completedIds, ajouterMessageLog, enabled, browserAlerts, options.token, options.notificationPrefs]);
}
