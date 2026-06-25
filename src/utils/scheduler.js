import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { calculerBesoinsJournaliers } from '../data/alimentation.js';
import { getAgeJours, getEffectifLot, getPhaseFromAge } from './phases.js';
import {
  HORAIRES_REPAS_DEFAUT,
  HORAIRES_EAU_DEFAUT,
  REPAS_LABELS,
  getRappelConfig,
  getActiveRepeatSlot,
  isPastLastRepeat,
  isBeforeFirstRepeat,
  genererSlotsRappel,
} from './rappels.js';

const TYPES = {
  ALIMENT: 'aliment',
  EAU: 'eau',
  JALON: 'jalon',
};

function parseHour(h) {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + (mm || 0);
}

export function buildAlertesPourLot(lot, options = {}) {
  const horairesRepas = options.horairesRepas || HORAIRES_REPAS_DEFAUT;
  const horairesEau = options.horairesEau || HORAIRES_EAU_DEFAUT;
  const age = getAgeJours(lot.dateAchat, options.now || new Date());
  const effectif = getEffectifLot(lot);
  const phase = getPhaseFromAge(age);
  const libelle = lot.libelle || `Lot J${age}`;
  const alertes = [];

  if (effectif <= 0) return alertes;

  const besoins = calculerBesoinsJournaliers(effectif, age, horairesRepas.length);

  horairesRepas.forEach((heure, i) => {
    alertes.push({
      id: `${lot.id}-repas-${heure}`,
      lotId: lot.id,
      lotLibelle: libelle,
      type: TYPES.ALIMENT,
      heure,
      repasLabel: REPAS_LABELS[i] || `Repas ${i + 1}`,
      titre: `${REPAS_LABELS[i] || `Repas ${i + 1}`} — ${libelle}`,
      detail: `${besoins.parRepasKg} kg (~${besoins.parRepasGrammes} g) · ${effectif} sujets · horaire ${heure}`,
      effectif,
      age,
      phase,
      priorite: 2,
    });
  });

  horairesEau.forEach((heure, i) => {
    alertes.push({
      id: `${lot.id}-eau-${heure}`,
      lotId: lot.id,
      lotLibelle: libelle,
      type: TYPES.EAU,
      heure,
      titre: `Eau ${i + 1}/${horairesEau.length} — ${libelle}`,
      detail: `Vérifier abreuvoirs · ~${besoins.litresParControle} L · Total jour: ${besoins.eauLitres} L · horaire ${heure}`,
      effectif,
      age,
      phase,
      priorite: 1,
    });
  });

  [15, 30, 45].forEach((jalon) => {
    if (age === jalon) {
      alertes.push({
        id: `${lot.id}-jalon-${jalon}`,
        lotId: lot.id,
        lotLibelle: libelle,
        type: TYPES.JALON,
        heure: '07:00',
        titre: `Jalon J${jalon} — ${libelle}`,
        detail:
          jalon === 15
            ? 'Passage en phase croissance'
            : jalon === 30
              ? 'Passage en finition'
              : 'Prêt à la vente',
        effectif,
        age,
        phase,
        priorite: 4,
      });
    }
  });

  return alertes.sort((a, b) => parseHour(a.heure) - parseHour(b.heure));
}

export function buildToutesAlertes(lots, options = {}) {
  const actifs = lots.filter((l) => getEffectifLot(l) > 0);
  return actifs
    .flatMap((lot) => buildAlertesPourLot(lot, options))
    .sort((a, b) => parseHour(a.heure) - parseHour(b.heure));
}

export function enrichirStatutAlertes(alertes, completedIds, now = new Date(), profil = {}) {
  const { intervalMinutes, repetitions } = getRappelConfig(profil);

  return alertes.map((a) => {
    const done = completedIds.includes(a.id);

    if (a.type === TYPES.JALON) {
      const due = now.getHours() >= 7 && now.getHours() < 10;
      const missed = !done && now.getHours() >= 10;
      let statut = 'a-venir';
      if (done) statut = 'fait';
      else if (due) statut = 'maintenant';
      else if (missed) statut = 'en-retard';
      return { ...a, statut, done, intervalMinutes, repetitions };
    }

    const slot = getActiveRepeatSlot(a.heure, now, intervalMinutes, repetitions);
    const missed = !done && isPastLastRepeat(a.heure, now, intervalMinutes, repetitions);
    const upcoming = !done && !slot && !missed && isBeforeFirstRepeat(a.heure, now);

    let statut = 'a-venir';
    if (done) statut = 'fait';
    else if (slot) statut = 'maintenant';
    else if (missed) statut = 'en-retard';

    const slots = genererSlotsRappel(a.heure, intervalMinutes, repetitions);

    return {
      ...a,
      statut,
      done,
      upcoming,
      missed,
      due: !!slot,
      intervalMinutes,
      repetitions,
      repeatIndex: slot?.index ?? null,
      repeatTotal: repetitions,
      slotHeure: slot?.heure ?? null,
      plageRappel: slots.length
        ? `${slots[0].heure}–${slots[slots.length - 1].heure}`
        : a.heure,
    };
  });
}

export function getAlertesUrgentes(alertes) {
  return alertes.filter((a) => a.statut === 'maintenant' || a.statut === 'en-retard');
}

export function getAlertesActivesMaintenant(alertes) {
  return alertes.filter((a) => a.statut === 'maintenant');
}

export function formatDateLong(date) {
  return format(date, "EEEE d MMMM yyyy — HH:mm", { locale: fr });
}

export { TYPES };
