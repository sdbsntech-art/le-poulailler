/**
 * Génère public/Guide-Utilisateur-Le-Poulailler.pdf
 * Usage : node scripts/generate-guide-pdf.mjs
 */
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'public', 'Guide-Utilisateur-Le-Poulailler.pdf');

const NOTE_IMPORTANTE_INTRO =
  "Note essentielle : la réussite de votre élevage ne dépend pas seulement des dates et des chiffres. L'emplacement du poulailler, la qualité de l'air, l'eau, l'aliment et votre rigueur quotidienne déterminent si vos poussins atteindront 45 jours en excellente condition pour la vente.";

const COLORS = {
  dark: '#0f0e0c',
  gold: '#8B6914',
  green: '#2D6A4F',
  navy: '#1D3557',
  burgundy: '#6B2D3E',
  muted: '#5c5348',
  cream: '#f5f0e6',
  warning: '#8B4513',
};

function heading(doc, text, size = 16, color = COLORS.dark) {
  doc.moveDown(0.6).font('Helvetica-Bold').fontSize(size).fillColor(color).text(text);
  doc.moveDown(0.3);
}

function subheading(doc, text) {
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.green).text(text);
  doc.moveDown(0.2);
}

function paragraph(doc, text, opts = {}) {
  doc
    .font('Helvetica')
    .fontSize(opts.size || 10.5)
    .fillColor(opts.color || COLORS.dark)
    .text(text, { align: opts.align || 'justify', lineGap: 3 });
  doc.moveDown(0.35);
}

function bullet(doc, text) {
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.dark).text(`  •  ${text}`, {
    indent: 12,
    lineGap: 2,
  });
}

function santeNoticeBox(doc) {
  const boxHeight = 88;
  doc
    .rect(doc.page.margins.left, doc.y, doc.page.width - doc.page.margins.left - doc.page.margins.right, boxHeight)
    .fillAndStroke('#eef6f1', COLORS.green);
  const y = doc.y + 10;
  doc
    .fillColor(COLORS.green)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Aucun médicament listé dans cette application', doc.page.margins.left + 12, y, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 24,
    });
  doc
    .font('Helvetica')
    .fontSize(9.5)
    .fillColor(COLORS.dark)
    .text(
      "Les traitements varient selon la race, la zone et l'état du lot. Seul un vétérinaire peut prescrire un protocole fiable. L'application vous aide à prévenir les infections et vous oriente vers des pharmacies vétérinaires à Dakar et Pikine.",
      doc.page.margins.left + 12,
      doc.y + 4,
      { width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 24, align: 'justify', lineGap: 2 }
    );
  doc.y += boxHeight + 8;
}

function footer(doc) {
  const bottom = doc.page.height - 40;
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text('Le Poulailler — Guide utilisateur', doc.page.margins.left, bottom, { align: 'left' })
    .text(`Page ${doc.bufferedPageRange().count}`, doc.page.margins.left, bottom, {
      align: 'right',
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
    });
}

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 56, bottom: 56, left: 56, right: 56 },
  info: {
    Title: 'Guide utilisateur — Le Poulailler',
    Author: 'ZAYEL',
    Subject: "Présentation de l'application de gestion d'élevage avicole",
  },
});

doc.pipe(fs.createWriteStream(outPath));

// ——— Page de couverture ———
doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.dark);
doc.fillColor(COLORS.cream).font('Helvetica-Bold').fontSize(32).text('Le Poulailler', 56, 180, { align: 'center' });
doc
  .font('Helvetica')
  .fontSize(14)
  .fillColor('#c9b896')
  .text("Guide utilisateur — Gestion d'élevage avicole", 56, 230, { align: 'center' });
doc.fontSize(11).text('Conseils · Phases automatiques · Suivi quotidien', 56, 260, { align: 'center' });
doc.fillColor(COLORS.gold).fontSize(10).text('Version 1.0', 56, 320, { align: 'center' });
doc
  .fillColor('#9a9080')
  .fontSize(10)
  .text('ZAYEL — sdbsntech@gmail.com', 56, doc.page.height - 100, { align: 'center' });

doc.addPage();

// ——— Sommaire ———
heading(doc, 'Sommaire', 18, COLORS.gold);
[
  '1. Présentation générale',
  '2. Tableau de bord',
  '3. Conseils essentiels',
  '4. Alertes & suivi',
  '5. Alimentation & eau',
  '6. Santé & protection (sans médicaments)',
  '7. Paramètres & notifications',
  '8. Installation sur téléphone (PWA)',
  '9. Données & confidentialité',
  '10. Contact',
].forEach((item) => bullet(doc, item));

doc.addPage();

// ——— 1. Présentation ———
heading(doc, '1. Présentation générale', 16, COLORS.gold);
paragraph(
  doc,
  "Le Poulailler est une application web conçue pour accompagner les éleveurs avicoles dans la gestion quotidienne de leurs lots de poussins, du jour d'achat (J0) jusqu'à la vente (J45 et au-delà). Elle fonctionne directement dans le navigateur (téléphone, tablette ou ordinateur) et peut être installée comme une application sur votre écran d'accueil."
);
paragraph(doc, "L'application couvre six sections principales accessibles via le menu en haut de l'écran :");
[
  'Tableau de bord — vue d\'ensemble et gestion des lots',
  'Conseils essentiels — bonnes pratiques d\'élevage',
  'Alertes & suivi — rappels repas, eau et jalons',
  'Alimentation & eau — besoins calculés selon l\'âge et l\'effectif',
  'Santé & protection — prévention infectieuse et pharmacies vétérinaires (Dakar/Pikine)',
  'Paramètres — horaires de repas et notifications',
].forEach((item) => bullet(doc, item));

subheading(doc, 'Cycle d\'élevage — phases automatiques');
paragraph(
  doc,
  "Chaque lot suit automatiquement quatre phases, calculées à partir de la date d'achat :"
);
[
  'Phase primaire (J0 à J14) — démarrage, chauffage, premiers soins',
  'Phase de croissance (J15 à J29) — développement musculaire et squelettique',
  'Phase de finition (J30 à J44) — préparation à la commercialisation',
  'Prêt à la vente (J45+) — cycle terminé, sujets prêts pour la vente',
].forEach((item) => bullet(doc, item));

paragraph(
  doc,
  "Jalons clés : J0 réception des poussins · J15 passage en croissance · J30 passage en finition · J45 prêt à la vente."
);

doc.addPage();

// ——— 2. Tableau de bord ———
heading(doc, '2. Tableau de bord', 16, COLORS.gold);
paragraph(
  doc,
  "Le tableau de bord est la page d'accueil. Il regroupe tout ce dont vous avez besoin pour piloter votre élevage au quotidien."
);

subheading(doc, 'Bannière importante');
paragraph(
  doc,
  "Un encart en haut rappelle de consulter les conseils essentiels (gestion des poussins, vente, emplacement et construction du poulailler) avant de démarrer un nouveau lot."
);

subheading(doc, 'Totaux en direct');
paragraph(
  doc,
  "Affiche en temps réel le nombre total de sujets vivants, la répartition par phase, et l'âge moyen de vos lots actifs."
);

subheading(doc, 'Statistiques globales');
paragraph(doc, "Cartes récapitulatives : effectif total, mortalité cumulée, ventes réalisées et lots actifs.");

subheading(doc, 'Enregistrement rapide');
paragraph(doc, "Boutons pour enregistrer rapidement des décès ou des ventes sur un lot sélectionné, sans ouvrir de formulaire complexe.");

subheading(doc, 'Ajouter un lot');
paragraph(
  doc,
  "Formulaire pour créer un nouveau lot : date d'achat, nombre de poussins reçus, prix d'achat unitaire (optionnel) et notes. La phase est calculée automatiquement selon l'âge."
);

subheading(doc, 'Mes lots');
paragraph(
  doc,
  "Chaque lot est affiché sous forme de carte avec : effectif actuel, phase en cours, barre de progression du cycle (45 jours), boutons pour enregistrer décès/ventes et supprimer le lot. Les lots dont l'effectif est nul sont archivés automatiquement."
);

doc.addPage();

// ——— 3. Conseils ———
heading(doc, '3. Conseils essentiels', 16, COLORS.gold);
paragraph(
  doc,
  NOTE_IMPORTANTE_INTRO
);

subheading(doc, 'Prédispositions pour mieux gérer vos poussins');
paragraph(doc, 'Avant l\'arrivée : désinfection, préchauffage (32–35 °C), litière sèche, eau propre, aliment starter en stock.');
paragraph(doc, 'Phase primaire (15 premiers jours) : surveillance 2×/jour, élimination des sujets malades, registre décès, consulter un vétérinaire pour tout traitement, limiter le stress.');
paragraph(doc, 'Croissance et finition (J15–J45) : espace au m², ventilation, 3 repas + eau permanente, préparation vente dès J40.');
paragraph(doc, 'Vente en bonnes conditions : sujets uniformes et sains, délais d\'attente vétérinaires, transport matinal, pesée échantillon, poulailler propre.');

subheading(doc, 'Choisir l\'emplacement du poulailler');
paragraph(doc, 'Protection vent (harmattan, alizés), orientation soleil (Est-Ouest), sol drainé, accès camion, éloignement basse-cour, eau et électricité.');

subheading(doc, 'Construire un poulailler solide');
paragraph(doc, 'Construire et entretenir : emplacement sec et protégé, entretien quotidien (eau, litière, cadavres), vide sanitaire entre lots. Guide vidéo : chaîne YouTube Malick87 (youtube.com/@Malick87).');

subheading(doc, 'Hygiène & biosécurité');
paragraph(doc, 'Bottes dédiées, lavage des mains, pas d\'animaux étrangers, protocole vétérinaire, vide sanitaire entre lots.');

subheading(doc, 'Erreurs fréquentes à éviter');
paragraph(doc, 'Surpeuplement, couper eau/aliment, vendre trop tôt, ignorer un pic de décès sur 2 jours consécutifs.');

doc.addPage();

// ——— 4. Alertes ———
heading(doc, '4. Alertes & suivi', 16, COLORS.gold);
paragraph(
  doc,
  "Cette section centralise tous les rappels générés automatiquement à partir de vos lots et de vos paramètres."
);

subheading(doc, 'Types d\'alertes');
[
  'Alimentation — rappels aux 3 horaires de repas configurés',
  'Eau — contrôles répartis sur la journée (6× en primaire, 5× en croissance, etc.)',
  'Jalon — passages de phase (J15, J30, J45)',
].forEach((item) => bullet(doc, item));

subheading(doc, 'Statuts');
paragraph(doc, "Les alertes sont classées : à faire maintenant (urgentes), en retard, à venir, ou marquées comme faites. Vous pouvez cocher une alerte une fois l'action réalisée, ou envoyer une notification sur votre appareil.");

subheading(doc, 'Journal des messages');
paragraph(doc, "Historique des notifications envoyées localement sur votre téléphone ou ordinateur.");

doc.addPage();

// ——— 5. Alimentation ———
heading(doc, '5. Alimentation & eau', 16, COLORS.gold);
paragraph(
  doc,
  "Calcule automatiquement les besoins journaliers de chaque lot actif selon l'âge (en jours) et l'effectif restant."
);

subheading(doc, 'Données affichées');
[
  'Quantité totale d\'aliment par jour (en kg)',
  'Répartition par repas (3 repas/jour par défaut)',
  'Consommation estimée par poulet (grammes/jour)',
  'Besoins en eau (litres/jour) et volume par contrôle d\'abreuvoir',
  'Horaires suggérés pour les contrôles eau (6h–20h)',
].forEach((item) => bullet(doc, item));

paragraph(
  doc,
  "Les estimations s'appuient sur des courbes de consommation standard selon l'âge. Adaptez selon la race, la température et la qualité de l'aliment commercial utilisé."
);

doc.addPage();

// ——— 6. Santé & protection ———
heading(doc, '6. Santé & protection', 16, COLORS.gold);
santeNoticeBox(doc);

paragraph(
  doc,
  "Cette section remplace l'ancienne rubrique médicaments. Elle ne cite aucun produit : les traitements dépendent de votre situation et doivent être validés par un vétérinaire."
);

subheading(doc, 'Prévention des risques infectieux');
[
  'Biosécurité : bottes dédiées, désinfection au seuil, pas de visiteurs ni animaux étrangers',
  'Eau propre renouvelée souvent, abreuvoirs nettoyés, litière sèche',
  'Ventilation sans courant d\'air direct, densité raisonnable au m²',
  'Retrait immédiat des cadavres et sujets isolés ou malades',
  'Vide sanitaire entre deux lots (nettoyage, désinfection, séchage)',
].forEach((item) => bullet(doc, item));

subheading(doc, 'Signes d\'alerte');
paragraph(doc, 'Toux, diarrhée, pic de mortalité sur 24–48 h, poussins groupés ou apathiques → contacter un vétérinaire sans attendre.');

subheading(doc, 'Pharmacies vétérinaires à Dakar (géolocalisation Google Maps)');
[
  'SOPEL — 21 Rue Jacques Bugnicourt, Plateau — +221 33 821 62 74',
  'BOMBO — 6 bis Rue Carnot, Plateau — +221 33 821 94 97',
  'Clinique et Pharmacie Vétérinaire — 1360 Pikine Rue 10, Pikine — +221 33 834 62 44',
  'VetServices — Route du Front de Terre, Dieuppeul-Derkle — +221 33 832 56 71',
].forEach((item) => bullet(doc, item));

paragraph(
  doc,
  "Dans l'application, chaque établissement dispose d'un bouton « Ouvrir dans Google Maps » pour lancer l'itinéraire directement depuis votre téléphone."
);

doc.addPage();

// ——— 7. Paramètres ———
heading(doc, '7. Paramètres & notifications', 16, COLORS.gold);
paragraph(doc, "Configurez vos 3 horaires de repas quotidiens (exemple par défaut : 07:00, 12:00, 17:00).");
paragraph(doc, "Activez le son pour les rappels visibles sur le site (bannière et onglet Alertes).");

doc.addPage();

// ——— 8. PWA ———
heading(doc, '8. Installation sur téléphone (PWA)', 16, COLORS.gold);
paragraph(
  doc,
  "Le Poulailler est une Progressive Web App (PWA). Vous pouvez l'installer sur l'écran d'accueil de votre smartphone ou tablette comme une application native."
);
[
  'Sur Android (Chrome) : menu ⋮ → « Ajouter à l\'écran d\'accueil » ou accepter la bannière d\'installation',
  'Sur iPhone (Safari) : bouton Partager → « Sur l\'écran d\'accueil »',
  'Fonctionne hors connexion partielle une fois installée (données locales)',
].forEach((item) => bullet(doc, item));

doc.addPage();

// ——— 9. Données ———
heading(doc, '9. Données & confidentialité', 16, COLORS.gold);
paragraph(
  doc,
  "Toutes vos données (lots, décès, ventes, paramètres, alertes cochées) sont enregistrées localement dans le navigateur de votre appareil (localStorage). Aucune information n'est envoyée sur un serveur externe."
);
paragraph(
  doc,
  "Attention : effacer les données du navigateur ou changer d'appareil supprimera vos enregistrements. Pensez à noter les informations importantes si vous changez de téléphone."
);

doc.addPage();

// ——— 10. Contact ———
heading(doc, '10. Contact', 16, COLORS.gold);
paragraph(doc, "Application créée par ZAYEL.");
paragraph(doc, "Pour toute information, suggestion ou retour d'expérience :");
doc
  .font('Helvetica-Bold')
  .fontSize(11)
  .fillColor(COLORS.green)
  .text('sdbsntech@gmail.com', { link: 'mailto:sdbsntech@gmail.com' });

doc.moveDown(1);
paragraph(
  doc,
  "Merci d'utiliser Le Poulailler. Une gestion rigoureuse, combinée aux conseils pratiques de l'application, vous aide à mener vos cycles jusqu'à la vente dans les meilleures conditions possibles.",
  { align: 'left' }
);

doc.on('finish', () => {
  console.log(`PDF généré : ${outPath}`);
});

doc.end();
