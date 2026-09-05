import React, { useState, useEffect } from 'react';
import { View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  LinkingOptions,
  useNavigationContainerRef,
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
import { BackendStatusBanner } from './src/components/common/BackendStatusBanner';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/components/common/SplashScreen';
import { MaintenanceModal } from './src/components/common/MaintenanceModal';
import { useAuth } from './src/hooks/useAuth';
import { usePlatformSettings } from './src/hooks/usePlatformSettings';

// Initialize OAuth browser session interception
WebBrowser.maybeCompleteAuthSession();

// Industry-Standard Deep Linking & Universal Link Configuration
const linking: LinkingOptions<any> = {
  prefixes: [
    'https://job-market-wine.vercel.app',
    'http://job-market-wine.vercel.app',
    'https://jobmarket-ongn.onrender.com',
    'http://jobmarket-ongn.onrender.com',
    'jobmarket://',
    'exp://',
  ],
  config: {
    screens: {
      CandidateJobDetail: 'job/:jobId',
      VerifyOTP: 'verify-otp',
      CandidateProfile: 'candidate-profile',
      CompanyProfile: 'company-profile',
      EmployerDashboard: 'employer-dashboard',
      JobApplicants: 'job-applicants/:jobId',
    },
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

  // Splash screen duration: exactly 2.0 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
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

  const isReady = (fontsLoaded || !!fontError) && !isLoadingAuth;

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
      <BackendStatusBanner />
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
    <SafeAreaProvider>
      <BackendStatusProvider>
        <ToastProvider>
          <AuthProvider>
            <MainAppContent />
          </AuthProvider>
        </ToastProvider>
      </BackendStatusProvider>
    </SafeAreaProvider>
  );
}
