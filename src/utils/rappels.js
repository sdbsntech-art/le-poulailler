/** Libellés des 3 repas par défaut */
export const REPAS_LABELS = ['Matin', 'Après-midi', 'Soir'];

export const HORAIRES_REPAS_DEFAUT = ['07:00', '12:00', '17:00'];

/** Horaires eau par défaut — modifiables par l'utilisateur dans Paramètres */
export const HORAIRES_EAU_DEFAUT = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

export const RAPPEL_DEFAUT = {
  intervalMinutes: 10,
  repetitions: 4,
};

export function parseTimeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(totalMin) {
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Crée les créneaux de rappel : ex. 07:00 → 07:00, 07:10, 07:20, 07:30 */
export function genererSlotsRappel(heureBase, intervalMin = 10, repetitions = 4) {
  const start = parseTimeToMinutes(heureBase);
  const slots = [];
  for (let i = 0; i < repetitions; i++) {
    slots.push({
      index: i,
      heure: minutesToTime(start + i * intervalMin),
      debutMin: start + i * intervalMin,
      finMin: start + i * intervalMin + intervalMin,
    });
  }
  return slots;
}

export function getRappelConfig(profil = {}) {
  return {
    intervalMinutes: profil.rappelIntervalMinutes ?? RAPPEL_DEFAUT.intervalMinutes,
    repetitions: profil.rappelRepetitions ?? RAPPEL_DEFAUT.repetitions,
  };
}

export function getActiveRepeatSlot(heureBase, now, intervalMin, repetitions) {
  const current = now.getHours() * 60 + now.getMinutes();
  const slots = genererSlotsRappel(heureBase, intervalMin, repetitions);
  for (const slot of slots) {
    if (current >= slot.debutMin && current < slot.finMin) {
      return slot;
    }
  }
  return null;
}

export function isPastLastRepeat(heureBase, now, intervalMin, repetitions) {
  const current = now.getHours() * 60 + now.getMinutes();
  const slots = genererSlotsRappel(heureBase, intervalMin, repetitions);
  const last = slots[slots.length - 1];
  return current >= last.finMin;
}

export function isBeforeFirstRepeat(heureBase, now) {
  const current = now.getHours() * 60 + now.getMinutes();
  return current < parseTimeToMinutes(heureBase);
}

export function formatPlageRappel(heureBase, intervalMin, repetitions) {
  const slots = genererSlotsRappel(heureBase, intervalMin, repetitions);
  if (slots.length === 0) return heureBase;
  return `${slots[0].heure} → ${minutesToTime(slots[slots.length - 1].debutMin)} (toutes les ${intervalMin} min)`;
}
