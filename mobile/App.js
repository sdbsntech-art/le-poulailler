import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { WEB_APP_URL } from './config';

/**
 * Push mobile : Expo Push Token (pas FCM web).
 * Au démarrage, le token est injecté dans la WebView ; AuthContext le synchronise
 * au serveur à la connexion (GET_PUSH_TOKEN / EXPO_PUSH_TOKEN).
 * Pour FCM natif Expo, il faudrait google-services.json + credentials EAS (hors scope actuel).
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState(null);

  // Helper to request access and fetch Expo's push token
  const registerForPushNotificationsAsync = useCallback(async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Permission de notifications refusée.');
        return null;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      return tokenData.data;
    } else {
      console.warn('Les notifications push nécessitent un appareil physique.');
      return null;
    }
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
        }
      })
      .catch((err) => console.log('[Push Mobile] Erreur lors de l\'obtention du token :', err));
  }, [registerForPushNotificationsAsync]);

  const injectToken = useCallback(() => {
    if (expoPushToken && webRef.current) {
      const js = `
        (function() {
          const msg = JSON.stringify({ type: 'EXPO_PUSH_TOKEN', token: ${JSON.stringify(expoPushToken)} });
          window.postMessage(msg, '*');
          if (window.dispatchEvent) {
            window.dispatchEvent(new MessageEvent('message', { data: msg }));
          }
        })();
        true;
      `;
      webRef.current.injectJavaScript(js);
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (expoPushToken && !loading && !error) {
      injectToken();
    }
  }, [expoPushToken, loading, error, injectToken]);

  const onMessage = useCallback((event) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload && payload.type === 'GET_PUSH_TOKEN') {
        console.log('[Mobile App] Demande de token push reçue de la WebView.');
        injectToken();
      }
    } catch (err) {
      console.warn('[Mobile App] Erreur de parsing du message WebView :', err);
    }
  }, [injectToken]);

  // Écouter les notifications reçues et cliquées
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Mobile App] Notification reçue en premier plan :', notification);
      if (webRef.current) {
        const msg = JSON.stringify({
          type: 'NOTIFICATION_RECEIVED',
          notification: notification,
        });
        webRef.current.injectJavaScript(`
          (function() {
            const msg = ${JSON.stringify(msg)};
            window.postMessage(msg, '*');
            if (window.dispatchEvent) {
              window.dispatchEvent(new MessageEvent('message', { data: msg }));
            }
          })();
          true;
        `);
      }
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Mobile App] Notification cliquée :', response);
      const data = response.notification.request.content.data;
      if (webRef.current) {
        const msg = JSON.stringify({
          type: 'NOTIFICATION_CLICKED',
          data: data,
        });
        webRef.current.injectJavaScript(`
          (function() {
            const msg = ${JSON.stringify(msg)};
            window.postMessage(msg, '*');
            if (window.dispatchEvent) {
              window.dispatchEvent(new MessageEvent('message', { data: msg }));
            }
          })();
          true;
        `);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const onReload = useCallback(() => {
    setError(false);
    setLoading(true);
    webRef.current?.reload();
  }, []);

  const onNavigationStateChange = useCallback((navState) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (webRef.current && canGoBack) {
        webRef.current.goBack();
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" backgroundColor="#0f0e0c" />
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Connexion impossible</Text>
          <Text style={styles.errorText}>
            Lancez le serveur web à la racine du projet :{'\n'}
            <Text style={styles.code}>npm run dev</Text>
            {'\n\n'}
            URL attendue : {WEB_APP_URL}
          </Text>
          <TouchableOpacity style={styles.btn} onPress={onReload}>
            <Text style={styles.btnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#d4af5f" />
              <Text style={styles.loaderText}>Le Poulailler…</Text>
            </View>
          )}
          <WebView
            ref={webRef}
            onMessage={onMessage}
            source={{ uri: WEB_APP_URL }}
            style={styles.webview}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false);
              injectToken();
            }}
            onNavigationStateChange={onNavigationStateChange}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            onHttpError={() => {
              setLoading(false);
              setError(true);
            }}
            allowsBackForwardNavigationGestures
            pullToRefreshEnabled
            setSupportMultipleWindows={false}
            mediaPlaybackRequiresUserAction
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            originWhitelist={['*']}
            applicationNameForUserAgent={`LePoulaillerApp/${Platform.OS}`}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0e0c',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0f0e0c',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0e0c',
    zIndex: 2,
  },
  loaderText: {
    marginTop: 12,
    color: '#d4af5f',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBox: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    color: '#f5f0e6',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorText: {
    color: '#9a9080',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  code: {
    color: '#d4af5f',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  btn: {
    backgroundColor: '#8b6914',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  btnText: {
    color: '#0f0e0c',
    fontWeight: '700',
    fontSize: 16,
  },
});
