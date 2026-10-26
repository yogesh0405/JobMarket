import React, { useState, useEffect } from 'react';
import { View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';
import {
  NavigationContainer,
  LinkingOptions,
  useNavigationContainerRef,
  getStateFromPath,
} from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { BackendStatusProvider } from './src/context/BackendStatusContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { NoInternetScreen } from './src/components/common/NoInternetScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/components/common/SplashScreen';
import { MaintenanceModal } from './src/components/common/MaintenanceModal';
import { useAuth } from './src/hooks/useAuth';
import { usePlatformSettings } from './src/hooks/usePlatformSettings';
import { PushNotificationManager } from './src/services/PushNotificationManager';

// Initialize OAuth browser session interception
WebBrowser.maybeCompleteAuthSession();

const envApiUrl = process.env.EXPO_PUBLIC_API_URL || '';
const envWebUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://job-market-wine.vercel.app';

let expoPrefix = 'jobmarket://';
try {
  expoPrefix = Linking.createURL('/');
} catch (_) {}

// Industry-Standard Deep Linking & Universal Link Configuration
const linking: LinkingOptions<any> = {
  prefixes: [
    expoPrefix,
    'jobmarket://',
    'exp://',
    envWebUrl,
    envWebUrl.replace('https://', 'http://'),
    ...(envApiUrl ? [envApiUrl, envApiUrl.replace('https://', 'http://')] : []),
  ],
  filter: (url: string) => {
    if (!url) return false;
    const trimmed = url.trim();
    // Ignore pure Expo development / Metro dev server launch URLs without a deep link payload
    if (
      /^exp:\/\/[^/]+(\/--)?\/?$/.test(trimmed) ||
      /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d+\/?$/.test(trimmed)
    ) {
      return false;
    }
    return true;
  },
  config: {
    screens: {
      CandidateJobDetail: 'job/:jobId',
      VerifyOTP: 'verify-otp',
      CandidateProfile: 'candidate-profile',
      CompanyProfile: 'company-profile',
      EmployerDashboard: 'employer-dashboard',
      JobApplicants: 'job-applicants/:jobId',
      NotFound: '*',
    },
  },
  getStateFromPath: (path, options) => {
    if (!path) return undefined;

    let cleanPath = path.trim();

    // Ignore pure Expo development hosts/ports (e.g., "192.168.1.5:8081", "localhost:8081", or "--")
    if (/^[a-zA-Z0-9.-]+:\d+(\/--)?\/?$/.test(cleanPath)) {
      return undefined;
    }

    // Strip Expo host and internal Expo routing prefixes if present
    cleanPath = cleanPath.replace(/^[a-zA-Z0-9.-]+:\d+\/--\/?/, '');
    cleanPath = cleanPath.replace(/^[a-zA-Z0-9.-]+:\d+\/?/, '');
    cleanPath = cleanPath.replace(/^--\/?/, '');
    cleanPath = cleanPath.replace(/^\/+|\/+$/g, '');

    // Ignore empty/root paths and Expo/Metro internal dev paths
    if (
      !cleanPath ||
      cleanPath === '/' ||
      cleanPath === '--' ||
      cleanPath.startsWith('node_modules') ||
      cleanPath.startsWith('.expo') ||
      cleanPath.includes('hot') ||
      cleanPath.includes('symbolicate')
    ) {
      return undefined;
    }

    // Normalize alternate deep link path aliases
    if (cleanPath.startsWith('jobs/')) {
      cleanPath = 'job/' + cleanPath.slice(5);
    }

    // Standard React Navigation resolver — will route to NotFound only for genuine unrecognized deep link paths
    return getStateFromPath(cleanPath, options);
  },
};

function MainAppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { settings, platformName, logoUrl, supportEmail, contactNumber, refreshSettings } = usePlatformSettings();
  const navigationRef = useNavigationContainerRef<any>();

  const isMaintenanceActive = settings?.maintenance_mode === 'true' && (user as any)?.role !== 'admin';

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  const isReady = (fontsLoaded || !!fontError) && !isLoadingAuth;

  // Splash screen presentation: synchronize with auth state initialization to prevent login screen flash
  useEffect(() => {
    let timer: any;
    if (isReady) {
      timer = setTimeout(() => {
        setShowSplash(false);
      }, 1200);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isReady]);

  // Safety fallback so splash screen never hangs permanently on network failure
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Initialize Push Notification channels and listeners
  useEffect(() => {
    PushNotificationManager.init(navigationRef);
    return () => {
      PushNotificationManager.cleanupListeners();
    };
  }, []);

  // Global Centralized Navigation Route Listener for Strict Status Bar Synchronization
  const handleStateChange = () => {
    try {
      const currentRoute = navigationRef.getCurrentRoute();
      const routeName = (currentRoute as any)?.name || '';

      // Only specific detail / hero screens are allowed to have a blue status bar
      const isBlueHeaderScreen =
        routeName === 'CompanyProfile' ||
        routeName === 'CandidateJobDetail' ||
        routeName === 'JobDetail' ||
        routeName === 'JobDetails' ||
        routeName === 'CompanyDetails';

      const isAuthDarkScreen =
        routeName === 'EmployerLogin' ||
        routeName === 'EmployerSignup';

      if (Platform.OS === 'android') {
        if (isBlueHeaderScreen) {
          RNStatusBar.setBackgroundColor('#0A58E2', true);
          RNStatusBar.setBarStyle('light-content', true);
          RNStatusBar.setTranslucent(true);
        } else if (routeName === 'ContinueAs' || routeName === 'EmployerLogin') {
          RNStatusBar.setBackgroundColor('transparent', true);
          RNStatusBar.setBarStyle('dark-content', true);
          RNStatusBar.setTranslucent(true);
        } else if (isAuthDarkScreen) {
          RNStatusBar.setBackgroundColor('#0F172A', true);
          RNStatusBar.setBarStyle('light-content', true);
          RNStatusBar.setTranslucent(false);
        } else {
          RNStatusBar.setBackgroundColor('#FFFFFF', true);
          RNStatusBar.setBarStyle('dark-content', true);
          RNStatusBar.setTranslucent(false);
        }
      }
    } catch (_) {}
  };

  if (isMaintenanceActive) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar style="dark" />
        <MaintenanceModal
          visible={true}
          platformName={platformName}
          logoUrl={logoUrl}
          supportEmail={supportEmail}
          contactNumber={contactNumber}
          onRefresh={refreshSettings}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        onStateChange={handleStateChange}
      >
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
      <NoInternetScreen />
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          isLoadingAuth={!isReady}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NetworkProvider>
          <BackendStatusProvider>
            <ToastProvider>
              <AuthProvider>
                <MainAppContent />
              </AuthProvider>
            </ToastProvider>
          </BackendStatusProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
