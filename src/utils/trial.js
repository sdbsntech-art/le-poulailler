export const TRIAL_DAYS = 7;
const TRIAL_KEY = 'le-poulailler-trial-start';
const AUTH_TOKEN_KEY = 'le-poulailler-token';
const AUTH_USER_KEY = 'le-poulailler-user';

export function getTrialStart() {
  try {
    let start = localStorage.getItem(TRIAL_KEY);
    if (!start) {
      start = new Date().toISOString();
      localStorage.setItem(TRIAL_KEY, start);
    }
    return start;
  } catch {
    return new Date().toISOString();
  }
}

export function getTrialStatus(now = new Date()) {
  const start = new Date(getTrialStart());
  const end = new Date(start);
  end.setDate(end.getDate() + TRIAL_DAYS);
  const msLeft = end - now;
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const expired = msLeft <= 0;
  const showWarning = !expired && daysLeft <= 2;
  return { start, end, daysLeft, expired, showWarning, active: !expired };
}

export function clearTrialData() {
  const keys = [
    'le-poulailler-data',
    'le-poulailler-profil',
    'le-poulailler-completed',
    'le-poulailler-msg-log',
  ];
  keys.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}

export function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
