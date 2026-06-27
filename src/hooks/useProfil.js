import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HORAIRES_REPAS_DEFAUT,
  HORAIRES_EAU_DEFAUT,
  RAPPEL_DEFAUT,
} from '../utils/rappels.js';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'le-poulailler-profil';

const DEFAULT = {
  horairesRepas: [...HORAIRES_REPAS_DEFAUT],
  horairesEau: [...HORAIRES_EAU_DEFAUT],
  rappelIntervalMinutes: RAPPEL_DEFAUT.intervalMinutes,
  rappelRepetitions: RAPPEL_DEFAUT.repetitions,
  sonRappel: true,
  notifyNavigateur: false,
  rappelsConfigures: false,
};

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        horairesRepas: parsed.horairesRepas?.length === 3 ? parsed.horairesRepas : DEFAULT.horairesRepas,
        horairesEau:
          Array.isArray(parsed.horairesEau) && parsed.horairesEau.length > 0
            ? parsed.horairesEau
            : DEFAULT.horairesEau,
        rappelIntervalMinutes: parsed.rappelIntervalMinutes ?? DEFAULT.rappelIntervalMinutes,
        rappelRepetitions: parsed.rappelRepetitions ?? DEFAULT.rappelRepetitions,
        sonRappel: parsed.sonRappel !== false,
        notifyNavigateur: false,
        rappelsConfigures: parsed.rappelsConfigures === true || !!parsed.horairesRepas,
      };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT };
}

function saveLocal(profil) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profil));
}

export function useProfil() {
  const { accessGranted, isAuthenticated, fetchCloudData, syncToCloud, notificationPrefs } = useAuth();
  const [profil, setProfil] = useState(DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const skipSave = useRef(false);

  useEffect(() => {
    if (!accessGranted) {
      setProfil(DEFAULT);
      setHydrated(true);
      return;
    }

    async function hydrate() {
      skipSave.current = true;
      if (isAuthenticated) {
        try {
          const remote = await fetchCloudData();
          const merged = { ...loadLocal(), ...(remote?.profil || {}) };
          merged.notifyNavigateur = notificationPrefs.browserAlerts;
          setProfil(merged);
        } catch {
          setProfil(loadLocal());
        }
      } else {
        setProfil(loadLocal());
      }
      setHydrated(true);
      setTimeout(() => {
        skipSave.current = false;
      }, 100);
    }
    hydrate();
  }, [accessGranted, isAuthenticated, fetchCloudData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setProfil((p) => ({ ...p, notifyNavigateur: notificationPrefs.browserAlerts }));
  }, [notificationPrefs.browserAlerts, isAuthenticated]);

  useEffect(() => {
    if (!hydrated || !accessGranted || skipSave.current) return;
    const toSave = {
      ...profil,
      notifyNavigateur: isAuthenticated ? notificationPrefs.browserAlerts : false,
    };
    saveLocal(toSave);
    if (isAuthenticated) {
      syncToCloud(undefined, toSave).catch(() => {});
    }
  }, [profil, hydrated, accessGranted, isAuthenticated, syncToCloud, notificationPrefs.browserAlerts]);

  const enregistrerProfil = useCallback((data) => {
    setProfil((prev) => ({ ...prev, ...data, rappelsConfigures: true }));
  }, []);

  return { profil, enregistrerProfil, hydrated };
}
