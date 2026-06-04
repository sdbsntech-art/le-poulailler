import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'le-poulailler-profil';

const DEFAULT = {
  horairesRepas: ['07:00', '12:00', '17:00'],
  notifyNavigateur: true,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        horairesRepas: parsed.horairesRepas || DEFAULT.horairesRepas,
        notifyNavigateur: parsed.notifyNavigateur !== false,
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
    setProfil((prev) => ({ ...prev, ...data }));
  }, []);

  return { profil, enregistrerProfil };
}
