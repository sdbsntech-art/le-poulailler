export const GUIDE_PDF_PATH = 'Guide-Utilisateur-Le-Poulailler.pdf';

export function getGuidePdfUrl() {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${GUIDE_PDF_PATH}`;
}

export const AUTEUR = {
  nom: 'ZAYEL',
  email: 'sdbsntech@gmail.com',
  titre: 'Créateur & développeur',
  profil: [
    'Étudiant en informatique',
    'Développement web et applications mobiles',
    'Data engineer',
    'Pentester junior',
  ],
};

export const REMERCIEMENTS = {
  titre: 'Remerciements & sources',
  intro:
    "Les contenus sanitaires, les bonnes pratiques d'élevage et les orientations présentes dans cette application ont été enrichis grâce à des échanges avec :",
  sections: [
    {
      titre: 'Étudiants vétérinaires — écosystème UCAD / Dakar',
      texte:
        "Des étudiants en médecine vétérinaire des grandes écoles vétérinaires proches de l'Université Cheikh Anta Diop (UCAD), notamment l'École inter-États des Sciences et Médecine Vétérinaires (EISMV) de Dakar, ont contribué par leurs retours pédagogiques sur la biosécurité, la prévention des maladies infectieuses et l'importance de ne pas prescrire de médicaments sans diagnostic professionnel.",
    },
    {
      titre: 'Éleveurs et praticiens expérimentés',
      texte:
        "Des conseils techniques très concrets — gestion thermique des poussins, ventilation, densité au m², qualité de l'eau, préparation à la vente — proviennent d'éleveurs avicoles chevronnés et de professionnels du secteur au Sénégal. Leur expérience de terrain a guidé la structure des phases (J0 à J45) et des rappels quotidiens.",
    },
    {
      titre: 'Limites & responsabilité',
      texte:
        "Cette application est un outil d'aide à la gestion et à l'organisation. Elle ne remplace pas l'avis d'un vétérinaire agréé. Tout traitement médical doit être validé par un professionnel de santé animale.",
    },
  ],
};

export const APP_INFO = {
  nom: 'Le Poulailler',
  tagline: 'Gestion d\'élevage avicole — conseils, phases automatiques & suivi quotidien',
  version: '1.0.0',
};

export function getCopyrightYear() {
  return new Date().getFullYear();
}
