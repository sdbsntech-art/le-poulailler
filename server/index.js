import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getStore, updateStore, nextUserId } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-dev-key';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Failed login / hacking attempts map (hashedIp -> attempts count)
const failedAttempts = new Map();

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'zayelsalt2026').digest('hex');
}

// Security Middleware to block banned IPs
function ipBlockMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const hashedIp = hashIP(ip);
  const store = getStore();
  
  if (store.admin?.blockedIPs?.includes(hashedIp)) {
    return res.status(403).json({ blocked: true, error: 'Accès suspendu suite à des tentatives suspectes.' });
  }
  next();
}

app.use(ipBlockMiddleware);

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expirée' });
  }
}

function adminAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expirée' });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'le-poulailler-api', users: getStore().users.length });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, nom = '' } = req.body;
  if (!email?.includes('@') || !password || password.length < 6) {
    return res.status(400).json({ error: 'Email valide et mot de passe (6+ caractères) requis.' });
  }
  const emailLower = email.toLowerCase();
  const store = getStore();
  if (store.users.some((u) => u.email === emailLower)) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
  }

  const hash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const userId = nextUserId(store);

  updateStore((s) => {
    s.users.push({ id: userId, email: emailLower, password_hash: hash, nom: nom.trim(), created_at: now, last_login_at: null });
    s.userData[userId] = { lots_json: [], profil_json: {}, updated_at: now };
    s.notificationPrefs[userId] = { email_alerts: false, browser_alerts: true, updated_at: now };
    return s;
  });

  const token = jwt.sign({ id: userId, email: emailLower }, JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ token, user: { id: userId, email: emailLower, nom: nom.trim() } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const store = getStore();
  const user = store.users.find((u) => u.email === email?.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
  }
  const now = new Date().toISOString();
  updateStore((s) => {
    const u = s.users.find((x) => x.id === user.id);
    if (u) u.last_login_at = now;
    return s;
  });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, email: user.email, nom: user.nom } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = getStore().users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  const { password_hash, ...safe } = user;
  res.json({ user: safe });
});

app.get('/api/data', authMiddleware, (req, res) => {
  const store = getStore();
  const row = store.userData[req.user.id] || { lots_json: [], profil_json: {}, updated_at: null };
  const prefs = store.notificationPrefs[req.user.id] || { email_alerts: false, browser_alerts: true };
  res.json({
    lots: row.lots_json || [],
    profil: row.profil_json || {},
    updatedAt: row.updated_at,
    notificationPrefs: {
      emailAlerts: !!prefs.email_alerts,
      browserAlerts: prefs.browser_alerts !== false,
    },
  });
});

app.put('/api/data', authMiddleware, (req, res) => {
  const { lots = [], profil = {} } = req.body;
  const now = new Date().toISOString();
  updateStore((s) => {
    s.userData[req.user.id] = { lots_json: lots, profil_json: profil, updated_at: now };
    return s;
  });
  res.json({ ok: true, updatedAt: now });
});

app.put('/api/notifications/prefs', authMiddleware, (req, res) => {
  const { emailAlerts = false, browserAlerts = true } = req.body;
  const now = new Date().toISOString();
  updateStore((s) => {
    s.notificationPrefs[req.user.id] = {
      email_alerts: emailAlerts,
      browser_alerts: browserAlerts,
      updated_at: now,
    };
    return s;
  });
  res.json({ ok: true, emailAlerts, browserAlerts });
});

app.get('/api/admin/users', (req, res) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  const store = getStore();
  const users = store.users.map((u) => {
    const d = store.userData[u.id];
    const p = store.notificationPrefs[u.id];
    const { password_hash, ...safe } = u;
    return {
      ...safe,
      data_updated_at: d?.updated_at,
      lots_count: Array.isArray(d?.lots_json) ? d.lots_json.length : 0,
      email_alerts: p?.email_alerts,
      browser_alerts: p?.browser_alerts,
    };
  });
  res.json({ count: users.length, users });
});

// --- NEW SECURITY AND ADMIN ENDPOINTS ---

// Track visitors/views and verify block status
app.post('/api/stats/track', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const hashedIp = hashIP(ip);
  const store = getStore();
  
  // If already blocked, return error
  if (store.admin?.blockedIPs?.includes(hashedIp)) {
    return res.status(403).json({ blocked: true, error: 'Accès suspendu.' });
  }

  updateStore((s) => {
    if (!s.stats) {
      s.stats = { pageViews: 0, uniqueVisitors: [] };
    }
    s.stats.pageViews += 1;
    if (!s.stats.uniqueVisitors.includes(hashedIp)) {
      s.stats.uniqueVisitors.push(hashedIp);
    }
    return s;
  });

  res.json({ ok: true, blocked: false });
});

// Report hacking / suspicious attempts
app.post('/api/security/report-hacking', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const hashedIp = hashIP(ip);
  const { reason = 'Activité suspecte' } = req.body;

  let attempts = (failedAttempts.get(hashedIp) || 0) + 1;
  failedAttempts.set(hashedIp, attempts);

  console.warn(`[Alerte Sécurité] Tentative suspecte de l'IP ${ip} (${hashedIp}) : ${reason}. Tentative ${attempts}/3`);

  if (attempts >= 3) {
    updateStore((s) => {
      if (!s.admin) s.admin = {};
      if (!s.admin.blockedIPs) s.admin.blockedIPs = [];
      if (!s.admin.blockedIPs.includes(hashedIp)) {
        s.admin.blockedIPs.push(hashedIp);
      }
      return s;
    });
    return res.json({ blocked: true, attempts, message: 'Nombre maximal de tentatives dépassé. Accès bloqué.' });
  }

  res.json({ blocked: false, attempts, message: 'Activité enregistrée.' });
});

// Admin Login Route
app.post('/api/admin/login', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const hashedIp = hashIP(ip);
  const store = getStore();

  if (store.admin?.blockedIPs?.includes(hashedIp)) {
    return res.status(403).json({ blocked: true, error: 'Accès suspendu.' });
  }

  const { username, password } = req.body;

  if (username !== 'zayelprotocole2026' || !(await bcrypt.compare(password, store.admin?.passwordHash || ''))) {
    let attempts = (failedAttempts.get(hashedIp) || 0) + 1;
    failedAttempts.set(hashedIp, attempts);

    if (attempts >= 3) {
      updateStore((s) => {
        if (!s.admin) s.admin = {};
        if (!s.admin.blockedIPs) s.admin.blockedIPs = [];
        if (!s.admin.blockedIPs.includes(hashedIp)) {
          s.admin.blockedIPs.push(hashedIp);
        }
        return s;
      });
      return res.status(403).json({ blocked: true, error: 'Trop de tentatives infructueuses. Accès bloqué.' });
    }

    return res.status(401).json({ error: `Identifiants incorrects. Tentative ${attempts}/3.` });
  }

  // Clear attempts on success
  failedAttempts.delete(hashedIp);

  // Generate Admin Token
  const token = jwt.sign({ role: 'admin', username: 'zayelprotocole2026' }, JWT_SECRET, { expiresIn: '4h' });
  res.json({ token });
});

// Admin Dashboard stats
app.get('/api/admin/stats', adminAuthMiddleware, (req, res) => {
  const store = getStore();
  const totalUsers = store.users.length;
  const pageViews = store.stats?.pageViews || 0;
  const uniqueVisitors = store.stats?.uniqueVisitors?.length || 0;
  
  const users = store.users.map((u) => {
    const d = store.userData[u.id];
    const { password_hash, ...safe } = u;
    return {
      ...safe,
      lots_count: Array.isArray(d?.lots_json) ? d.lots_json.length : 0,
      last_login_at: u.last_login_at || null
    };
  });
  
  const blockedIPs = store.admin?.blockedIPs || [];

  res.json({
    totalUsers,
    pageViews,
    uniqueVisitors,
    users,
    blockedIPs
  });
});

// Admin Unblock IP route
app.post('/api/admin/unblock', adminAuthMiddleware, (req, res) => {
  const { hashedIp } = req.body;
  if (!hashedIp) {
    return res.status(400).json({ error: 'Adresse hachée requise.' });
  }

  updateStore((s) => {
    if (s.admin?.blockedIPs) {
      s.admin.blockedIPs = s.admin.blockedIPs.filter((ip) => ip !== hashedIp);
    }
    return s;
  });

  failedAttempts.delete(hashedIp);
  res.json({ ok: true });
});

// Admin Change Password Route
app.post('/api/admin/change-password', adminAuthMiddleware, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Nouveau mot de passe de 6+ caractères requis.' });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  updateStore((s) => {
    if (!s.admin) s.admin = {};
    s.admin.passwordHash = hash;
    return s;
  });

  res.json({ ok: true });
});

// Initialize settings/admin dynamically on start
async function initDbValues() {
  const store = getStore();
  let needSave = false;
  
  if (!store.stats) {
    store.stats = { pageViews: 0, uniqueVisitors: [] };
    needSave = true;
  }
  
  if (!store.admin || !store.admin.passwordHash) {
    const hash = await bcrypt.hash('zayelprotocole2026', 10);
    store.admin = {
      username: 'zayelprotocole2026',
      passwordHash: hash,
      blockedIPs: store.admin?.blockedIPs || []
    };
    needSave = true;
  }

  if (needSave) {
    updateStore(() => store);
  }
}

await initDbValues();

app.listen(PORT, () => {
  console.log(`API Le Poulailler → http://localhost:${PORT}`);
});
