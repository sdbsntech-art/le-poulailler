const API_BASE = import.meta.env.VITE_API_URL || '/api';

const ADMIN_USERNAME = 'zayelprotocole2026';
const LOCAL_ADMIN_TOKEN = 'local-admin-session';

export function isLocalAdminToken(token) {
  return token === LOCAL_ADMIN_TOKEN;
}

export function tryLocalAdminLogin(username, password) {
  const localKey = import.meta.env.VITE_ADMIN_KEY || import.meta.env.VITE_ADMIN_PASSWORD || ADMIN_USERNAME;
  if (username === ADMIN_USERNAME && (password === localKey || password === ADMIN_USERNAME)) {
    return { token: LOCAL_ADMIN_TOKEN, offline: true };
  }
  return null;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }
  return data;
}

export function apiRegister(email, password, nom) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, nom }),
  });
}

export function apiLogin(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function apiMe(token) {
  return request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiGetData(token) {
  return request('/data', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiSaveData(token, lots, profil) {
  return request('/data', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ lots, profil }),
  });
}

export function apiSaveNotificationPrefs(token, prefs) {
  return request('/notifications/prefs', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(prefs),
  });
}

export async function apiAdminLogin(username, password) {
  try {
    return await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  } catch (err) {
    const local = tryLocalAdminLogin(username, password);
    if (local) return local;
    throw err;
  }
}

export async function apiGetAdminStats(token) {
  if (isLocalAdminToken(token)) {
    return {
      offline: true,
      totalUsers: 0,
      pageViews: 0,
      uniqueVisitors: 0,
      users: [],
    };
  }
  return request('/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiAdminChangePassword(token, newPassword) {
  if (isLocalAdminToken(token)) {
    return Promise.reject(new Error('Modification du mot de passe indisponible en mode hors ligne.'));
  }
  return request('/admin/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ newPassword }),
  });
}

export function apiTriggerNotification(token, payload) {
  return request('/notifications/trigger', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function apiRegisterFcmToken(authToken, fcmToken, deviceId) {
  return request('/fcm/register', {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ token: fcmToken, deviceId }),
  });
}
