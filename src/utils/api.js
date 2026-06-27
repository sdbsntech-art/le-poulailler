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
