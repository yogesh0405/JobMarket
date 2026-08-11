import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/components/common/SplashScreen';
import { useAuth } from './src/hooks/useAuth';

// Deep Linking Configuration for Shared Job & Platform URLs
const linking: LinkingOptions<any> = {
  prefixes: ['jobmarket://', 'https://jobmarket-ongn.onrender.com'],
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

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer linking={linking}>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          isLoadingAuth={isLoadingAuth}
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
