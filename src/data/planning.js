/**
 * Planning structuré des traitements (jour = jour depuis date d'achat, base 0)
 * hours: heures d'application ["08:00"]
 */
export const PLANNING_TRAITEMENTS = [
  { id: 'glucose', phase: 'primaire', nom: 'Glucose + électrolytes', days: [0, 1], hours: ['07:00', '17:00'] },
  { id: 'vit-ad3e', phase: 'primaire', nom: 'Vitamines AD3E', days: [0, 1, 2, 3, 4, 5, 6], hours: ['08:00'], weekdaysAfter: { fromDay: 7, toDay: 14, weekdays: [1, 4], hours: ['08:00'] } },
  { id: 'oxytet', phase: 'primaire', nom: 'Oxytétracycline', days: [2, 3, 4], hours: ['09:00'] },
  { id: 'cocci-primaire', phase: 'primaire', nom: 'Coccidiostatique', dayRange: { from: 0, to: 14 }, hours: ['08:00'] },
  { id: 'vaccin', phase: 'primaire', nom: 'Vaccin Newcastle', days: [7], hours: ['09:00'], altDays: [10] },

  { id: 'vit-b', phase: 'croissance', nom: 'Vitamines B-complexe + K', weekdays: [1, 4], hours: ['08:00'], dayRange: { from: 15, to: 29 } },
  { id: 'tylosine', phase: 'croissance', nom: 'Tylosine (si symptômes)', days: [], hours: ['09:00'], optional: true, note: 'Si toux — 3 à 5 jours consécutifs' },
  { id: 'levamisole', phase: 'croissance', nom: 'Antiparasitaire Levamisole', days: [18, 19, 20], hours: ['08:00'] },
  { id: 'acide-org', phase: 'croissance', nom: 'Acide organique', weekdays: [2, 5], hours: ['08:00'], dayRange: { from: 15, to: 29 } },
  { id: 'cocci-croissance', phase: 'croissance', nom: 'Coccidiostatique relais', dayRange: { from: 15, to: 28 }, hours: ['08:00'] },

  { id: 'electrolytes', phase: 'finition', nom: 'Vitamines électrolytes stress', weekdays: [1, 3, 5], hours: ['08:00'], dayRange: { from: 30, to: 44 } },
  { id: 'desinfection-eau', phase: 'finition', nom: 'Désinfection eau', weekdays: [2], hours: ['07:00'], dayRange: { from: 30, to: 44 } },
  { id: 'arret-cocci', phase: 'finition', nom: 'Arrêt coccidiostatique', days: [38, 39, 40], hours: ['08:00'], note: 'Si programme l\'exige — 5 à 7 j avant vente' },

  { id: 'controle-sanitaire', phase: 'pret', nom: 'Contrôle sanitaire final', days: [45], hours: ['07:00'] },
];
