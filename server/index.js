import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getStore, updateStore, nextUserId } from './db.js';
import { startNotificationScheduler, sendEmail, sendExpoPushNotification, sendFcmToUserTokens } from './services/notificationService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-dev-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'zayelprotocole2026';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'zayelsalt2026').digest('hex');
}

async function verifyAdminPassword(password, store) {
  if (password === ADMIN_KEY) return true;
  if (store.admin?.passwordHash) {
    return bcrypt.compare(password, store.admin.passwordHash);
  }
  return password === ADMIN_KEY || password === ADMIN_USERNAME;
}

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
      pushAlerts: !!prefs.push_alerts,
      expoPushToken: prefs.expo_push_token || null,
      fcmTokens: prefs.fcm_tokens || [],
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
  const {
    emailAlerts = false,
    browserAlerts = true,
    pushAlerts = false,
    expoPushToken = null,
    fcmToken = null,
    fcmTokens = null,
    timezone = 'UTC',
  } = req.body;
  const now = new Date().toISOString();
  updateStore((s) => {
    const existing = s.notificationPrefs[req.user.id] || {};
    let tokens = existing.fcm_tokens || [];
    if (Array.isArray(fcmTokens)) {
      tokens = [...new Set(fcmTokens.filter(Boolean))];
    } else if (fcmToken && !tokens.includes(fcmToken)) {
      tokens = [...tokens, fcmToken];
    }
    s.notificationPrefs[req.user.id] = {
      email_alerts: emailAlerts,
      browser_alerts: browserAlerts,
      push_alerts: pushAlerts,
      expo_push_token: expoPushToken || existing.expo_push_token || null,
      fcm_tokens: tokens,
      timezone: timezone || existing.timezone || 'UTC',
      updated_at: now,
    };
    return s;
  });
  const saved = getStore().notificationPrefs[req.user.id];
  res.json({
    ok: true,
    emailAlerts,
    browserAlerts,
    pushAlerts,
    expoPushToken: saved.expo_push_token || null,
    fcmTokens: saved.fcm_tokens || [],
    timezone,
  });
});

app.post('/api/fcm/register', authMiddleware, (req, res) => {
  const { token, deviceId = null } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token FCM requis.' });
  }

  const now = new Date().toISOString();
  updateStore((s) => {
    const existing = s.notificationPrefs[req.user.id] || {
      email_alerts: false,
      browser_alerts: true,
      push_alerts: false,
    };
    const tokens = existing.fcm_tokens || [];
    if (!tokens.includes(token)) {
      tokens.push(token);
    }
    s.notificationPrefs[req.user.id] = {
      ...existing,
      fcm_tokens: tokens,
      push_alerts: existing.push_alerts !== false ? existing.push_alerts : true,
      device_id: deviceId || existing.device_id || null,
      updated_at: now,
    };
    return s;
  });

  res.json({ ok: true, registered: true, fcmTokens: getStore().notificationPrefs[req.user.id].fcm_tokens });
});

app.post('/api/notifications/trigger', authMiddleware, async (req, res) => {
  const { alerteId, titre, detail, heure, type } = req.body;
  const store = getStore();
  const userId = req.user.id;
  const prefs = store.notificationPrefs[userId];
  const user = store.users.find((u) => u.id === userId);

  if (!prefs) {
    return res.status(404).json({ error: 'Préférences de notification non trouvées.' });
  }

  const userTimezone = prefs.timezone || 'UTC';
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: userTimezone });
  const sentKey = `${userId}-${alerteId}-${todayStr}`;

  if (store.sentNotifications?.[sentKey]) {
    return res.json({ ok: true, message: 'Notification déjà envoyée aujourd\'hui pour cette alerte.' });
  }

  let emailSent = false;
  let pushSent = false;

  // Envoi email simulé si activé
  if (prefs.email_alerts && user?.email) {
    try {
      await sendEmail(
        user.email,
        `🐔 Le Poulailler : ${titre}`,
        `Bonjour ${user.nom || ''},\n\nVoici votre rappel :\n- Alerte : ${titre}\n- Détails : ${detail}\n- Heure prévue : ${heure}\n\nBonne journée,\nL'équipe Le Poulailler`,
        `<div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #d4af5f;">🐔 Le Poulailler</h2>
          <p>Bonjour <strong>${user.nom || ''}</strong>,</p>
          <p>Voici votre rappel automatique :</p>
          <div style="background: #fdfaf2; padding: 15px; border-left: 4px solid #d4af5f; margin: 15px 0;">
            <p style="margin: 0; font-size: 1.1em; font-weight: bold;">${titre}</p>
            <p style="margin: 5px 0 0 0; color: #666;">${detail}</p>
            <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #999;">Horaire prévu : ${heure}</p>
          </div>
          <p>Bonne journée !</p>
        </div>`
      );
      emailSent = true;
    } catch (e) {
      console.error('[Trigger API] Erreur envoi email :', e);
    }
  }

  // Envoi push Expo + FCM si activé
  if (prefs.push_alerts) {
    if (prefs.expo_push_token) {
      try {
        await sendExpoPushNotification(
          prefs.expo_push_token,
          `🐔 ${titre}`,
          `${detail} (${heure})`,
          { alerteId, type }
        );
        pushSent = true;
      } catch (e) {
        console.error('[Trigger API] Erreur envoi push Expo :', e);
      }
    }
    const fcmTokens = prefs.fcm_tokens || [];
    if (fcmTokens.length > 0) {
      try {
        await sendFcmToUserTokens(
          fcmTokens,
          `🐔 ${titre}`,
          `${detail} (${heure})`,
          { alerteId, type, url: '/?tab=alertes' }
        );
        pushSent = true;
      } catch (e) {
        console.error('[Trigger API] Erreur envoi push FCM :', e);
      }
    }
  }

  // Enregistrer l'envoi
  updateStore((s) => {
    if (!s.sentNotifications) s.sentNotifications = {};
    s.sentNotifications[sentKey] = new Date().toISOString();
    return s;
  });

  res.json({ ok: true, emailSent, pushSent });
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

// Track visitors/views (optional analytics, never blocks)
app.post('/api/stats/track', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const hashedIp = hashIP(ip);

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

  res.json({ ok: true });
});

// Legacy endpoint — no-op, never blocks
app.post('/api/security/report-hacking', (_req, res) => {
  res.json({ blocked: false, message: 'Security reporting disabled.' });
});

// Admin Login Route
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const store = getStore();

  if (username !== ADMIN_USERNAME || !(await verifyAdminPassword(password, store))) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  const token = jwt.sign({ role: 'admin', username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '30d' });
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

  res.json({
    totalUsers,
    pageViews,
    uniqueVisitors,
    users,
  });
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

// Serve static files from the React dist directory
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Wildcard route to serve index.html for non-API routes (SPA fallback)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint API introuvable' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
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
    const hash = await bcrypt.hash(ADMIN_KEY, 10);
    store.admin = {
      username: ADMIN_USERNAME,
      passwordHash: hash,
    };
    needSave = true;
  }

  // Clear any legacy IP blocks from older security builds
  if (store.admin?.blockedIPs?.length) {
    delete store.admin.blockedIPs;
    needSave = true;
  }

  if (needSave) {
    updateStore(() => store);
  }
}

await initDbValues();
startNotificationScheduler();

app.listen(PORT, () => {
  console.log(`API Le Poulailler → http://localhost:${PORT}`);
});
