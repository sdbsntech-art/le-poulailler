/** Horaires par défaut — modifiables dans le profil */
export const HORAIRES_REPAS_DEFAUT = ['07:00', '12:00', '17:00'];

/** Nombre de contrôles eau / jour selon la phase (poussins = besoins élevés) */
export const CONTROLES_EAU_PAR_PHASE = {
  primaire: 6,
  croissance: 5,
  finition: 4,
  pret: 3,
};

/** Fenêtre journalière pour répartir l'eau (heures) */
export const FENETRE_EAU = { debut: 6, fin: 20 };

/** Consommation estimée (g aliment / poulet / jour) selon l'âge */
export function getGrammesParPouletJour(ageJours) {
  if (ageJours <= 7) return 18 + ageJours * 2;
  if (ageJours <= 14) return 30 + (ageJours - 7) * 4;
  if (ageJours <= 21) return 58 + (ageJours - 14) * 5;
  if (ageJours <= 28) return 93 + (ageJours - 21) * 6;
  if (ageJours <= 35) return 135 + (ageJours - 28) * 7;
  if (ageJours <= 45) return 184 + (ageJours - 35) * 5;
  return 240;
}

/** Ratio eau / aliment (L par kg d'aliment consommé) */
export function getRatioEau(ageJours) {
  if (ageJours <= 14) return 2.4;
  if (ageJours <= 30) return 2.0;
  return 1.8;
}

export function calculerBesoinsJournaliers(effectif, ageJours) {
  if (effectif <= 0) {
    return { alimentKg: 0, eauLitres: 0, parRepasKg: 0, parRepasGrammes: 0, litresParControle: 0 };
  }
  const gParPoulet = getGrammesParPouletJour(ageJours);
  const alimentKg = (effectif * gParPoulet) / 1000;
  const eauLitres = alimentKg * getRatioEau(ageJours);
  const parRepasKg = alimentKg / 3;
  const controles = CONTROLES_EAU_PAR_PHASE[getPhaseKey(ageJours)] || 4;

  return {
    alimentKg: round2(alimentKg),
    eauLitres: round2(eauLitres),
    parRepasKg: round2(parRepasKg),
    parRepasGrammes: Math.round((gParPoulet * effectif) / 3),
    litresParControle: round2(eauLitres / controles),
    grammesParPoulet: gParPoulet,
    nombreRepas: 3,
    nombreControlesEau: controles,
  };
}

function getPhaseKey(ageJours) {
  if (ageJours < 15) return 'primaire';
  if (ageJours < 30) return 'croissance';
  if (ageJours < 45) return 'finition';
  return 'pret';
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

export function genererHorairesEau(nombreControles, fenetre = FENETRE_EAU) {
  if (nombreControles <= 0) return [];
  const duree = fenetre.fin - fenetre.debut;
  const pas = duree / (nombreControles - 1 || 1);
  const horaires = [];
  for (let i = 0; i < nombreControles; i++) {
    const h = Math.floor(fenetre.debut + pas * i);
    const m = Math.round(((fenetre.debut + pas * i) % 1) * 60) || 0;
    horaires.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return [...new Set(horaires)];
}
