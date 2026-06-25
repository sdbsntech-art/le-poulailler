import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { WEB_APP_URL } from './config';

export default function App() {
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const onReload = useCallback(() => {
    setError(false);
    setLoading(true);
    webRef.current?.reload();
  }, []);

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
            source={{ uri: WEB_APP_URL }}
            style={styles.webview}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
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
