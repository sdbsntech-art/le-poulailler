# Le Poulailler

Application SaaS de gestion d'élevage avicole (React + API + PWA).

**Créateur :** ZAYEL — [sdbsntech@gmail.com](mailto:sdbsntech@gmail.com)

## Mode SaaS

- **Essai gratuit 7 jours** sans compte (données locales sur l'appareil)
- **Alerte** 2 jours avant la fin de l'essai
- **Sans compte après 7 jours** : accès bloqué, données effacées
- **Avec compte** : sauvegarde cloud, rapports mensuels/annuels, notifications navigateur (+ e-mail bientôt)

### Lancer (web + API)

```bash
# Terminal 1 — API
npm run server:install
npm run server

# Terminal 2 — site
npm install
npm run dev
```

### Liste des utilisateurs (admin)

```bash
curl -H "X-Admin-Key: VOTRE_ADMIN_KEY" http://localhost:3001/api/admin/users
```

Configurez `JWT_SECRET` et `ADMIN_KEY` dans le fichier `.env` à la racine (voir `.env.example`).

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

## Notifications push (Firebase Cloud Messaging)

Les rappels (repas, eau, jalons) peuvent être envoyés sur **navigateur**, **PWA** et **application mobile Expo**, même lorsque l'app est fermée.

### Configuration Firebase Console

1. Projet Firebase → **Paramètres** → **Cloud Messaging**
2. **Certificats Web Push** : générez une paire de clés → copiez la clé publique dans `VITE_FIREBASE_VAPID_KEY` (`.env`)
3. **Compte de service** (envoi serveur) : Paramètres → Comptes de service → Générer une clé JSON
   - Coller le JSON dans `FIREBASE_SERVICE_ACCOUNT_JSON` (une ligne), ou
   - Définir `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json`
   - Ajouter `FIREBASE_PROJECT_ID=votre-projet-id`

Variables client (`.env`, préfixe `VITE_`) :

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

Sans clé VAPID, seules les notifications navigateur locales restent actives (pas de push FCM).

### Activer sur le web

1. Lancer API + site (`npm run server`, `npm run dev`)
2. Créer un compte → **Mon compte** → **Notifications**
3. Cliquer **Activer notifications push** et autoriser le navigateur
4. Cocher **Envoyer les rappels par push (serveur)**

### Application mobile (Expo)

L'app `mobile/` utilise **Expo Push Notifications** (WebView + token Expo). Pour migrer vers FCM natif, remplacer `expo-notifications` par `@react-native-firebase/messaging` et enregistrer le token via `POST /api/fcm/register`.

### Tester

```bash
# Vérifier l'enregistrement du token (après activation dans l'UI)
curl -H "Authorization: Bearer VOTRE_JWT" http://localhost:3001/api/data

# Les push partent via le planificateur serveur (toutes les minutes) ou le client (useRappelEngine)
```

## Guide PDF

```bash
npm run generate-guide-pdf
```

Fichier : `public/Guide-Utilisateur-Le-Poulailler.pdf`

Données sauvegardées dans le navigateur (localStorage).
