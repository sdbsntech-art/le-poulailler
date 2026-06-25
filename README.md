# Le Poulailler

Application de gestion d'élevage avicole — **PWA web** + **application mobile React Native (Expo)**.

**Créateur :** ZAYEL — [sdbsntech@gmail.com](mailto:sdbsntech@gmail.com)

Étudiant en informatique · développement web & apps mobiles · data engineer · pentester junior.

## Fonctionnalités

- Lots, phases automatiques (J+15, J+30, J+45), ventes et décès
- Totaux en direct, alimentation & eau calculées
- Rappels automatiques repas/eau (son, bannière, notifications)
- **Conseils essentiels** : gestion des poussins, vente, emplacement et construction du poulailler
- **Santé & protection** : prévention infectieuse, orientation vétérinaire, pharmacies Dakar/Pikine

## Application web (PWA)

```bash
npm install
npm run dev
```

Build production :

```bash
npm run build
npm run preview
```

### Installer sur téléphone (PWA)

- **Android (Chrome)** : bannière « Installer l'app » ou menu → Ajouter à l'écran d'accueil
- **iPhone (Safari)** : Partager → Sur l'écran d'accueil

La PWA fonctionne hors ligne (données locales + cache). Le guide PDF est inclus dans le cache.

## Application mobile React Native (Expo)

L'app native charge l'interface web optimisée (même code, notifications, rappels).

```bash
# Terminal 1 — serveur web
npm run dev

# Terminal 2 — première fois
npm run mobile:install

# Puis
npm run mobile
```

Scannez le QR code avec **Expo Go** (Android/iOS).

Production : déployez le site web, puis définissez l'URL :

```bash
# mobile/.env ou variable d'environnement
EXPO_PUBLIC_WEB_URL=https://votre-domaine.com
```

## Guide PDF

```bash
npm run generate-guide-pdf
```

Fichier : `public/Guide-Utilisateur-Le-Poulailler.pdf`

Données sauvegardées dans le navigateur (localStorage).
