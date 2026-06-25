/**
 * Copie les icônes PWA vers mobile/assets pour Expo.
 * Usage : node scripts/sync-mobile-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, '..', 'public');
const assetsDir = path.join(root, '..', 'mobile', 'assets');

fs.mkdirSync(assetsDir, { recursive: true });

const copies = [
  ['pwa-512x512.png', 'icon.png'],
  ['pwa-512x512.png', 'splash.png'],
  ['pwa-512x512-maskable.png', 'adaptive-icon.png'],
];

for (const [src, dest] of copies) {
  fs.copyFileSync(path.join(publicDir, src), path.join(assetsDir, dest));
  console.log(`${src} → mobile/assets/${dest}`);
}

console.log('Assets mobile synchronisés.');
