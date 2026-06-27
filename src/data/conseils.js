export const NOTE_IMPORTANTE = {
  titre: 'Note essentielle — À lire avant chaque cycle',
  intro:
    'La réussite de votre élevage ne dépend pas seulement des dates et des chiffres. L\'emplacement du poulailler, la qualité de l\'air, l\'eau, l\'aliment et votre rigueur quotidienne déterminent si vos poussins atteindront 45 jours en excellente condition pour la vente.',
};

export const SECTIONS_CONSEILS = [
  {
    id: 'predispositions',
    titre: 'Prédispositions pour mieux gérer vos poussins',
    icone: '🐣',
    important: true,
    points: [
      {
        titre: 'Avant l\'arrivée des poussins',
        items: [
          'Désinfecter complètement le bâtiment, abreuvoirs et mangeoires (vide sanitaire 10–14 jours si possible).',
          'Préchauffer la zone : 32–35 °C sous chauffage la première semaine, puis baisser progressivement (2–3 °C par semaine).',
          'Préparer litière sèche (copeaux, paille broyée) sur 5–10 cm — jamais sur béton nu.',
          'Vérifier l\'eau : propre, fraîche, sans chlore fort le jour d\'arrivée.',
          'Avoir l\'aliment démarrage (starter) en stock — pas de changement brutal de marque en cours de phase primaire.',
        ],
      },
      {
        titre: 'Les 15 premiers jours (phase primaire)',
        items: [
          'Surveiller le comportement 2×/jour : poussins groupés = froid ; dispersés, bec ouvert = chaleur excessive.',
          'Éliminer rapidement tout sujet isolé, blessé ou ne mangeant pas (évite la contagion).',
          'Tenir un registre décès quotidien — un pic brutal = problème eau, chauffage ou maladie.',
          'Consulter un vétérinaire pour tout traitement préventif — voir onglet Santé & protection.',
          'Éviter les visites inutiles : chaque stress augmente la mortalité.',
        ],
      },
      {
        titre: 'Croissance et finition (J15 à J45)',
        items: [
          'Augmenter progressivement l\'espace disponible (surpeuplement = mortalité et qualité médiocre).',
          'Maintenir une ventilation croissante sans courants d\'air sur les poussins.',
          '3 repas réguliers + eau disponible en permanence — ne jamais laisser les abreuvoirs vides en chaleur.',
          'Préparer la vente dès J40 : contacts acheteurs, transport, jeûne léger si exigé par l\'abattoir.',
        ],
      },
      {
        titre: 'Vendre en très bonnes conditions',
        items: [
          'Vendre des sujets uniformes, vivants, sans boiterie ni signe respiratoire.',
          'Respecter les délais d\'attente prescrits par votre vétérinaire avant commercialisation.',
          'Charger tôt le matin, eau jusqu\'au dernier moment, éviter la chaleur dans le camion.',
          'Peser un échantillon pour estimer le poids vif moyen — argument de vente décisif.',
          'Un poulailler propre et bien tenu = confiance de l\'acheteur et meilleur prix.',
        ],
      },
    ],
  },
  {
    id: 'emplacement',
    titre: 'Choisir l\'emplacement du poulailler',
    icone: '🧭',
    important: true,
    points: [
      {
        titre: 'Protection contre le vent',
        items: [
          'Ouvrir le bâtiment du côté opposé au vent dominant (au Sénégal / Sahel : souvent éviter l\'harmattan et alizés — placer l\'entrée à l\'abri des vents forts).',
          'Utiliser un rideau naturel : haie, mur, autre bâtiment en amont du vent.',
          'Les fenêtres grillagées et extracteurs doivent être du côté sous le vent pour tirer l\'air sans frapper les poulets.',
          'En saison des pluies : pente du toit et évacuation des eaux loin des entrées.',
        ],
      },
      {
        titre: 'Soleil et orientation',
        items: [
          'Éviter le plein soleil direct sur le toit en tôle sans isolation — surchauffe mortelle.',
          'Orientation longueur Est-Ouest souvent conseillée pour limiter l\'ensoleillement latéral brutal.',
          'Arbres ou ombrage à distance (pas collés au bâtiment : humidité et rongeurs).',
        ],
      },
      {
        titre: 'Autres critères',
        items: [
          'Sol bien drainé — jamais en zone inondable.',
          'Accès camion pour chargement J45.',
          'Éloigner la basse-cour domestique pour limiter les maladies croisées.',
          'Source d\'eau fiable et électricité (ou générateur) pour chauffage / ventilation si possible.',
        ],
      },
    ],
  },
  {
    id: 'construction',
    titre: 'Construire et entretenir son poulailler',
    icone: '🏗️',
    important: true,
    points: [
      {
        titre: 'Choisir le bon emplacement avant de construire',
        items: [
          'Priorité au sol sec et bien drainé — jamais en zone basse ou inondable.',
          'Protéger le bâtiment du vent dominant (harmattan, alizés) avec haie ou mur amont.',
          'Éviter le plein soleil sur toiture en tôle sans isolation — surchauffe mortelle.',
          'Prévoir un accès pratique pour livraison d\'aliment et chargement des poulets à la vente.',
          'S\'éloigner de la basse-cour domestique pour limiter les maladies croisées.',
        ],
      },
      {
        titre: 'Entretien quotidien',
        items: [
          'Nettoyer et remplir abreuvoirs et mangeoires chaque jour — eau toujours propre.',
          'Retirer immédiatement litière humide, cadavres et sujets isolés.',
          'Surveiller odeur d\'ammoniac : signe de litière sale ou mauvaise ventilation.',
          'Contrôler portes, grillages et clôtures contre prédateurs (rats, mangoustes, chiens).',
          'Tenir un registre simple : décès, anomalies, travaux effectués.',
        ],
      },
      {
        titre: 'Entretien entre deux lots',
        items: [
          'Vider complètement la litière après chaque cycle.',
          'Laver parois, sol et matériel, puis désinfecter.',
          'Laisser sécher et aérer — idéalement 10 à 14 jours de vide sanitaire.',
          'Vérifier toiture, gouttières et évacuation d\'eau avant l\'arrivée du lot suivant.',
          'Un poulailler propre entre deux cycles réduit fortement les maladies.',
        ],
      },
      {
        titre: 'Qualité de construction (conseils généraux)',
        items: [
          'Structure stable, étanche à la pluie, avec ventilation haute et basse sans courant sur les poussins.',
          'Toit isolé (sous-toiture) pour limiter la chaleur en saison sèche.',
          'Portes verrouillables, sol adapté + litière sèche — jamais béton nu sans litière.',
          'Abreuvoirs et mangeoires en nombre suffisant, zone de stockage aliment à l\'abri des rongeurs.',
          'Pour un guide visuel détaillé, voir la vidéo de la chaîne Malick87 ci-dessous.',
        ],
      },
    ],
  },
  {
    id: 'hygiene',
    titre: 'Hygiène & biosécurité',
    icone: '🛡️',
    points: [
      {
        titre: 'Règles d\'or',
        items: [
          'Bottes réservées au poulailler, désinfectant au seuil.',
          'Laver les mains avant d\'entrer.',
          'Pas d\'animaux étrangers dans le bâtiment.',
          'Vacciner / traiter uniquement sur prescription vétérinaire — ne jamais improviser seul.',
          'Entre deux lots : nettoyage, désinfection, séchage — pause vide sanitaire idéale.',
        ],
      },
    ],
  },
  {
    id: 'erreurs',
    titre: 'Erreurs fréquentes à éviter',
    icone: '⚠️',
    points: [
      {
        titre: 'Ce qui coûte cher',
        items: [
          'Surpeupler pour « gagner de la place » → mortalité + vente difficile.',
          'Couper l\'eau ou l\'aliment pour économiser → pertes bien supérieures.',
          'Vendre trop tôt ou avec traitement non respecté → rejet clients, perte de réputation.',
          'Ignorer un pic de décès 2 jours de suite → toujours investiguer chauffage, eau, qualité aliment.',
        ],
      },
    ],
  },
];

export const VIDEO_CONSTRUCTION = {
  titre: 'Guide vidéo — construction de poulailler',
  description:
    'Vidéo explicative pour bien comprendre l\'emplacement, la construction et l\'entretien d\'un poulailler.',
  chaineNom: 'Malick87',
  chaineUrl: 'https://www.youtube.com/@Malick87',
  videoId: 'X-vVdTOEwqs',
  embedUrl: 'https://www.youtube.com/embed/X-vVdTOEwqs',
  watchUrl: 'https://www.youtube.com/watch?v=X-vVdTOEwqs',
  thumbnail: 'https://img.youtube.com/vi/X-vVdTOEwqs/hqdefault.jpg',
};

export { AUTEUR } from './footer';
