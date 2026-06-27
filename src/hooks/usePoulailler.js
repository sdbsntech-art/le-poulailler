import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

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
  const { accessGranted, isAuthenticated, fetchCloudData, syncToCloud } = useAuth();
  const [lots, setLots] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const skipSave = useRef(false);

  useEffect(() => {
    if (!accessGranted) {
      setLots([]);
      setHydrated(true);
      return;
    }

    async function hydrate() {
      skipSave.current = true;
      if (isAuthenticated) {
        try {
          const remote = await fetchCloudData();
          if (remote?.lots?.length) {
            setLots(remote.lots);
          } else {
            setLots(loadLots());
          }
        } catch {
          setLots(loadLots());
        }
      } else {
        setLots(loadLots());
      }
      setHydrated(true);
      setTimeout(() => {
        skipSave.current = false;
      }, 100);
    }
    hydrate();
  }, [accessGranted, isAuthenticated, fetchCloudData]);

  useEffect(() => {
    if (!hydrated || !accessGranted || skipSave.current) return;
    saveLots(lots);
    if (isAuthenticated) {
      syncToCloud(lots, undefined).catch(() => {});
    }
  }, [lots, hydrated, accessGranted, isAuthenticated, syncToCloud]);

  const guard = useCallback(
    (fn) =>
      (...args) => {
        if (!accessGranted) return null;
        return fn(...args);
      },
    [accessGranted]
  );

  const ajouterLot = useCallback(
    guard(({ dateAchat, quantiteInitiale, libelle = '' }) => {
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
    }),
    [guard]
  );

  const supprimerLot = useCallback(
    guard((id) => {
      setLots((prev) => prev.filter((l) => l.id !== id));
    }),
    [guard]
  );

  const enregistrerDeces = useCallback(
    guard((lotId, { date, quantite, note = '' }) => {
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
    }),
    [guard]
  );

  const enregistrerVente = useCallback(
    guard((lotId, { date, quantite, note = '' }) => {
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
    }),
    [guard]
  );

  const modifierLot = useCallback(
    guard((id, updates) => {
      setLots((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    }),
    [guard]
  );

  const replaceLots = useCallback(
    (next) => {
      if (!accessGranted) return;
      setLots(next);
    },
    [accessGranted]
  );

  return {
    lots,
    hydrated,
    ajouterLot,
    supprimerLot,
    enregistrerDeces,
    enregistrerVente,
    modifierLot,
    replaceLots,
  };
}
