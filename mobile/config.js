/**
 * URL de l'application web Le Poulailler.
 * - Développement : lancez `npm run dev` à la racine, puis `npm run mobile`.
 * - Production : déployez le dossier `dist/` et mettez l'URL ici ou dans EXPO_PUBLIC_WEB_URL.
 */
export const WEB_APP_URL =
  process.env.EXPO_PUBLIC_WEB_URL ||
  (__DEV__ ? 'http://localhost:5173' : 'https://votre-domaine.com');
