export const AVERTISSEMENT_SANTE = {
  titre: 'Pourquoi cette application ne liste aucun médicament',
  texte:
    "Les traitements adaptés varient selon la race, l'âge, la saison, la zone géographique et l'état sanitaire du lot. Un étudiant vétérinaire nous a rappelé qu'indiquer des produits sans examen professionnel peut être dangereux. Cette section vous aide à prévenir les risques infectieux et vous oriente vers des vétérinaires et pharmacies agréées — seuls eux peuvent prescrire un protocole fiable.",
};

export const CONSEILS_PROTECTION = [
  {
    id: 'biosécurité',
    titre: 'Biosécurité — votre première barrière',
    icone: '🛡️',
    points: [
      {
        titre: 'Entrée et sortie du bâtiment',
        items: [
          'Chaussures et vêtements réservés au poulailler ; désinfectant au seuil.',
          'Laver les mains ou utiliser gel hydroalcoolique avant chaque visite.',
          'Interdire l\'accès aux visiteurs, animaux domestiques et volailles errantes.',
          'Nettoyer et désinfecter abreuvoirs et mangeoires chaque jour.',
        ],
      },
      {
        titre: 'Entre deux lots',
        items: [
          'Vidanger complètement la litière, laver les parois, désinfecter le matériel.',
          'Laisser sécher et aérer — idéalement 10 à 14 jours de vide sanitaire.',
          'Ne jamais enchaîner un lot sur une litière ou un sol non préparé.',
        ],
      },
    ],
  },
  {
    id: 'eau-air',
    titre: 'Eau, air et densité — facteurs infectieux majeurs',
    icone: '💧',
    points: [
      {
        titre: 'Qualité de l\'eau',
        items: [
          'Eau propre, fraîche, renouvelée plusieurs fois par jour en phase chaude.',
          'Abreuvoirs surélevés, sans fange ; nettoyage quotidien des fonds.',
          'Éviter l\'eau stagnante autour du bâtiment (risque salmonelle, coccidiose).',
        ],
      },
      {
        titre: 'Ventilation et surpeuplement',
        items: [
          'Ammoniac et humidité favorisent les maladies respiratoires — aérer sans courant direct sur les poussins.',
          'Respecter la densité : moins de sujets au m² = moins de contagion et meilleure croissance.',
          'Retirer immédiatement les cadavres et les sujets isolés ou boiteux.',
        ],
      },
    ],
  },
  {
    id: 'signes',
    titre: 'Signes d\'alerte — agir vite',
    icone: '⚠️',
    points: [
      {
        titre: 'Surveiller chaque jour',
        items: [
          'Poussins groupés sous le chauffage, plumes hérissées, yeux fermés → froid, maladie ou faim.',
          'Toux, éternuements, respiration bruyante → infection respiratoire probable.',
          'Diarrhée sanglante ou liquide abondant → coccidiose ou autre pathologie intestinale.',
          'Pic de mortalité sur 24–48 h → arrêter les suppositions, appeler un vétérinaire.',
        ],
      },
      {
        titre: 'Registre sanitaire',
        items: [
          'Noter décès, symptômes observés et date — utile pour le diagnostic vétérinaire.',
          'Ne jamais mélanger des produits trouvés sur internet sans avis professionnel.',
          'Conserver les emballages et notices des traitements prescrits par votre vétérinaire.',
        ],
      },
    ],
  },
  {
    id: 'par-phase',
    titre: 'Priorités selon la phase du cycle',
    icone: '📋',
    points: [
      {
        titre: 'Primaire (J0–J14)',
        items: [
          'Chauffage stable, litière sèche, eau tiède les premiers jours.',
          'Surveillance renforcée : les poussins sont les plus fragiles face aux infections.',
          'Consulter un vétérinaire dès l\'arrivée du lot pour un protocole préventif adapté à votre zone.',
        ],
      },
      {
        titre: 'Croissance & finition (J15–J44)',
        items: [
          'Augmenter l\'espace, maintenir une litière sèche, contrôler l\'ammoniac.',
          'Avant la vente : respecter strictement les délais d\'attente indiqués par le vétérinaire après tout traitement.',
          'Inspection visuelle des sujets avant enlèvement — exclure les malades.',
        ],
      },
    ],
  },
];

export const MESSAGE_VETERINAIRE = {
  titre: 'Consultez un vétérinaire près de chez vous',
  intro:
    "Le choix des vaccins, antibiotiques, vitamines ou antiparasitaires est vaste et dépend de votre situation. Avant tout traitement, présentez votre lot (effectif, âge, symptômes, photos si possible) à un professionnel. Les pharmacies vétérinaires ci-dessous à Dakar et Pikine peuvent vous orienter et fournir les produits sur prescription ou conseil adapté.",
};

/** Pharmacies vétérinaires reconnues — liens Google Maps pour itinéraire direct */
export const PHARMACIES_VETERINAIRES = [
  {
    id: 'sopel',
    nom: 'SOPEL — Clinique et Pharmacie Vétérinaire',
    quartier: 'Plateau, Dakar',
    adresse: '21, Rue Jacques Bugnicourt, Dakar Plateau',
    telephone: '+221 33 821 62 74',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=SOPEL+Clinique+Pharmacie+V%C3%A9t%C3%A9rinaire+21+Rue+Jacques+Bugnicourt+Dakar',
    mapsLabel: 'Ouvrir dans Google Maps',
  },
  {
    id: 'bombo',
    nom: 'BOMBO — Clinique et Pharmacie Vétérinaires',
    quartier: 'Plateau, Dakar',
    adresse: '6 bis, Rue Carnot, Dakar',
    telephone: '+221 33 821 94 97',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=BOMBO+Clinique+Pharmacie+V%C3%A9t%C3%A9rinaires+6+bis+Rue+Carnot+Dakar',
    mapsLabel: 'Ouvrir dans Google Maps',
  },
  {
    id: 'pikine',
    nom: 'Clinique et Pharmacie Vétérinaire — Pikine',
    quartier: 'Pikine, Dakar',
    adresse: '1360, Pikine Rue 10, Pikine',
    telephone: '+221 33 834 62 44',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Clinique+Pharmacie+V%C3%A9t%C3%A9rinaire+1360+Pikine+Rue+10+Dakar',
    mapsLabel: 'Ouvrir dans Google Maps (Pikine)',
  },
  {
    id: 'vetservices',
    nom: 'VetServices — Cabinet et Pharmacie Vétérinaire',
    quartier: 'Dieuppeul-Derkle, Dakar',
    adresse: 'Route du Front de Terre, Dieuppeul-Derkle',
    telephone: '+221 33 832 56 71',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=VetServices+Cabinet+Pharmacie+V%C3%A9t%C3%A9rinaire+Dieuppeul+Dakar',
    mapsLabel: 'Ouvrir dans Google Maps',
  },
];
