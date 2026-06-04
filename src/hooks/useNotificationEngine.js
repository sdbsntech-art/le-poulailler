import { useEffect, useRef } from 'react';
import { buildToutesAlertes, enrichirStatutAlertes } from '../utils/scheduler';
import { dispatcherRappel } from '../utils/notifyDispatch';

const DISPATCHED_KEY = 'le-poulailler-dispatched';

function getDispatchedToday() {
  try {
    const raw = sessionStorage.getItem(DISPATCHED_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const today = new Date().toISOString().slice(0, 10);
    return data[today] || [];
  } catch {
    return [];
  }
}

function markDispatched(id) {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = sessionStorage.getItem(DISPATCHED_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const list = data[today] || [];
    if (!list.includes(id)) {
      data[today] = [...list, id];
      sessionStorage.setItem(DISPATCHED_KEY, JSON.stringify(data));
    }
  } catch {
    /* ignore */
  }
}

export function useNotificationEngine(lots, profil, options) {
  const { completedIds, ajouterMessageLog, enabled = true } = options;
  const profilRef = useRef(profil);
  profilRef.current = profil;

  useEffect(() => {
    if (!enabled || !profil.notifyNavigateur) return;

    function tick() {
      const now = new Date();
      const alertes = enrichirStatutAlertes(
        buildToutesAlertes(lots, { horairesRepas: profil.horairesRepas, now }),
        completedIds,
        now
      );
      const dispatched = getDispatchedToday();

      for (const a of alertes) {
        if (a.statut !== 'maintenant') continue;
        const dispatchKey = `${a.id}-${now.toISOString().slice(0, 16)}`;
        if (dispatched.includes(dispatchKey)) continue;

        dispatcherRappel(a, profilRef.current, ajouterMessageLog);
        markDispatched(dispatchKey);
      }
    }

    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [lots, profil, completedIds, ajouterMessageLog, enabled]);
}
