import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/components/common/SplashScreen';
import { useAuth } from './src/hooks/useAuth';

function MainAppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { isLoading: isLoadingAuth } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
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
