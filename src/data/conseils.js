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
          'Respecter strictement le protocole médicaments (coccidiose, vitamines) — voir onglet Médicaments.',
          'Éviter les visites inutiles : chaque stress augmente la mortalité.',
        ],
      },
      {
        titre: 'Croissance et finition (J15 à J45)',
        items: [
          'Augmenter progressivement l\'espace au m² (densité excessive = pic de mortalité et qualité médiocre).',
          'Maintenir une ventilation croissante sans courants d\'air sur les poussins.',
          '3 repas réguliers + eau disponible en permanence — ne jamais laisser les abreuvoirs vides en chaleur.',
          'Préparer la vente dès J40 : contacts acheteurs, transport, jeûne léger si exigé par l\'abattoir.',
        ],
      },
      {
        titre: 'Vendre en très bonnes conditions',
        items: [
          'Vendre des sujets uniformes, vivants, sans boiterie ni signe respiratoire.',
          'Respecter les délais d\'attente médicaments (7 jours minimum avant commercialisation si traitement).',
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
    titre: 'Construire un poulailler solide',
    icone: '🏗️',
    important: true,
    points: [
      {
        titre: 'Dimensions recommandées',
        items: [
          'Phase primaire : 25–30 poussins/m² maximum (les 2 premières semaines).',
          'Croissance : 15–20 /m².',
          'Finition : 10–12 /m² pour une bonne homogénéité de poids.',
          'Hauteur sous plafond : 2,2 à 2,5 m pour une bonne circulation d\'air.',
        ],
      },
      {
        titre: 'Structure',
        items: [
          'Fondations légères mais stables ; sol béton ou latérite compactée + litière.',
          'Murs : briques, parpaings ou bois traité — étanchéité contre la pluie.',
          'Toit en tôle avec sous-toiture (panneaux, paille sous tôle) pour réduire la chaleur.',
          'Portes verrouillables contre vol et prédateurs (chats, chiens, mangoustes, rats).',
        ],
      },
      {
        titre: 'Ventilation & chauffage',
        items: [
          'Bandes ou fenêtres hautes + bas pour renouveler l\'air sans courant au niveau des poussins.',
          'Chauffage : ampoules infrarouge, poêle sécurisé ou gaz — toujours hors de portée des poussins.',
          'Thermomètre à hauteur des poussins, pas à hauteur d\'homme.',
        ],
      },
      {
        titre: 'Équipements',
        items: [
          'Abreuvoirs et mangeoires suffisants (allonger le nombre en croissance).',
          'Éclairage 16–18 h/jour les 2 premières semaines si souhaité, puis réduire.',
          'Zone de stockage aliment sec, à l\'abri des rongeurs.',
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
          'Vacciner / traiter selon protocole — ne jamais mélanger les médicaments au hasard.',
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

export const AUTEUR = {
  nom: 'Seydou Bakhayokho',
  email: 'sdbsntech@gmail.com',
  message: 'Pour toute information ou suggestion',
};
