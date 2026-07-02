const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

export function apiAdminLogin(username, password) {
  return request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function apiGetAdminStats(token) {
  return request('/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiAdminUnblock(token, hashedIp) {
  return request('/admin/unblock', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ hashedIp }),
  });
}

export function apiAdminChangePassword(token, newPassword) {
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
