import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getTrialStatus,
  clearTrialData,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
  clearAuthSession,
  TRIAL_DAYS,
} from '../utils/trial';
import { apiLogin, apiRegister, apiGetData, apiSaveData, apiSaveNotificationPrefs } from '../utils/api';
import { demanderPermissionNotif } from '../utils/notifyDispatch';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailAlerts: false,
    browserAlerts: true,
  });
  const [loading, setLoading] = useState(!!getStoredToken());
  const [trialTick, setTrialTick] = useState(0);

  const isAuthenticated = !!token && !!user;
  const trial = useMemo(() => getTrialStatus(), [trialTick, isAuthenticated]);

  const accessGranted = isAuthenticated || !trial.expired;

  useEffect(() => {
    const id = setInterval(() => setTrialTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    apiGetData(token)
      .then((data) => {
        setNotificationPrefs(data.notificationPrefs || { emailAlerts: false, browserAlerts: true });
      })
      .catch(() => {
        clearAuthSession();
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated && trial.expired) {
      clearTrialData();
    }
  }, [isAuthenticated, trial.expired]);

  const login = useCallback(async (email, password) => {
    const { token: t, user: u } = await apiLogin(email, password);
    saveAuthSession(t, u);
    setToken(t);
    setUser(u);
    const data = await apiGetData(t);
    setNotificationPrefs(data.notificationPrefs || { emailAlerts: false, browserAlerts: true });
    return { token: t, user: u, remoteData: data };
  }, []);

  const register = useCallback(async (email, password, nom) => {
    const { token: t, user: u } = await apiRegister(email, password, nom);
    saveAuthSession(t, u);
    setToken(t);
    setUser(u);
    return { token: t, user: u };
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    clearTrialData();
    window.location.reload();
  }, []);

  const syncToCloud = useCallback(
    async (lots, profil) => {
      if (!token) return;
      let l = lots;
      let p = profil;
      try {
        if (l === undefined) l = JSON.parse(localStorage.getItem('le-poulailler-data') || '[]');
        if (p === undefined) p = JSON.parse(localStorage.getItem('le-poulailler-profil') || '{}');
      } catch {
        l = l ?? [];
        p = p ?? {};
      }
      await apiSaveData(token, l, p);
    },
    [token]
  );

  const fetchCloudData = useCallback(async () => {
    if (!token) return null;
    return apiGetData(token);
  }, [token]);

  const updateNotificationPrefs = useCallback(
    async (prefs) => {
      if (!token) return prefs;
      if (prefs.browserAlerts) {
        await demanderPermissionNotif();
      }
      await apiSaveNotificationPrefs(token, prefs);
      setNotificationPrefs(prefs);
      return prefs;
    },
    [token]
  );

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    trial,
    accessGranted,
    trialDays: TRIAL_DAYS,
    notificationPrefs,
    login,
    register,
    logout,
    syncToCloud,
    fetchCloudData,
    updateNotificationPrefs,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
