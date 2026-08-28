import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
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
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/components/common/SplashScreen';
import { useAuth } from './src/hooks/useAuth';

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
  const { isLoading: isLoadingAuth } = useAuth();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  // Keep splash visible while fonts + auth are loading
  const isReady = fontsLoaded && !isLoadingAuth;

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer linking={linking}>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
      {(showSplash || !fontsLoaded) && (
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
      <ToastProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
