import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

const svg = readFileSync(join(publicDir, 'icon.svg'));

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(join(publicDir, name));
}

const maskableSize = 512;
const padding = Math.round(maskableSize * 0.1);
await sharp(svg)
  .resize(maskableSize - padding * 2, maskableSize - padding * 2)
  .extend({
    top: padding,
    bottom: padding,
    left: padding,
    right: padding,
    background: { r: 15, g: 14, b: 12, alpha: 1 },
  })
  .png()
  .toFile(join(publicDir, 'pwa-512x512-maskable.png'));

console.log('Icônes PWA générées dans public/');
