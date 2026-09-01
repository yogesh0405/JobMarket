import { NativeModules } from 'react-native';

export const getDevApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  // In standalone production release builds (APK), always target the production live backend URL
  if (!__DEV__) {
    return envUrl || 'https://jobmarket-ongn.onrender.com';
  }
  // If explicitly overridden in dev to point to production or custom server
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  // In local development, extract host IP dynamically from Metro scriptURL (e.g. http://192.168.0.103:8081/index.bundle)
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^:/]+)/);
    const host = match ? match[1] : null;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5000`;
    }
  }
  return envUrl || 'https://jobmarket-ongn.onrender.com';
};

// CANONICAL BACKEND API URL (auto-resolves local LAN host during dev, falls back to live server)
export const API_BASE_URL = getDevApiBaseUrl();
