import { useState, useEffect } from 'react';

/** Rafraîchit l'UI chaque minute pour totaux et alertes en temps réel */
export function useLiveClock(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
