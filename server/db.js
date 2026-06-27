import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'store.json');

const DEFAULT = { users: [], userData: {}, notificationPrefs: {} };

function load() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(DEFAULT, null, 2));
    return structuredClone(DEFAULT);
  }
  try {
    return { ...DEFAULT, ...JSON.parse(fs.readFileSync(dbPath, 'utf8')) };
  } catch {
    return structuredClone(DEFAULT);
  }
}

function save(data) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

let cache = load();

export function getStore() {
  return cache;
}

export function updateStore(mutator) {
  cache = mutator(structuredClone(cache));
  save(cache);
  return cache;
}

export function nextUserId(store) {
  return store.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
}
