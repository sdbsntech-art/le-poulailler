import { useState, useEffect, useCallback, useMemo } from 'react';

const COMPLETED_KEY = 'le-poulailler-completed';
const LOG_KEY = 'le-poulailler-msg-log';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadCompleted() {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {};
}

function loadLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

export function useAlertes() {
  const [completedByDay, setCompletedByDay] = useState(loadCompleted);
  const [messageLog, setMessageLog] = useState(loadLog);

  useEffect(() => {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedByDay));
  }, [completedByDay]);

  useEffect(() => {
    localStorage.setItem(LOG_KEY, JSON.stringify(messageLog.slice(0, 200)));
  }, [messageLog]);

  const completedIds = useMemo(
    () => completedByDay[todayKey()] || [],
    [completedByDay]
  );

  const marquerFait = useCallback((alerteId) => {
    const key = todayKey();
    setCompletedByDay((prev) => {
      const list = prev[key] || [];
      if (list.includes(alerteId)) return prev;
      return { ...prev, [key]: [...list, alerteId] };
    });
  }, []);

  const annulerFait = useCallback((alerteId) => {
    const key = todayKey();
    setCompletedByDay((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((id) => id !== alerteId),
    }));
  }, []);

  const ajouterMessageLog = useCallback((entry) => {
    setMessageLog((prev) => [
      {
        id: `msg-${Date.now()}`,
        at: new Date().toISOString(),
        ...entry,
      },
      ...prev,
    ]);
  }, []);

  return {
    completedIds,
    marquerFait,
    annulerFait,
    messageLog,
    ajouterMessageLog,
  };
}
