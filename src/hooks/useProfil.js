import { useState, useEffect, useCallback } from 'react';
import {
  HORAIRES_REPAS_DEFAUT,
  HORAIRES_EAU_DEFAUT,
  RAPPEL_DEFAUT,
} from '../utils/rappels.js';

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

function load() {
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

function save(profil) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profil));
}

export function useProfil() {
  const [profil, setProfil] = useState(load);

  useEffect(() => {
    save(profil);
  }, [profil]);

  const enregistrerProfil = useCallback((data) => {
    setProfil((prev) => ({ ...prev, ...data, rappelsConfigures: true }));
  }, []);

  return { profil, enregistrerProfil };
}
