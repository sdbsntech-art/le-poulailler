# Présentation du Projet : Le Poulailler

## 1. Introduction et Objectif Principal
**Le Poulailler** est une application moderne de gestion et de suivi d'élevage avicole. Conçue pour offrir une expérience utilisateur haut de gamme, fluide et sécurisée, elle permet aux éleveurs de suivre leurs lots de volailles, de gérer leur profil et d'accéder à des statistiques détaillées, le tout depuis n'importe quel appareil (ordinateur, tablette, ou smartphone).

## 2. Architecture Technique
Le projet repose sur une architecture hybride et moderne :
- **Frontend Web (PWA)** : Développé en **React.js** avec **Vite**, le site web offre une interface dynamique, rapide et réactive. Le design est orienté "chic" avec des effets de "glassmorphism" (flou d'arrière-plan), un thème sombre élégant et des animations fluides.
- **Application Mobile (React Native)** : Une application mobile compagnon a été développée pour envelopper le site web via une **WebView**. Elle intercepte intelligemment les boutons matériels du téléphone (comme le bouton Retour sur Android) pour offrir une expérience 100% native.
- **Backend (API Serveur)** : Un serveur léger en **Node.js / Express** gère l'authentification (via des tokens JWT sécurisés) et le stockage des données.
- **Base de données** : Le stockage se fait via un système de base de données locale légère (`store.json`), permettant une sauvegarde rapide et sans friction.

## 3. Fonctionnalités Principales
### 3.1. Tableau de bord & Gestion des Lots
- Interface intuitive pour suivre l'évolution des lots d'animaux.
- Conception "Mobile-First" : sur les petits écrans, la navigation se transforme en un **menu burger animé** avec un tiroir latéral élégant.
- Design strict "sans débordement" : l'interface est conçue pour bloquer tout défilement horizontal indésirable.

### 3.2. Espace Utilisateur & Notifications
- Chaque utilisateur possède un compte sécurisé (mot de passe crypté via `bcrypt`).
- Panneau de configuration permettant à l'éleveur de personnaliser ses alertes (notifications par navigateur ou e-mail).

### 3.3. Conseils et Bonnes Pratiques
- Un espace dédié (`ConseilsView`) pour aider les éleveurs avec des recommandations pour optimiser leur production.

## 4. Sécurité Avancée : Le "Protocole Zayel 2026"
La sécurité est l'un des piliers du projet, encapsulée sous le nom de **Protocole Zayel 2026**.
- **Panneau d'Administration Caché** : Permet à l'administrateur de voir les statistiques de trafic (visiteurs uniques, pages vues) et de gérer les utilisateurs.
- **Système Anti-Piratage (Lockdown View)** : L'application détecte les comportements suspects (ex: tentatives répétées de mots de passe erronés ou tentatives d'inspection du code source).
- **Mise en Quarantaine (Ban IP)** : En cas de suspicion, l'adresse IP de l'utilisateur est bannie de manière transparente et l'utilisateur est redirigé vers un écran de verrouillage rouge écarlate (Haute Sécurité), nécessitant l'intervention de l'administrateur.

## 5. Points Forts / "Bons à Savoir" (Good to Know)
- **Identifiants Administrateur par défaut** : 
  - Identifiant : `zayelprotocole2026`
  - Mot de passe : `zayelprotocole2026`
  *(Note : Ces identifiants sont strictement sensibles à la casse, ils doivent être saisis en minuscules).*
- **Indépendance de la Connexion** : La web-app a été conçue en tant que PWA (Progressive Web App). Elle peut être installée directement sur l'écran d'accueil d'un smartphone comme une application classique.
- **Évolutivité** : Le choix d'utiliser des fichiers JSON pour la base de données permet une portabilité instantanée. Le système peut facilement être migré vers une base de données plus lourde (comme MongoDB ou PostgreSQL) à l'avenir si le nombre d'éleveurs augmente drastiquement.

---
*Document généré automatiquement pour la présentation du projet.*
