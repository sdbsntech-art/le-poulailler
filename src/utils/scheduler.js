import { parseISO, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PLANNING_TRAITEMENTS } from '../data/planning.js';
import {
  HORAIRES_REPAS_DEFAUT,
  CONTROLES_EAU_PAR_PHASE,
  genererHorairesEau,
  calculerBesoinsJournaliers,
} from '../data/alimentation.js';
import { getAgeJours, getEffectifLot, getPhaseFromAge } from './phases.js';
import { MEDICAMENTS_PAR_PHASE } from '../data/medicaments.js';

const TYPES = {
  MEDICAMENT: 'medicament',
  ALIMENT: 'aliment',
  EAU: 'eau',
  JALON: 'jalon',
};

function parseHour(h) {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + (mm || 0);
}

function isDueNow(heure, now, fenetreMin = 30) {
  const [h, m] = heure.split(':').map(Number);
  const target = h * 60 + m;
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= target - fenetreMin && current < target + fenetreMin;
}

function isPastToday(heure, now) {
  const [h, m] = heure.split(':').map(Number);
  return now.getHours() * 60 + now.getMinutes() > h * 60 + m + 30;
}

function medAppliesOnDay(plan, ageJours, dateRef, dateAchat) {
  if (plan.dayRange) {
    if (ageJours < plan.dayRange.from || ageJours > plan.dayRange.to) return false;
  }
  if (plan.days?.length && plan.days.includes(ageJours)) return true;
  if (plan.altDays?.includes(ageJours)) return true;

  const achat = parseISO(dateAchat);
  const weekday = dateRef.getDay();

  if (plan.weekdays?.includes(weekday)) {
    if (plan.dayRange) {
      return ageJours >= plan.dayRange.from && ageJours <= plan.dayRange.to;
    }
    return true;
  }

  if (plan.weekdaysAfter && ageJours >= plan.weekdaysAfter.fromDay && ageJours <= plan.weekdaysAfter.toDay) {
    return plan.weekdaysAfter.weekdays.includes(weekday);
  }

  if (plan.dayRange && !plan.days?.length && !plan.weekdays) {
    return ageJours >= plan.dayRange.from && ageJours <= plan.dayRange.to;
  }

  return false;
}

function getMedDetails(phase, nom) {
  const list = MEDICAMENTS_PAR_PHASE[phase] || [];
  return list.find((m) => m.nom === nom || m.nom.startsWith(nom.split(' ')[0]));
}

export function buildAlertesPourLot(lot, options = {}) {
  const now = options.now || new Date();
  const horairesRepas = options.horairesRepas || HORAIRES_REPAS_DEFAUT;
  const age = getAgeJours(lot.dateAchat, now);
  const effectif = getEffectifLot(lot);
  const phase = getPhaseFromAge(age);
  const libelle = lot.libelle || `Lot J${age}`;
  const alertes = [];

  if (effectif <= 0) return alertes;

  const besoins = calculerBesoinsJournaliers(effectif, age);

  horairesRepas.forEach((heure, i) => {
    alertes.push({
      id: `${lot.id}-repas-${heure}`,
      lotId: lot.id,
      lotLibelle: libelle,
      type: TYPES.ALIMENT,
      heure,
      titre: `Repas ${i + 1}/3 — ${libelle}`,
      detail: `${besoins.parRepasKg} kg (~${besoins.parRepasGrammes} g) pour ${effectif} sujets`,
      effectif,
      age,
      phase,
      priorite: 2,
    });
  });

  const nbEau = CONTROLES_EAU_PAR_PHASE[phase];
  const horairesEau = genererHorairesEau(nbEau);
  horairesEau.forEach((heure, i) => {
    alertes.push({
      id: `${lot.id}-eau-${heure}`,
      lotId: lot.id,
      lotLibelle: libelle,
      type: TYPES.EAU,
      heure,
      titre: `Eau ${i + 1}/${nbEau} — ${libelle}`,
      detail: `Vérifier abreuvoirs · ~${besoins.litresParControle} L · Total jour: ${besoins.eauLitres} L`,
      effectif,
      age,
      phase,
      priorite: 1,
    });
  });

  for (const plan of PLANNING_TRAITEMENTS) {
    if (plan.phase !== phase) continue;
    if (plan.optional) continue;

    if (!medAppliesOnDay(plan, age, now, lot.dateAchat)) continue;

    const med = getMedDetails(plan.phase, plan.nom);
    const hours = plan.hours || ['08:00'];

    for (const heure of hours) {
      alertes.push({
        id: `${lot.id}-med-${plan.id}-${heure}`,
        lotId: lot.id,
        lotLibelle: libelle,
        type: TYPES.MEDICAMENT,
        heure,
        titre: `💊 ${plan.nom}`,
        detail: med
          ? `${med.dosage} — ${med.frequence}${plan.note ? ` (${plan.note})` : ''}`
          : plan.note || 'Voir protocole',
        effectif,
        age,
        phase,
        priorite: 3,
      });
    }
  }

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
  const now = options.now || new Date();
  const actifs = lots.filter((l) => getEffectifLot(l) > 0);
  return actifs
    .flatMap((lot) => buildAlertesPourLot(lot, options))
    .sort((a, b) => parseHour(a.heure) - parseHour(b.heure));
}

export function enrichirStatutAlertes(alertes, completedIds, now = new Date()) {
  return alertes.map((a) => {
    const done = completedIds.includes(a.id);
    const due = isDueNow(a.heure, now);
    const missed = !done && isPastToday(a.heure, now);
    const upcoming = !done && !missed && !due;
    let statut = 'a-venir';
    if (done) statut = 'fait';
    else if (due) statut = 'maintenant';
    else if (missed) statut = 'en-retard';

    return { ...a, statut, done, due, missed, upcoming };
  });
}

export function getAlertesUrgentes(alertes) {
  return alertes.filter((a) => a.statut === 'maintenant' || a.statut === 'en-retard');
}

export function formatDateLong(date) {
  return format(date, "EEEE d MMMM yyyy — HH:mm", { locale: fr });
}

export { TYPES, isDueNow };
