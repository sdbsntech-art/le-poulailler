import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'le-poulailler-data';

function loadLots() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

function saveLots(lots) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lots));
}

function generateId() {
  return `lot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function usePoulailler() {
  const [lots, setLots] = useState(loadLots);

  useEffect(() => {
    saveLots(lots);
  }, [lots]);

  const ajouterLot = useCallback(({ dateAchat, quantiteInitiale, libelle = '' }) => {
    const lot = {
      id: generateId(),
      dateAchat,
      quantiteInitiale: Number(quantiteInitiale),
      libelle: libelle.trim(),
      deces: [],
      ventes: [],
      createdAt: new Date().toISOString(),
    };
    setLots((prev) => [lot, ...prev]);
    return lot;
  }, []);

  const supprimerLot = useCallback((id) => {
    setLots((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const enregistrerDeces = useCallback((lotId, { date, quantite, note = '' }) => {
    setLots((prev) =>
      prev.map((l) =>
        l.id === lotId
          ? {
              ...l,
              deces: [...(l.deces || []), { id: generateId(), date, quantite: Number(quantite), note }],
            }
          : l
      )
    );
  }, []);

  const enregistrerVente = useCallback((lotId, { date, quantite, note = '' }) => {
    setLots((prev) =>
      prev.map((l) =>
        l.id === lotId
          ? {
              ...l,
              ventes: [...(l.ventes || []), { id: generateId(), date, quantite: Number(quantite), note }],
            }
          : l
      )
    );
  }, []);

  const modifierLot = useCallback((id, updates) => {
    setLots((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  }, []);

  return {
    lots,
    ajouterLot,
    supprimerLot,
    enregistrerDeces,
    enregistrerVente,
    modifierLot,
  };
}
