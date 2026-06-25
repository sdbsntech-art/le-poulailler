import { differenceInDays, parseISO, addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PHASES } from '../data/phases.js';

export function getAgeJours(dateAchat, referenceDate = new Date()) {
  const achat = typeof dateAchat === 'string' ? parseISO(dateAchat) : dateAchat;
  return Math.max(0, differenceInDays(referenceDate, achat));
}

export function getPhaseFromAge(ageJours) {
  if (ageJours < 15) return 'primaire';
  if (ageJours < 30) return 'croissance';
  if (ageJours < 45) return 'finition';
  return 'pret';
}

export function getPhaseInfo(ageJours) {
  const id = getPhaseFromAge(ageJours);
  return { id, ...PHASES[id] };
}

export function getJoursRestantsPhase(ageJours) {
  const phase = getPhaseFromAge(ageJours);
  const max = PHASES[phase].jourMax;
  if (max === null) return null;
  return max - ageJours + 1;
}

export function getProchainJalon(ageJours) {
  if (ageJours < 15) return { jour: 15, label: 'Croissance', reste: 15 - ageJours };
  if (ageJours < 30) return { jour: 30, label: 'Finition', reste: 30 - ageJours };
  if (ageJours < 45) return { jour: 45, label: 'Vente', reste: 45 - ageJours };
  return null;
}

export function getDateJalon(dateAchat, jourJalon) {
  const achat = typeof dateAchat === 'string' ? parseISO(dateAchat) : dateAchat;
  return format(addDays(achat, jourJalon), 'dd MMMM yyyy', { locale: fr });
}

export function getEffectifLot(lot) {
  const deces = (lot.deces || []).reduce((s, d) => s + (d.quantite || 0), 0);
  const ventes = (lot.ventes || []).reduce((s, v) => s + (v.quantite || 0), 0);
  return Math.max(0, lot.quantiteInitiale - deces - ventes);
}

export function computeStatsGlobales(lots) {
  const stats = {
    total: 0,
    primaire: 0,
    croissance: 0,
    finition: 0,
    pret: 0,
    vendus: 0,
    morts: 0,
    lotsActifs: 0,
  };

  for (const lot of lots) {
    const effectif = getEffectifLot(lot);
    const age = getAgeJours(lot.dateAchat);
    const phase = getPhaseFromAge(age);

    stats.vendus += (lot.ventes || []).reduce((s, v) => s + (v.quantite || 0), 0);
    stats.morts += (lot.deces || []).reduce((s, d) => s + (d.quantite || 0), 0);

    if (effectif > 0) {
      stats.lotsActifs += 1;
      stats.total += effectif;
      stats[phase] += effectif;
    }
  }

  return stats;
}
