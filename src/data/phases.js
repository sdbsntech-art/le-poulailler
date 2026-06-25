export const PHASES = {
  primaire: {
    id: 'primaire',
    label: 'Phase primaire',
    shortLabel: 'Primaire',
    jourMin: 0,
    jourMax: 14,
    couleur: '#8B6914',
    description: 'Jours 0 à 14 — Démarrage, chauffage et premiers soins.',
  },
  croissance: {
    id: 'croissance',
    label: 'Phase de croissance',
    shortLabel: 'Croissance',
    jourMin: 15,
    jourMax: 29,
    couleur: '#2D6A4F',
    description: 'Jours 15 à 29 — Développement musculaire et squelettique.',
  },
  finition: {
    id: 'finition',
    label: 'Phase de finition',
    shortLabel: 'Finition',
    jourMin: 30,
    jourMax: 44,
    couleur: '#1D3557',
    description: 'Jours 30 à 44 — Préparation à la commercialisation.',
  },
  pret: {
    id: 'pret',
    label: 'Prêt à la vente',
    shortLabel: 'Prêt (45j+)',
    jourMin: 45,
    jourMax: null,
    couleur: '#6B2D3E',
    description: 'À partir du jour 45 — Cycle terminé, prêt pour la vente.',
  },
};

export const JALONS = [
  { jour: 0, label: 'Réception des poussins', phase: 'primaire' },
  { jour: 15, label: 'Passage en croissance', phase: 'croissance' },
  { jour: 30, label: 'Passage en finition', phase: 'finition' },
  { jour: 45, label: 'Prêt à la vente', phase: 'pret' },
];
