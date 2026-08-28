import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ArrowLeft, RefreshCw, Lock, ShieldCheck } from 'lucide-react-native';
import { GoogleGLogo } from './components/GoogleGLogo';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../api/client';
import { COLORS } from '../../constants/theme';

interface Props {
  navigation: any;
  route: any;
}

const GOOGLE_CLIENT_ID = '324729375491-viu62s7s3l3m9o4be0geuv68t4j589id.apps.googleusercontent.com';

const USER_AGENT =
  Platform.OS === 'android'
    ? 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36'
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export const GoogleAuthScreen: React.FC<Props> = ({ navigation, route }) => {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const role = route?.params?.role || 'candidate';

  const webViewRef = useRef<WebView>(null);
  const handledRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [authProcessing, setAuthProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Generate OAuth URL
  const redirectUri = `${API_BASE_URL}/api/v1/auth/google/callback`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=openid%20email%20profile&prompt=select_account&state=${encodeURIComponent(role)}`;

  useEffect(() => {
    handledRef.current = false;
  }, []);

  const parseTokensFromUrl = (url: string) => {
    if (!url) return null;

    if (url.includes('error=')) {
      const errorDescMatch = url.match(/[?#&]error_description=([^&]+)/);
      const errorMatch = url.match(/[?#&]error=([^&]+)/);
      const msg = errorDescMatch
        ? decodeURIComponent(errorDescMatch[1].replace(/\+/g, ' '))
        : errorMatch
        ? decodeURIComponent(errorMatch[1].replace(/\+/g, ' '))
        : 'Google authentication was cancelled or failed.';
      return { error: msg };
    }

    const hasAccessToken = url.includes('access_token=');
    const hasIdToken = url.includes('id_token=');

    if (!hasAccessToken && !hasIdToken) return null;

    let accessToken: string | undefined;
    const accessMatch = url.match(/[?#&]access_token=([^&]+)/);
    if (accessMatch && accessMatch[1]) {
      accessToken = decodeURIComponent(accessMatch[1]);
    }

    let idToken: string | undefined;
    const idMatch = url.match(/[?#&]id_token=([^&]+)/);
    if (idMatch && idMatch[1]) {
      idToken = decodeURIComponent(idMatch[1]);
    }

    if (accessToken || idToken) {
      return { accessToken, idToken };
    }

    return null;
  };

  const handleCompleteAuth = async (accessToken?: string, idToken?: string) => {
    if (handledRef.current) return;
    handledRef.current = true;
    setAuthProcessing(true);

    try {
      await loginWithGoogle({
        accessToken: accessToken || undefined,
        idToken: idToken || undefined,
        role,
      });
      // Upon success, AuthProvider updates isAuthenticated and AppNavigator switches screen automatically
    } catch (err: any) {
      handledRef.current = false;
      setAuthProcessing(false);
      showToast(err.message || 'Google Sign-In failed', 'error');
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  const handleInterceptUrl = (url: string): boolean => {
    if (handledRef.current) return false;

    const parsed = parseTokensFromUrl(url);
    if (parsed) {
      if (parsed.error) {
        handledRef.current = true;
        showToast(parsed.error, 'error');
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        return false;
      }
      if (parsed.accessToken || parsed.idToken) {
        handleCompleteAuth(parsed.accessToken, parsed.idToken);
        return false;
      }
    }

    if (url.startsWith('jobmarket://')) {
      const hashOrQuery = url.replace('jobmarket://oauth', '').replace('jobmarket://', '');
      const schemeParsed = parseTokensFromUrl(`https://callback${hashOrQuery}`);
      if (schemeParsed && (schemeParsed.accessToken || schemeParsed.idToken)) {
        handleCompleteAuth(schemeParsed.accessToken, schemeParsed.idToken);
        return false;
      }
    }

    return true;
  };

  const injectedJs = `
    (function() {
      function checkTokens() {
        var href = window.location.href || '';
        var hash = window.location.hash || '';
        var search = window.location.search || '';
        if (href.indexOf('access_token=') !== -1 || hash.indexOf('access_token=') !== -1 || search.indexOf('access_token=') !== -1 || href.indexOf('id_token=') !== -1) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'GOOGLE_AUTH_TOKENS',
              url: href,
              hash: hash,
              search: search
            }));
          }
        }
      }
      checkTokens();
      window.addEventListener('hashchange', checkTokens);
    })();
    true;
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && (data.type === 'GOOGLE_AUTH_TOKENS' || data.url)) {
        handleInterceptUrl(data.url || (data.hash ? `https://callback#${data.hash}` : ''));
      }
    } catch (_) {}
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.headerTitleRow}>
            <GoogleGLogo size={16} />
            <Text style={styles.headerTitle}>Google Sign-In</Text>
          </View>
          <Text style={styles.headerSubtitle}>Continue to JobMarket</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Loading Bar */}
      {(loading || authProcessing) && (
        <View style={styles.loadingBarContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          {authProcessing && (
            <Text style={styles.authProcessingText}>Finalizing authentication...</Text>
          )}
        </View>
      )}

      {/* Error state or WebView */}
      {loadError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorSubtitle}>{loadError}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoadError(null);
              setLoading(true);
              webViewRef.current?.reload();
            }}
            activeOpacity={0.8}
          >
            <RefreshCw size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.retryBtnText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: authUrl }}
          userAgent={USER_AGENT}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          injectedJavaScript={injectedJs}
          onMessage={handleMessage}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (nativeEvent.description?.includes('ERR_UNKNOWN_URL_SCHEME') || nativeEvent.code === -1004) {
              return;
            }
            setLoading(false);
            setLoadError(nativeEvent.description || 'Failed to load Google Sign-In');
          }}
          onShouldStartLoadWithRequest={(request) => {
            return handleInterceptUrl(request.url);
          }}
          onNavigationStateChange={(navState) => {
            handleInterceptUrl(navState.url);
          }}
          style={styles.webview}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  loadingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  authProcessingText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 0,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
