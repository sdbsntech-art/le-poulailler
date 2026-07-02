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
import { enableWebPush, getStoredFcmToken, isFcmAvailable, listenForForegroundMessages } from '../utils/fcmPush';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailAlerts: false,
    browserAlerts: true,
    pushAlerts: false,
    expoPushToken: null,
    fcmTokens: [],
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
        const serverPrefs = data.notificationPrefs || {
          emailAlerts: false,
          browserAlerts: true,
          pushAlerts: false,
          expoPushToken: null,
          fcmTokens: [],
        };
        const localExpoToken = localStorage.getItem('expo-push-token');
        const localFcmToken = getStoredFcmToken();
        
        if (localExpoToken && !serverPrefs.expoPushToken) {
          console.log('[AuthContext] Synchronisation du token push local vers le serveur...');
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const updatedPrefs = {
            ...serverPrefs,
            expoPushToken: localExpoToken,
            pushAlerts: true,
            timezone,
          };
          apiSaveNotificationPrefs(token, updatedPrefs)
            .then((res) => {
              setNotificationPrefs(res);
            })
            .catch((err) => {
              console.error('[AuthContext] Erreur de synchronisation du token local :', err);
              setNotificationPrefs(serverPrefs);
            });
        } else if (localFcmToken && !(serverPrefs.fcmTokens || []).includes(localFcmToken)) {
          enableWebPush(token)
            .then((result) => {
              if (result.status === 'granted' && result.token) {
                setNotificationPrefs((prev) => ({
                  ...prev,
                  ...serverPrefs,
                  pushAlerts: serverPrefs.pushAlerts || true,
                  fcmTokens: [...new Set([...(serverPrefs.fcmTokens || []), result.token])],
                }));
              } else {
                setNotificationPrefs(serverPrefs);
              }
            })
            .catch(() => setNotificationPrefs(serverPrefs));
        } else {
          setNotificationPrefs(serverPrefs);
        }
      })
      .catch(() => {
        clearAuthSession();
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (window.ReactNativeWebView) {
      console.log('[AuthContext] Demande de token push Expo...');
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GET_PUSH_TOKEN' }));
    }
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
    setNotificationPrefs(data.notificationPrefs || {
      emailAlerts: false,
      browserAlerts: true,
      pushAlerts: false,
      expoPushToken: null,
      fcmTokens: [],
    });
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
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localFcm = getStoredFcmToken();
      const updatedPrefs = {
        ...prefs,
        timezone,
        fcmToken: localFcm || prefs.fcmToken || null,
      };
      const saved = await apiSaveNotificationPrefs(token, updatedPrefs);
      setNotificationPrefs(saved);
      return saved;
    },
    [token]
  );

  const activateWebPush = useCallback(async () => {
    if (!token) return { status: 'error', error: 'Connexion requise' };
    const result = await enableWebPush(token);
    if (result.status === 'granted' && result.token) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const saved = await apiSaveNotificationPrefs(token, {
        ...notificationPrefs,
        pushAlerts: true,
        fcmToken: result.token,
        timezone,
      });
      setNotificationPrefs(saved);
    }
    return result;
  }, [token, notificationPrefs]);

  useEffect(() => {
    if (token && isFcmAvailable()) {
      listenForForegroundMessages();
    }
  }, [token]);

  useEffect(() => {
    const handleMessage = async (event) => {
      try {
        let payload = event.data;
        if (typeof payload === 'string') {
          payload = JSON.parse(payload);
        }
        if (payload && payload.type === 'EXPO_PUSH_TOKEN' && payload.token) {
          console.log('[AuthContext] Token Expo Push reçu :', payload.token);
          localStorage.setItem('expo-push-token', payload.token);

          // Si l'utilisateur est déjà connecté, on met à jour ses préférences sur le serveur immédiatement
          if (token) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const newPrefs = {
              emailAlerts: notificationPrefs.emailAlerts,
              browserAlerts: notificationPrefs.browserAlerts,
              pushAlerts: notificationPrefs.pushAlerts || true, // Activer par défaut si reçu dans l'application
              expoPushToken: payload.token,
              timezone,
            };
            await apiSaveNotificationPrefs(token, newPrefs);
            setNotificationPrefs(newPrefs);
          }
        }
      } catch (err) {
        // Ignorer les messages qui ne sont pas au format attendu
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage);
    };
  }, [token, notificationPrefs]);

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
    activateWebPush,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
